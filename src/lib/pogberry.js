export function createPogberryRuntime() {
  let worker
  let sequence = 0
  let disposed = false
  const pending = new Map()
  const listeners = new Set()

  const emit = (event) => listeners.forEach((listener) => listener(event))

  const destroy = (error = new Error('The Pogberry VM was stopped.')) => {
    const active = worker
    worker = undefined
    active?.terminate()
    for (const task of pending.values()) {
      clearTimeout(task.timer)
      task.reject(error)
    }
    pending.clear()
  }

  const ensureWorker = () => {
    if (disposed) throw new Error('This Pogberry VM session has ended.')
    if (worker) return worker

    const active = new Worker('/runtime/worker.js', { type: 'module' })
    worker = active
    active.onmessage = ({ data }) => {
      if (data.type === 'ready' || data.type === 'missing') emit(data)
      if (!data.id) return
      const task = pending.get(data.id)
      if (!task) return
      clearTimeout(task.timer)
      pending.delete(data.id)
      if (['result', 'game-started', 'game-frame'].includes(data.type)) task.resolve(data)
      else task.reject(new Error(data.message || 'The VM stopped unexpectedly.'))
    }
    active.onerror = () => {
      const error = new Error('The Pogberry WebAssembly runtime could not be loaded.')
      emit({ type: 'missing', message: error.message })
      destroy(error)
    }
    active.postMessage({ type: 'warm' })
    return active
  }

  const request = (type, payload = {}, timeout = 4000) => {
    const active = ensureWorker()
    const id = ++sequence
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!pending.has(id)) return
        destroy(new Error('Execution stopped after four seconds. Check the game loop.'))
      }, timeout)
      pending.set(id, { resolve, reject, timer })
      active.postMessage({ type, id, ...payload })
    })
  }

  return {
    onStatus(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    warm() { ensureWorker() },
    run(source, files = {}, entry = 'main.pb') {
      return request('run', { source, files, entry })
    },
    startGame(source, files = {}, entry = 'main.pb') {
      return request('game-start', { source, files, entry })
    },
    frame(dt = 1 / 60) {
      return request('game-frame', { dt }, 1000)
    },
    setKey(key, down) {
      if (!disposed) ensureWorker().postMessage({ type: 'game-key', key, down })
    },
    stopGame() {
      worker?.postMessage({ type: 'game-stop' })
    },
    dispose() {
      disposed = true
      listeners.clear()
      destroy()
    }
  }
}

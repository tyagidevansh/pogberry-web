let vmPromise

async function getVm() {
  if (!vmPromise) vmPromise = import('/runtime/pogberry.js').then(({ default: createPogberry }) => createPogberry({ locateFile: (path) => `/runtime/${path}` }))
  return vmPromise
}

function loadModules(vm, files = {}, entry = 'main.pb') {
  vm.ccall('pb_web_clear_modules', null, [], [])
  for (const [path, source] of Object.entries(files)) {
    if (path === entry || !path.endsWith('.pb')) continue
    vm.ccall('pb_web_add_module', 'number', ['string', 'string'], [path.slice(0, -3), source])
  }
}

function collect(vm, result, extra = {}) {
  return { result, output: vm.UTF8ToString(vm._pb_web_output()), diagnostics: vm.UTF8ToString(vm._pb_web_diagnostics()), ...extra }
}

self.onmessage = async ({ data }) => {
  if (data.type === 'warm') {
    try { await getVm(); self.postMessage({ type: 'ready' }) }
    catch (error) { self.postMessage({ type: 'missing', message: error.message }) }
    return
  }
  try {
    const vm = await getVm()
    if (data.type === 'run') {
      loadModules(vm, data.files, data.entry)
      const result = vm.ccall('pb_web_run', 'number', ['string'], [data.source])
      self.postMessage({ type: 'result', id: data.id, ...collect(vm, result) })
    } else if (data.type === 'game-start') {
      vm.ccall('pb_web_game_stop', null, [], [])
      loadModules(vm, data.files, data.entry)
      const result = vm.ccall('pb_web_game_start', 'number', ['string'], [data.source])
      self.postMessage({ type: 'game-started', id: data.id, ...collect(vm, result) })
    } else if (data.type === 'game-frame') {
      const result = vm.ccall('pb_web_game_frame', 'number', ['number'], [data.dt])
      self.postMessage({ type: 'game-frame', id: data.id, ...collect(vm, result, { commands: vm.UTF8ToString(vm._pb_web_commands()) }) })
    } else if (data.type === 'game-key') {
      vm.ccall('pb_web_set_key', null, ['string', 'number'], [data.key, data.down ? 1 : 0])
    } else if (data.type === 'game-stop') {
      vm.ccall('pb_web_game_stop', null, [], [])
    }
  } catch (error) { self.postMessage({ type: 'crash', id: data.id, message: error.message }) }
}

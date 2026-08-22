import { useEffect, useMemo, useRef, useState } from 'react'
import { gameProjects } from './data'
import { highlight } from './components'
import { createPogberryRuntime } from './lib/pogberry'

const keyNames = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ' ': 'space' }
const gameKeys = ['left', 'right', 'up', 'down', 'space']

function hexText(value) {
  const bytes = new Uint8Array(value.match(/.{1,2}/g)?.map((pair) => parseInt(pair, 16)) || [])
  return new TextDecoder().decode(bytes)
}

function renderCommands(canvas, source) {
  const context = canvas?.getContext('2d')
  if (!context) return
  for (const line of source.trim().split('\n')) {
    if (!line) continue
    const parts = line.split(' ')
    const name = parts.shift()
    const values = parts.map(Number)
    if (name === 'clear') {
      context.fillStyle = `rgb(${values[0]},${values[1]},${values[2]})`
      context.fillRect(0, 0, 640, 360)
    } else if (name === 'rect') {
      context.fillStyle = `rgb(${values[4]},${values[5]},${values[6]})`
      context.fillRect(values[0], values[1], values[2], values[3])
    } else if (name === 'circle') {
      context.fillStyle = `rgb(${values[3]},${values[4]},${values[5]})`
      context.beginPath(); context.arc(values[0], values[1], values[2], 0, Math.PI * 2); context.fill()
    } else if (name === 'text') {
      const encoded = parts.pop()
      context.fillStyle = `rgb(${values[3]},${values[4]},${values[5]})`
      context.font = `600 ${values[2]}px "DM Mono", monospace`
      context.textBaseline = 'top'
      context.fillText(hexText(encoded), values[0], values[1])
    }
  }
}

function ProjectTree({ files, folders, active, onOpen }) {
  const root = { directories: {}, files: [] }
  const directory = (parts) => parts.reduce((node, name) => (node.directories[name] ||= { directories: {}, files: [] }), root)
  for (const path of folders) directory(path.split('/').filter(Boolean))
  for (const path of Object.keys(files)) {
    const parts = path.split('/')
    directory(parts.slice(0, -1)).files.push(path)
  }
  const renderNode = (node, prefix = '') => <>
    {node.files.sort().map((path) => <button key={path} className={active === path ? 'active' : ''} onClick={() => onOpen(path)}><span className="file-glyph">{path.endsWith('.pb') ? 'pb' : 'txt'}</span>{path.split('/').at(-1)}</button>)}
    {Object.entries(node.directories).sort(([a], [b]) => a.localeCompare(b)).map(([name, child]) => <details className="tree-folder" key={`${prefix}/${name}`} open><summary><span>›</span>{name}</summary><div className="tree-children">{renderNode(child, `${prefix}/${name}`)}</div></details>)}
  </>
  return <div className="project-tree-list">{renderNode(root)}</div>
}

function savedProject(storageKey, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey))
    return saved && typeof saved === 'object' && Object.keys(saved).length ? saved : fallback
  } catch {
    return fallback
  }
}

export function GameCanvas({ canvasRef, status, running, onKeyDown, onKeyUp, onBlur, onControl }) {
  const control = (name, down) => (event) => { event.preventDefault(); onControl?.(name, down) }
  return <div className="game-output-stage">
    <div className="game-stage-bar"><span>GAME</span><b>640 × 360</b><i className={running ? 'live' : ''}>{running ? 'running' : status}</i></div>
    <div className="canvas-wrap">
      <div className="canvas-frame"><canvas ref={canvasRef} width="640" height="360" tabIndex="0" onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={onBlur} aria-label="Running Pogberry game" />{!running && <div className="canvas-state"><b>{status === 'error' ? 'Could not run this project' : status === 'starting' || status.includes('loading') ? 'Starting the VM…' : 'Run the project to start'}</b>{status === 'error' && <span>Open the terminal or error message for details.</span>}</div>}</div>
      <div className="game-touch-controls" aria-label="Touch game controls"><button aria-label="Move left" onPointerDown={control('left', true)} onPointerUp={control('left', false)} onPointerLeave={control('left', false)} onPointerCancel={control('left', false)}>←</button><button aria-label="Move up" onPointerDown={control('up', true)} onPointerUp={control('up', false)} onPointerLeave={control('up', false)} onPointerCancel={control('up', false)}>↑</button><button aria-label="Move down" onPointerDown={control('down', true)} onPointerUp={control('down', false)} onPointerLeave={control('down', false)} onPointerCancel={control('down', false)}>↓</button><button aria-label="Move right" onPointerDown={control('right', true)} onPointerUp={control('right', false)} onPointerLeave={control('right', false)} onPointerCancel={control('right', false)}>→</button></div>
      <p>Focus the game, then use arrow keys or WASD.</p>
    </div>
  </div>
}

export function LiveGame({ project, autoPlay = true }) {
  const canvasRef = useRef(null)
  const sessionRef = useRef(null)
  const runVersion = useRef(0)
  const animationRef = useRef(0)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const start = async (providedSession = sessionRef.current) => {
    if (!providedSession) return
    const version = ++runVersion.current
    cancelAnimationFrame(animationRef.current)
    providedSession.stopGame()
    setRunning(false); setError(''); setStatus('starting')
    try {
      const result = await providedSession.startGame(project.files[project.entry], project.files, project.entry)
      if (version !== runVersion.current || sessionRef.current !== providedSession) return
      if (result.result !== 0) { setError(result.diagnostics); setStatus('error'); return }
      setRunning(true); setStatus('ready')
      let last = performance.now()
      const frame = async (now) => {
        if (version !== runVersion.current || sessionRef.current !== providedSession) return
        try {
          const frameResult = await providedSession.frame(Math.min((now - last) / 1000, .05)); last = now
          if (version !== runVersion.current || sessionRef.current !== providedSession) return
          if (frameResult.result !== 0) { setError(frameResult.diagnostics); setStatus('error'); setRunning(false); return }
          renderCommands(canvasRef.current, frameResult.commands)
          animationRef.current = requestAnimationFrame(frame)
        } catch (cause) {
          if (version === runVersion.current && sessionRef.current === providedSession) {
            setError(cause.message); setStatus('error'); setRunning(false)
          }
        }
      }
      animationRef.current = requestAnimationFrame(frame)
    } catch (cause) {
      if (version === runVersion.current && sessionRef.current === providedSession) {
        setError(cause.message); setStatus('error')
      }
    }
  }

  useEffect(() => {
    const session = createPogberryRuntime()
    sessionRef.current = session
    const unsubscribe = session.onStatus((event) => {
      if (sessionRef.current !== session) return
      if (event.type === 'ready' && !autoPlay) setStatus('ready')
      if (event.type === 'missing') { setError(event.message); setStatus('error') }
    })
    const releaseKeys = () => gameKeys.forEach((name) => session.setKey(name, false))
    window.addEventListener('blur', releaseKeys)
    session.warm()
    if (autoPlay) start(session)
    return () => {
      runVersion.current++
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('blur', releaseKeys)
      unsubscribe()
      session.dispose()
      if (sessionRef.current === session) sessionRef.current = null
    }
  }, [project, autoPlay])

  const key = (event, down) => {
    const name = keyNames[event.key]
    if (name) { event.preventDefault(); sessionRef.current?.setKey(name, down) }
  }
  const releaseKeys = () => gameKeys.forEach((name) => sessionRef.current?.setKey(name, false))
  return <div className="live-game"><GameCanvas canvasRef={canvasRef} status={status} running={running} onKeyDown={(event) => key(event, true)} onKeyUp={(event) => key(event, false)} onBlur={releaseKeys} onControl={(name, down) => sessionRef.current?.setKey(name, down)} />{error && <pre>{error}</pre>}<div className="live-game-controls"><button onClick={() => start()}>{running ? 'restart' : 'run game'}</button><span>{project.controls}</span></div></div>
}

export default function PogberryStudio({ project = gameProjects.firstGame, compact = false, storageKey = 'pogberry-project-v2' }) {
  const initialFiles = compact ? project.files : savedProject(storageKey, project.files)
  const [files, setFiles] = useState(initialFiles)
  const [folders, setFolders] = useState(new Set(['game']))
  const [active, setActive] = useState(project.entry)
  const [tabs, setTabs] = useState([project.entry])
  const [panel, setPanel] = useState('game')
  const [mobilePane, setMobilePane] = useState('code')
  const [output, setOutput] = useState('')
  const [runtime, setRuntime] = useState('loading VM')
  const [running, setRunning] = useState(false)
  const canvasRef = useRef(null)
  const importRef = useRef(null)
  const sessionRef = useRef(null)
  const runVersion = useRef(0)

  const source = files[active] ?? ''
  const lineNumbers = useMemo(() => Array.from({ length: source.split('\n').length }, (_, index) => index + 1).join('\n'), [source])
  useEffect(() => {
    const session = createPogberryRuntime()
    sessionRef.current = session
    const unsubscribe = session.onStatus((event) => {
      if (sessionRef.current === session) setRuntime(event.type === 'ready' ? 'ready' : 'VM unavailable')
    })
    const releaseKeys = () => gameKeys.forEach((name) => session.setKey(name, false))
    window.addEventListener('blur', releaseKeys)
    session.warm()
    return () => {
      runVersion.current++
      window.removeEventListener('blur', releaseKeys)
      unsubscribe()
      session.dispose()
      if (sessionRef.current === session) sessionRef.current = null
    }
  }, [])
  useEffect(() => { if (!compact) localStorage.setItem(storageKey, JSON.stringify(files)) }, [files, compact, storageKey])

  useEffect(() => {
    if (!running) return
    let cancelled = false
    let last = performance.now()
    const session = sessionRef.current
    const frame = async (now) => {
      if (cancelled) return
      try {
        const result = await session.frame(Math.min((now - last) / 1000, .05))
        last = now
        if (cancelled) return
        if (result.result !== 0) { setOutput(result.diagnostics); setRunning(false); setPanel('terminal'); return }
        renderCommands(canvasRef.current, result.commands)
        if (result.output) setOutput(result.output)
        requestAnimationFrame(frame)
      } catch (error) { setOutput(error.message); setRunning(false); setPanel('terminal') }
    }
    const request = requestAnimationFrame(frame)
    return () => { cancelled = true; cancelAnimationFrame(request) }
  }, [running])

  const openFile = (path) => { setActive(path); setTabs((current) => current.includes(path) ? current : [...current, path]); setMobilePane('code') }
  const updateSource = (value) => setFiles((current) => ({ ...current, [active]: value }))
  const closeTab = (path) => {
    const next = tabs.filter((tab) => tab !== path)
    setTabs(next)
    if (path === active) setActive(next.at(-1) || Object.keys(files)[0])
  }
  const addFile = () => {
    const path = window.prompt('New file path', 'new_file.pb')?.trim()
    if (!path || files[path]) return
    setFiles((current) => ({ ...current, [path]: path.endsWith('.pb') ? '// New Pogberry file\n' : '' }))
    if (path.includes('/')) setFolders((current) => new Set([...current, path.split('/')[0]]))
    openFile(path)
  }
  const addFolder = () => {
    const name = window.prompt('New folder name', 'game')?.trim().replace(/^\/+|\/+$/g, '')
    if (name) setFolders((current) => new Set([...current, name]))
  }
  const renameFile = () => {
    const path = window.prompt('Rename file', active)?.trim()
    if (!path || path === active || files[path]) return
    setFiles((current) => { const next = { ...current, [path]: current[active] }; delete next[active]; return next })
    setTabs((current) => current.map((tab) => tab === active ? path : tab)); setActive(path)
  }
  const deleteFile = () => {
    if (Object.keys(files).length === 1 || !window.confirm(`Delete ${active}?`)) return
    const nextPath = Object.keys(files).find((path) => path !== active)
    setFiles((current) => { const next = { ...current }; delete next[active]; return next })
    setTabs((current) => current.filter((tab) => tab !== active)); setActive(nextPath)
  }
  const newProject = () => {
    if (!window.confirm('Replace the current browser project with a blank project?')) return
    const blank = { 'main.pb': '// main.pb\n\nprint("Hello from Pogberry.");\n' }
    runVersion.current++; sessionRef.current?.stopGame(); setRunning(false); setFiles(blank); setFolders(new Set()); setTabs(['main.pb']); setActive('main.pb'); setOutput(''); setPanel('terminal'); setMobilePane('preview')
  }
  const exportProject = () => {
    const blob = new Blob([JSON.stringify({ format: 'pogberry-browser-project', files }, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob); link.download = 'pogberry-project.json'; link.click(); URL.revokeObjectURL(link.href)
  }
  const importProject = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const projectFile = JSON.parse(await file.text())
      if (!projectFile.files || !projectFile.files['main.pb']) throw new Error('The project must contain main.pb.')
      setFiles(projectFile.files); setTabs(['main.pb']); setActive('main.pb'); setOutput(''); setPanel('game'); setMobilePane('code')
    } catch (error) { setOutput(`Could not import project: ${error.message}`); setPanel('terminal'); setMobilePane('preview') }
    event.target.value = ''
  }
  const stop = () => { runVersion.current++; sessionRef.current?.stopGame(); setRunning(false); setRuntime('stopped') }
  const run = async () => {
    const session = sessionRef.current
    if (!session) return
    const version = ++runVersion.current
    session.stopGame(); setRunning(false); setOutput(''); setRuntime('starting')
    const entry = files['main.pb'] ? 'main.pb' : active
    const entrySource = files[entry]
    const game = entrySource.includes('engine.graphics') && entrySource.includes('fun draw')
    try {
      if (game) {
        const result = await session.startGame(entrySource, files, entry)
        if (version !== runVersion.current || sessionRef.current !== session) return
        if (result.result !== 0) { setOutput(result.diagnostics); setPanel('terminal'); setMobilePane('preview'); setRuntime('error'); return }
        setOutput(result.output); setPanel('game'); setMobilePane('preview'); setRuntime('ready'); setRunning(true)
        requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }))
      } else {
        const result = await session.run(entrySource, files, entry)
        if (version !== runVersion.current || sessionRef.current !== session) return
        setOutput(`${result.output}${result.diagnostics ? `${result.output ? '\n' : ''}${result.diagnostics}` : ''}`)
        setPanel('terminal'); setMobilePane('preview'); setRuntime(result.result === 0 ? 'finished' : 'error')
      }
    } catch (error) {
      if (version === runVersion.current && sessionRef.current === session) { setOutput(error.message); setPanel('terminal'); setRuntime('error') }
    }
  }
  const key = (event, down) => {
    const name = keyNames[event.key]
    if (!name) return
    event.preventDefault(); sessionRef.current?.setKey(name, down)
  }
  const releaseKeys = () => gameKeys.forEach((name) => sessionRef.current?.setKey(name, false))
  const editorKeyDown = (event) => {
    if (event.key !== 'Tab') return
    event.preventDefault()
    const start = event.currentTarget.selectionStart
    const end = event.currentTarget.selectionEnd
    updateSource(source.slice(0, start) + '  ' + source.slice(end))
    requestAnimationFrame(() => { event.currentTarget.selectionStart = event.currentTarget.selectionEnd = start + 2 })
  }
  const syncEditorScroll = (event) => {
    const layer = event.currentTarget.previousElementSibling
    layer.scrollTop = event.currentTarget.scrollTop
    layer.scrollLeft = event.currentTarget.scrollLeft
  }

  return <div className={`studio${compact ? ' compact' : ''}`}>
    <div className="studio-topbar"><div className="studio-project-name"><span className="berry-mini">●</span><b>my-pogberry-game</b><small>browser project</small><div className="project-menu"><button onClick={newProject}>New</button><button onClick={() => importRef.current?.click()}>Import</button><button onClick={exportProject}>Export</button><input ref={importRef} type="file" accept="application/json,.json" onChange={importProject} hidden /></div></div><div className="studio-run-actions"><span className={`runtime-light ${runtime}`}>{runtime}</span>{running && <button className="studio-stop" onClick={stop}>■ Stop</button>}<button className="button run" onClick={run}>▶ Run</button></div></div>
    <nav className="mobile-pane-tabs" aria-label="Editor panels"><button className={mobilePane === 'project' ? 'active' : ''} onClick={() => setMobilePane('project')}>Project</button><button className={mobilePane === 'code' ? 'active' : ''} onClick={() => setMobilePane('code')}>Code</button><button className={mobilePane === 'preview' ? 'active' : ''} onClick={() => setMobilePane('preview')}>Game / output</button></nav>
    <div className="studio-grid">
      <aside className={`project-tree${mobilePane === 'project' ? ' mobile-active' : ''}`}><div className="pane-title"><span>PROJECT</span><div><button onClick={addFile}>＋ File</button><button onClick={addFolder}>＋ Folder</button></div></div><ProjectTree files={files} folders={folders} active={active} onOpen={openFile} /><div className="tree-actions"><button onClick={renameFile}>Rename file</button><button onClick={deleteFile}>Delete file</button></div></aside>
      <section className={`studio-editor${mobilePane === 'code' ? ' mobile-active' : ''}`}><div className="editor-tabs">{tabs.map((path) => <button key={path} className={active === path ? 'active' : ''} onClick={() => setActive(path)}><span>{path.endsWith('.pb') ? 'pb' : 'txt'}</span>{path.split('/').at(-1)}<i onClick={(event) => { event.stopPropagation(); closeTab(path) }}>×</i></button>)}</div><div className="studio-editor-body"><div className="line-numbers">{lineNumbers}</div><div className="editor-stack"><pre aria-hidden="true"><code dangerouslySetInnerHTML={{ __html: `${highlight(source)}\n` }} /></pre><textarea value={source} onChange={(event) => updateSource(event.target.value)} onKeyDown={editorKeyDown} onScroll={syncEditorScroll} spellCheck="false" aria-label={`Editing ${active}`} /></div></div></section>
      <section className={`studio-preview${mobilePane === 'preview' ? ' mobile-active' : ''}`}><div className="preview-tabs"><button className={panel === 'game' ? 'active' : ''} onClick={() => setPanel('game')}>Game</button><button className={panel === 'terminal' ? 'active' : ''} onClick={() => setPanel('terminal')}>Terminal{output && <i />}</button></div>{panel === 'game' ? <GameCanvas canvasRef={canvasRef} running={running} status={runtime} onKeyDown={(event) => key(event, true)} onKeyUp={(event) => key(event, false)} onBlur={releaseKeys} onControl={(name, down) => sessionRef.current?.setKey(name, down)} /> : <div className="studio-terminal"><div><span>OUTPUT</span><button onClick={() => setOutput('')}>clear</button></div><pre>{output || 'Run the project to see output and diagnostics.'}</pre></div>}</section>
    </div>
    <div className="studio-status"><span>main: {active}</span><span>{source.split('\n').length} lines</span><span>Pogberry · WebAssembly</span></div>
  </div>
}

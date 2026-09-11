import { useState } from 'react'
import { PageHero } from '../components'
import { installOptions, repoUrl } from '../data'

export default function Download() {
  const [os, setOs] = useState('linux')
  const [copied, setCopied] = useState(false)
  const option = installOptions[os]
  const copy = async () => { await navigator.clipboard.writeText(option.command); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  return <>
    <PageHero eyebrow="DOWNLOAD AND BUILD" title="Install Pogberry" italic="or embed the VM." text="Build the command-line interpreter, compile the shared library for a custom host, or build the WebAssembly runtime used by this site." tone="yellow"><div className="hero-actions"><a className="button dark" href="#install">Choose a platform ↓</a><a className="text-link" href={repoUrl} target="_blank" rel="noreferrer">Browse source ↗</a></div></PageHero>
    <section className="section shell" id="install"><div className="download-heading"><div><p className="eyebrow">INSTALLATION</p><h2>Build instructions</h2></div><div className="version-stamp"><span>PB</span><strong>2.0</strong><small>IN DEVELOPMENT</small></div></div>
      <div className="install-card reveal"><div className="os-tabs" role="tablist">{Object.entries(installOptions).map(([key, item]) => <button key={key} role="tab" aria-selected={os === key} onClick={() => setOs(key)}>{item.label}</button>)}</div><div className="install-body"><div className="install-copy"><span className="install-label">{option.label.toUpperCase()}</span><h3>{option.title}</h3><p>{option.text}</p><div className="requirements"><span>Requires</span>{option.requires.map((item) => <code key={item}>{item}</code>)}</div><p className="install-tip"><b>PATH:</b> A user install places the executable in <code>~/.local/bin</code>. Add that directory to your shell PATH if <code>pb</code> is not found.</p></div><div className="terminal"><div className="terminal-bar"><span /><span /><span /><b>terminal</b><button onClick={copy}>{copied ? 'copied!' : 'copy all'}</button></div><pre><code>{option.command}</code></pre></div></div><div className="first-run"><span>Run a project directory:</span><code>pb run path/to/project</code><span>or run a single file:</span><code>pb run path/to/file.pb</code></div></div>
    </section>
    <section className="download-promise"><div className="shell"><article><span>01</span><h3>Raylib 2D game engine</h3><p>Build desktop games with windowing, shapes, audio, textures, and collisions.</p></article><article><span>02</span><h3>Embeddable C runtime</h3><p>Link the shared library directly into custom game engines and hosts.</p></article><article><span>03</span><h3>Runs in the browser</h3><p>Compile to WebAssembly for instant play, browser editing, and web distribution.</p></article></div></section>
  </>
}

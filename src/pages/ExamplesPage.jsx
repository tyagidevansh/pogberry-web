import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CodeBlock, PageHero } from '../components'
import { gameProjects } from '../data'
import { LiveGame } from '../studio'

export default function ExamplesPage() {
  const [selected, setSelected] = useState('firstGame')
  const project = gameProjects[selected]
  const [sourceFile, setSourceFile] = useState(project.entry)
  const choose = (key) => { setSelected(key); setSourceFile(gameProjects[key].entry) }
  return <>
    <PageHero eyebrow="PLAYABLE PROJECTS" title="Example games" italic="with complete source." text="Choose a project, play it in the browser, and inspect the Pogberry files that produce it." tone="pink" />
    <section className="examples-workbench shell">
      <nav className="example-picker" aria-label="Choose a game example">{Object.entries(gameProjects).map(([key, item]) => <button key={key} className={selected === key ? 'active' : ''} onClick={() => choose(key)}><span>{item.subtitle}</span><b>{item.title}</b><p>{item.description}</p><i>open →</i></button>)}</nav>
      <div className="example-player"><div className="example-player-head"><div><span>{project.subtitle}</span><h2>{project.title}</h2><p>{project.description}</p></div><div><b>CONTROLS</b><span>{project.controls}</span></div></div><LiveGame key={selected} project={project} /><div className="example-explanation"><h3>How it works</h3>{selected === 'firstGame' && <p>Module-level bindings store the berry’s position. <code>update(dt)</code> reads held keys, moves at a speed measured in pixels per second, and clamps the result to the window. <code>draw()</code> builds the frame from shapes and text. Speed and the reusable clamp function live in <code>game/config.pb</code>.</p>}{selected === 'bounce' && <p>The ball has an x/y position and an x/y velocity. Multiplying velocity by <code>dt</code> keeps motion consistent at different frame rates. Reversing one velocity component when a boundary is crossed produces the bounce.</p>}{selected === 'snake' && <p>Each segment is a two-item list containing a grid position. Input changes the direction, each step inserts a new head, and a normal move removes the tail. Reaching food keeps the extra segment and updates the score.</p>}{selected === 'orbit' && <p>The basket and falling berry are ordinary numeric state. Update handles movement, collision rules, resets, and scoring. Draw only reads that state to render the current frame and score text.</p>}</div></div>
    </section>
    <section className="example-source-section"><div className="shell"><div className="example-source-head"><div><p className="eyebrow">PROJECT SOURCE</p><h2>Read every file</h2></div><div className="source-file-tabs">{Object.keys(project.files).filter((path) => path.endsWith('.pb')).map((path) => <button key={path} className={sourceFile === path ? 'active' : ''} onClick={() => setSourceFile(path)}>{path}</button>)}</div></div><CodeBlock code={project.files[sourceFile]} title={sourceFile} /><div className="example-next"><p>Open this project in the editor to change values, add modules, or replace it with your own game.</p><Link className="button primary" to="/playground">Open the editor →</Link></div></div></section>
  </>
}

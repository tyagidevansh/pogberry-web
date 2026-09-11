import { Link } from 'react-router-dom'
import { BerryMark, PageHero } from '../components'

const systems = [
  ['core language', 'Lexical scope, closures, classes, lists, maps, source modules, and fast opcode execution.', '✓'],
  ['standard library', 'Built-in std.math with mathematical constants and arithmetic operations.', '✓'],
  ['pb_gui (Raylib)', 'Windowing, shapes, text, keyboard & mouse input, 2D collisions, textures, and audio.', '✓'],
  ['web runtime', 'WebAssembly execution via background Web Worker with HTML5 Canvas draw commands.', '✓'],
  ['portable engine modules', 'Standardizing host-agnostic engine.graphics, engine.input, and engine.audio surfaces.', '▧'],
  ['opaque host resources', 'Safe handle lifecycle, finalizers, and garbage-collected GPU/audio objects.', '◉'],
  ['custom shaders & cameras', '2D camera viewport controls, render textures, and custom fragment shaders.', '↝'],
  ['packaging & distribution', 'Project bundler, asset archiver, and standalone single-binary game distribution.', '</>']
]

export default function Roadmap() {
  return <>
    <PageHero eyebrow="ARCHITECTURE AND DIRECTION" title="How Pogberry" italic="fits together." text="The system is divided into a language core, a C host interface, engine modules, and the game project that uses them." tone="purple" />
    <section className="section shell architecture"><div className="architecture-copy"><p className="eyebrow">RUNTIME ARCHITECTURE</p><h2>Four execution layers</h2><p>The host owns windows, devices, files, and the clock. Pogberry code accesses those services through registered modules. The core VM remains independent from any renderer or operating system.</p></div><div className="layer-cake reveal"><div><span>04</span><b>YOUR GAME</b><small>scripts + assets</small></div><div><span>03</span><b>ENGINE & STDLIB</b><small>pb_gui · std.math · Raylib</small></div><div><span>02</span><b>HOST INTERFACE</b><small>C API · capabilities · diagnostics</small></div><div><span>01</span><b>POGBERRY CORE</b><small>compiler · bytecode · VM · GC</small></div></div></section>
    <section className="section systems-section"><div className="shell"><div className="split-heading"><div><p className="eyebrow">MODULES AND TOOLING</p><h2>Game-facing systems</h2></div><p>The language core is usable on its own. A full game host adds the optional engine modules and tools listed below.</p></div><div className="system-grid">{systems.map(([name, desc, icon], index) => <article key={name} className="reveal"><span>{icon}</span><small>{String(index + 1).padStart(2,'0')}</small><h3>{name}</h3><p>{desc}</p></article>)}</div></div></section>
    <section className="section host-story"><div className="shell"><div className="host-orbit reveal"><div className="host-core"><BerryMark big /><strong>PB VM</strong></div><span className="host-pill raylib">Raylib</span><span className="host-pill web">Web</span><span className="host-pill sdl">SDL</span><span className="host-pill custom">Your engine</span></div><div><p className="eyebrow">BACKEND PORTABILITY</p><h2>Hosts implement the engine modules</h2><p>A backend registers the same game-facing capabilities for its platform. Scripts cannot open arbitrary native libraries or access operating-system services that the host did not provide.</p><Link className="button primary" to="/download">Build and embedding options →</Link></div></div></section>
    <section className="section values-section"><div className="shell"><p className="eyebrow">DESIGN REQUIREMENTS</p><h2>Constraints on the implementation</h2><div className="values-grid"><article><b>01</b><h3>Readable syntax</h3><p>Common game behavior should be expressible without annotations or framework setup.</p></article><article><b>02</b><h3>Runtime safety</h3><p>Invalid script input must produce a diagnostic rather than a host-process crash.</p></article><article><b>03</b><h3>Embeddable core</h3><p>The VM and public C API stay independent from the CLI and engine adapters.</p></article><article><b>04</b><h3>Capability boundary</h3><p>A script only receives filesystem, graphics, input, or audio access registered by its host.</p></article></div></div></section>
  </>
}

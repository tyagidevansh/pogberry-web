import { Link } from 'react-router-dom'
import { BerryMark, CodeBlock, PixelGame, SectionHead } from '../components'
import { gameProjects } from '../data'
import { LiveGame } from '../studio'

export default function Home() {
  return <>
    <section className="hero shell">
      <div className="hero-copy reveal">
        <p className="eyebrow"><span>PB</span> A scripting language for small games</p>
        <h1>Make little games.<br /><em>Have a lot of fun.</em></h1>
        <p className="hero-intro">Pogberry combines a readable dynamically typed language with a fast C bytecode interpreter, Raylib 2D game engine, collections, classes, modules, and a WebAssembly runtime.</p>
        <div className="hero-actions">
          <Link className="button primary" to="/playground">Open the browser editor <span>→</span></Link>
          <Link className="text-link" to="/learn">Read the documentation</Link>
        </div>
        <div className="proof-strip">
          <span><i className="status-dot" /> Fast C bytecode VM</span>
          <span>Raylib 2D engine</span>
          <span>WebAssembly browser host</span>
        </div>
      </div>
      <div className="hero-art reveal">
        <div className="sun-doodle" />
        <span className="hand-note note-one">Pogberry source</span>
        <div className="hero-code-card">
          <CodeBlock code={`use "engine.graphics";\n\nlet x = 36;\n\nfun update(dt) {\n  x = x + 80 * dt;\n}\n\nfun draw() {\n  graphics.clear(31, 28, 40);\n  graphics.rectangle(x, 120, 24, 24,\n    232, 79, 115);\n}`} title="main.pb" compact />
        </div>
        <span className="hand-note note-two">the rendered frame</span>
        <PixelGame />
      </div>
    </section>

    <div className="marquee">
      <div className="marquee-track">
        <span>FUNCTIONS</span><i>·</i><span>CLASSES</span><i>·</i><span>CLOSURES</span><i>·</i>
        <span>LISTS + MAPS</span><i>·</i><span>MODULES</span><i>·</i><span>GRAPHICS</span><i>·</i>
        <span>INPUT</span><i>·</i><span>FUNCTIONS</span><i>·</i><span>CLASSES</span><i>·</i>
        <span>CLOSURES</span><i>·</i><span>LISTS + MAPS</span><i>·</i><span>MODULES</span><i>·</i>
        <span>GRAPHICS</span><i>·</i><span>INPUT</span><i>·</i>
      </div>
    </div>

    <section className="section shell">
      <SectionHead number="01" label="the language" title="Small syntax." italic="Useful features." text="Pogberry is intended to be approachable without limiting projects to a single file or a single programming style." />
      <div className="feature-grid">
        <article className="feature-card lavender reveal">
          <div className="feature-icon braces">{'{ '}<i>♥</i>{' }'}</div>
          <h3>Functions, closures, and classes</h3>
          <p>Write straightforward functions, keep local state in closures, or organize game actors into classes with inheritance.</p>
          <code>let player = Player("Mira");</code>
        </article>
        <article className="feature-card coral reveal">
          <div className="feature-icon bolt">[ ]</div>
          <h3>Lists and ordered maps</h3>
          <p>Mutable collections include checked indexes, negative list indexes, structural equality, and familiar methods.</p>
          <code>inventory.push("potion");</code>
        </article>
        <article className="feature-card mint reveal">
          <div className="feature-icon blocks"><i /><i /><i /></div>
          <h3>Source modules</h3>
          <p>Split a project into folders and files. Modules have isolated globals and explicit exports.</p>
          <code>use "game/player";</code>
        </article>
        <article className="feature-card yellow reveal">
          <div className="feature-icon math">π <i>·</i> √</div>
          <h3>Standard math library</h3>
          <p>Built-in constants like π and e, plus fast utilities for clamping, rounding, square roots, min, and max.</p>
          <code>let angle = math.pi / 4;</code>
        </article>
        <article className="feature-card lavender reveal">
          <div className="feature-icon shapes">◆ ▧ ●</div>
          <h3>Raylib 2D game engine</h3>
          <p>Windowing, drawing shapes, spritesheets, text, keyboard and mouse input, collisions, and streaming audio.</p>
          <code>gui.drawCircle(x, y, 16, 232, 79, 115);</code>
        </article>
        <article className="feature-card mint reveal">
          <div className="feature-icon braces">{'('} <i>✓</i> {')'}</div>
          <h3>Checked runtime safety</h3>
          <p>Out-of-bounds guards, zero-division protection, and readable stack traces without crashing the host process.</p>
          <code>// [line 4] in divide(): Division by zero</code>
        </article>
      </div>
    </section>

    <section className="section playable-home">
      <div className="shell">
        <SectionHead inverse number="02" label="playable example" title="A Pogberry game" italic="running in the browser." text="The WebAssembly VM runs update and draw, the browser renders its graphics commands, and keyboard or touch input is sent back to the game." />
        <div className="playable-home-grid">
          <LiveGame project={gameProjects.firstGame} />
          <div className="playable-source">
            <CodeBlock code={gameProjects.firstGame.files['main.pb']} title="main.pb" compact />
            <Link className="button primary" to="/examples">More running examples →</Link>
          </div>
        </div>
      </div>
    </section>

    <section className="section game-kit">
      <div className="shell">
        <div className="kit-intro reveal">
          <p className="eyebrow"><span>03</span> 2D game engine</p>
          <h2>The parts a 2D game needs</h2>
          <p>Pogberry provides a complete 2D game library powered by Raylib: windowing, shapes, text, keyboard and mouse input, 2D collisions, sprite textures, sound effects, and streaming background music. Everything is accessible through <code>pb_gui</code>.</p>
          <Link className="text-link" to="/learn#gui">Explore the 2D game cheatsheet →</Link>
        </div>
        <div className="kit-map reveal">
          <div className="kit-core"><BerryMark big /><strong>YOUR<br />GAME</strong></div>
          <div className="orbit orbit-1" />
          <div className="orbit orbit-2" />
          <article className="kit-item graphics"><i>▧</i><div><strong>graphics</strong><span>rectangles · circles · text</span></div></article>
          <article className="kit-item input"><i>⌁</i><div><strong>input</strong><span>keys · mouse · wheel</span></div></article>
          <article className="kit-item audio"><i>♫</i><div><strong>audio</strong><span>sounds · streaming music</span></div></article>
          <article className="kit-item physics"><i>◉</i><div><strong>collisions</strong><span>rects · circles · points</span></div></article>
          <article className="kit-item files"><i>⌑</i><div><strong>textures</strong><span>sprites · spritesheets</span></div></article>
          <article className="kit-item hosts"><i>↝</i><div><strong>hosts</strong><span>Raylib · web wasm</span></div></article>
        </div>
      </div>
    </section>
  </>
}

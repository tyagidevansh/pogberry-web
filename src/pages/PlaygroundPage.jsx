import PogberryStudio from '../studio'

export default function PlaygroundPage() {
  return <>
    <section className="editor-intro"><div className="shell"><p className="eyebrow">BROWSER EDITOR</p><h1>Pogberry browser editor</h1><p>Edit a multi-file project and run it with the WebAssembly build of the Pogberry VM. Your files remain in this browser.</p><div><span>C VM · WebAssembly</span><span>640 × 360 game canvas</span><span>Local project storage</span></div></div></section>
    <section className="studio-page"><div className="studio-wide"><PogberryStudio /></div></section>
    <section className="editor-help shell"><h2>Editor reference</h2><div><article><span>FILES</span><h3>Project structure</h3><p><code>main.pb</code> is the entry point. A file such as <code>game/player.pb</code> is imported with <code>use "game/player";</code>. Create, rename, and remove files from the project panel.</p></article><article><span>GAME</span><h3>Graphics and input</h3><p>The browser host provides <code>engine.graphics</code> and <code>engine.input</code>. Run the starter project, focus the canvas, and move with the arrow keys, WASD, or the touch controls.</p></article><article><span>VM</span><h3>Execution and errors</h3><p>Source passes through Pogberry’s C scanner, compiler, bytecode VM, and garbage collector. Compile and runtime diagnostics appear in the terminal panel.</p></article></div></section>
  </>
}

import { Link } from 'react-router-dom'
import { CodeBlock, PageHero } from '../components'
import { gameProjects, consoleExamples } from '../data'
import { LiveGame } from '../studio'

const lifecycle = `use "engine.graphics";

let x = 40;

fun init() {
  // Load data and create the initial game state.
}

fun update(dt) {
  // dt is the elapsed time in seconds.
  x = x + 80 * dt;
  if (x > graphics.width()) x = -24;
}

fun draw() {
  graphics.clear(31, 28, 40);
  graphics.rectangle(x, 150, 24, 24, 232, 79, 115);
}`

const modules = `// game/player.pb
export class Player {
  init(name) {
    this.name = name;
    this.health = 100;
  }
}

// main.pb
use "game/player";

let hero = player.Player("Mira");
print(hero.health);`

export default function Learn() {
  return <>
    <PageHero eyebrow="DOCUMENTATION" title="Learn the language by" italic="building a game." text="This guide begins with ordinary Pogberry programs, then builds a multi-file game with state, input, and drawing." />
    <div className="manual-layout shell">
      <aside className="manual-nav"><strong>CONTENTS</strong><a href="#start">Start a project</a><a href="#language">Values and bindings</a><a href="#expressions">Strings and operators</a><a href="#prelude">Built-in functions</a><a href="#functions">Functions and control flow</a><a href="#collections">Lists and maps</a><a href="#classes">Classes</a><a href="#modules">Files and modules</a><a href="#games">The game lifecycle</a><a href="#graphics">Graphics</a><a href="#input">Input</a><a href="#project">Complete example</a><a href="#errors">Errors and diagnostics</a><a href="#later">Still to come</a></aside>
      <article className="manual">
        <section id="start"><p className="doc-section-label">GETTING STARTED</p><h2>Start a project</h2><p className="doc-lead">A Pogberry project is a directory containing a <code>main.pb</code> entry file. Run a project directory with the CLI or open the browser editor and press Run project.</p><CodeBlock code={`mkdir berry-game\ncd berry-game\nprintf 'print("Hello, Pogberry.");\\n' > main.pb\npb run`} title="terminal" /><div className="doc-callout"><b>In the browser</b><p>The editor already contains a complete project. Files are kept in local storage, so reloading the page does not discard your work.</p><Link to="/playground">Open the editor →</Link></div></section>

        <section id="language"><p className="doc-section-label">THE LANGUAGE</p><h2>Values and bindings</h2><p>Pogberry is dynamically typed. A binding can hold a number, string, Boolean, <code>nil</code>, list, map, function, class, instance, or module. Statements end with semicolons and <code>//</code> begins a line comment.</p><CodeBlock code={consoleExamples.hello} title="main.pb" /><div className="doc-table"><div><b>Declaration</b><b>Meaning</b></div><div><code>let score = 0;</code><span>A mutable binding. New code normally uses <code>let</code>.</span></div><div><code>var score = 0;</code><span>The older mutable spelling. It is also currently used in a <code>for</code> initializer.</span></div><div><code>nil</code><span>The absence of a value. Only <code>nil</code> and <code>false</code> are falsey.</span></div><div><code>str(value)</code><span>Converts a value explicitly before string concatenation.</span></div></div></section>

        <section id="expressions"><p className="doc-section-label">EXPRESSIONS</p><h2>Strings, numbers, and operators</h2><p>Numbers use double precision. Division by zero is a runtime error, and modulo requires finite integers. String concatenation only accepts two strings; convert other values with <code>str</code>.</p><div className="doc-table"><div><b>Operators</b><b>Behavior</b></div><div><code>() . []</code><span>Calls, properties, and indexing bind most tightly.</span></div><div><code>! -</code><span>Logical negation and numeric negation.</span></div><div><code>* / %</code><span>Multiplication, division, and integer modulo.</span></div><div><code>+ -</code><span>Numeric arithmetic; <code>+</code> also concatenates two strings.</span></div><div><code>&lt; &lt;= &gt; &gt;=</code><span>Numeric or string comparisons.</span></div><div><code>== !=</code><span>Value equality, including structural list and map equality.</span></div><div><code>and or</code><span>Short-circuit logic. These operators return an operand.</span></div><div><code>=</code><span>Assignment to a binding, field, list item, or map entry.</span></div></div><h3>String escapes and indexing</h3><p>Strings use double quotes and accept <code>\\</code>, <code>\"</code>, <code>\n</code>, <code>\r</code>, and <code>\t</code>. The current runtime permits string indexing with a finite integer, such as <code>name[0]</code>.</p></section>

        <section id="prelude"><p className="doc-section-label">BUILT-IN FUNCTIONS</p><h2>Functions available without an import</h2><div className="api-reference"><div><code>print(value, newline=true)</code><p>Write a value through the host output callback. Pass <code>newline=false</code> to keep the cursor on the same line.</p></div><div><code>len(value)</code><p>Return the length of a string, list, or map.</p></div><div><code>str(value)</code><p>Return Pogberry’s canonical string representation of a value.</p></div><div><code>type(value)</code><p>Return the stable runtime type name.</p></div><div><code>strInput(prompt)</code><p>Read one terminal line. It returns <code>nil</code> when input closes.</p></div><div><code>rand()</code><p>Return a random fraction, or use <code>rand(upperBound)</code> for an integer below a positive bound.</p></div><div><code>clock() / getTime()</code><p>Return host timing values. Games normally use the <code>dt</code> passed to <code>update</code> instead.</p></div></div></section>

        <section id="functions"><p className="doc-section-label">FUNCTIONS AND FLOW</p><h2>Put behavior into functions</h2><p>Functions are values. They can be stored, passed to another function, returned, and nested. A nested function keeps access to the surrounding locals it uses; that retained environment is a closure.</p><CodeBlock code={`fun damage(health, amount) {
  let remaining = health - amount;
  if (remaining < 0) return 0;
  return remaining;
}

for (var wave = 1; wave <= 3; wave = wave + 1) {
  print("Starting wave " + str(wave));
}`} /><h3>Control-flow statements</h3><p><code>if</code> and <code>else</code> choose a branch. <code>while</code> repeats while a condition remains true. <code>for</code> combines an initializer, condition, and increment. Use <code>break</code> to leave a loop. <code>and</code> and <code>or</code> short-circuit and return one of their operands.</p></section>

        <section id="collections"><p className="doc-section-label">COLLECTIONS</p><h2>Store game state in lists and maps</h2><p>Lists are ordered, mutable sequences. They support negative indexes, so <code>items[-1]</code> reads the final item. Maps retain insertion order and accept <code>nil</code>, Booleans, finite numbers, and strings as keys.</p><CodeBlock code={consoleExamples.collections} /><div className="api-columns"><div><h3>List operations</h3><code>push(value)</code><code>extend(list)</code><code>pop()</code><code>insert(index, value)</code><code>remove(value)</code><code>removeAt(index)</code><code>clear()</code><code>copy()</code><code>reverse()</code><code>sort()</code></div><div><h3>Map operations</h3><code>has(key)</code><code>get(key, default)</code><code>delete(key)</code><code>clear()</code><code>length</code><code>len(map)</code></div></div></section>

        <section id="classes"><p className="doc-section-label">CLASSES</p><h2>Represent actors and objects</h2><p>A class groups behavior into methods. Calling a class constructs an instance and invokes <code>init</code>. Fields are added dynamically through <code>this</code>. A class may inherit from one superclass and call overridden behavior through <code>super</code>.</p><CodeBlock code={consoleExamples.classes} title="actors.pb" /><p>Methods remain bound when extracted from an instance, which means <code>let speak = slime.speak; speak();</code> still uses the original slime as <code>this</code>.</p></section>

        <section id="modules"><p className="doc-section-label">PROJECTS</p><h2>Split a game into modules</h2><p>Imports are resolved from the project root. The name <code>"game/player"</code> maps to <code>game/player.pb</code>. Each source file has its own globals and only declarations marked with <code>export</code> are visible to another module.</p><CodeBlock code={modules} title="two-file project" /><p>A module executes once per VM and is cached. Imports must be at the top level. Circular imports and paths that escape the project directory are reported as normal load errors.</p></section>

        <section id="games" className="manual-game-section"><p className="doc-section-label">MAKING GAMES</p><h2>The host runs the game loop</h2><p className="doc-lead">A game defines lifecycle functions in <code>main.pb</code>. Pogberry’s host calls them at the appropriate time, which keeps windowing, input polling, and frame presentation outside your script. Imported modules use <code>export</code>; the project entry file does not.</p><CodeBlock code={lifecycle} title="main.pb" /><div className="lifecycle-table"><div><code>init()</code><p>Called once. Create initial state and load resources here.</p></div><div><code>update(dt)</code><p>Called before each rendered frame. Change positions, respond to input, and advance game rules here.</p></div><div><code>draw()</code><p>Called after update. Clear the screen and submit drawing commands here.</p></div><div><code>shutdown()</code><p>Called when the game closes. Save data or release explicit resources here.</p></div></div></section>

        <section id="graphics"><p className="doc-section-label">ENGINE.GRAPHICS</p><h2>Draw the current frame</h2><p>Import <code>engine.graphics</code> once at the top of the entry module. Coordinates begin at the upper-left corner: x increases to the right and y increases downward. Colors are red, green, and blue integer channels from 0 through 255.</p><div className="api-reference"><div><code>graphics.clear(r, g, b)</code><p>Fill the entire window. Call it at the beginning of <code>draw</code>.</p></div><div><code>graphics.rectangle(x, y, width, height, r, g, b)</code><p>Draw a filled axis-aligned rectangle.</p></div><div><code>graphics.circle(x, y, radius, r, g, b)</code><p>Draw a filled circle centered at x and y.</p></div><div><code>graphics.text(text, x, y, size, r, g, b)</code><p>Draw text at a pixel size using the host’s default game font.</p></div><div><code>graphics.width()</code><p>Return the current drawing width.</p></div><div><code>graphics.height()</code><p>Return the current drawing height.</p></div></div></section>

        <section id="input"><p className="doc-section-label">ENGINE.INPUT</p><h2>Read input during update</h2><p><code>input.down(name)</code> is true while a key is held. Games should read input inside <code>update</code>, store any resulting state, and only draw that state inside <code>draw</code>.</p><CodeBlock code={`use "engine.input";

fun update(dt) {
  if (input.down("left"))  playerX = playerX - speed * dt;
  if (input.down("right")) playerX = playerX + speed * dt;
  if (input.down("space")) jump();
}`} /><p>The browser host recognizes <code>left</code>, <code>right</code>, <code>up</code>, <code>down</code>, and <code>space</code>. Keyboard, pointer, and controller actions share the same input module in a packaged game.</p></section>

        <section id="project"><p className="doc-section-label">COMPLETE EXAMPLE</p><h2>Run the moving-berry project</h2><p>The example below uses two files. <code>main.pb</code> owns the lifecycle and imports speed and clamping behavior from <code>game/config.pb</code>. Click the canvas before using the controls.</p><LiveGame project={gameProjects.firstGame} /><div className="project-source-pair"><CodeBlock code={gameProjects.firstGame.files['main.pb']} title="main.pb" /><CodeBlock code={gameProjects.firstGame.files['game/config.pb']} title="game/config.pb" /></div><Link className="button primary" to="/playground">Edit the complete project →</Link></section>

        <section id="errors"><p className="doc-section-label">DIAGNOSTICS</p><h2>Compile, runtime, and host errors</h2><p>Pogberry reports errors without terminating the host process. A compile error points to the token that could not be compiled. A runtime error includes the source line and function call stack. A host error reports a failed module, asset, or platform operation through the same diagnostic channel.</p><CodeBlock code={`fun divide(total, count) {
  return total / count;
}

print(divide(10, 0));

// Runtime error:
// Division by zero.
// [line 2] in divide()
// [line 5] in script`} title="error_example.pb" /><div className="doc-table"><div><b>CLI status</b><b>Meaning</b></div><div><code>64</code><span>Invalid command-line usage.</span></div><div><code>65</code><span>The entry source did not compile.</span></div><div><code>70</code><span>Execution ended with a runtime error.</span></div><div><code>74</code><span>The requested entry file could not be read.</span></div></div></section>

        <section id="later" className="tba-section"><p className="doc-section-label">IN DEVELOPMENT</p><h2>APIs that are still being designed</h2><p>Audio playback, physics, packaged assets, save storage, sprites, cameras, and controller mapping will be documented here once their interfaces settle. The site currently teaches the language, modules, lifecycle, keyboard input, shapes, and text because those can be executed by the browser host today.</p><div><span>engine.audio</span><span>engine.physics</span><span>assets</span><span>storage</span><span>sprites</span><span>controllers</span></div></section>
      </article>
    </div>
  </>
}

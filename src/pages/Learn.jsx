import { Link } from 'react-router-dom'
import { CodeBlock, PageHero } from '../components'
import { gameProjects, consoleExamples } from '../data'
import { LiveGame } from '../studio'

const raylibTemplate = `use "pb_gui" as gui;

gui.initWindow(800, 600, "My Pogberry Game");
gui.setTargetFPS(60);

var x = 400;
var y = 300;
var speed = 240;

while (!gui.windowShouldClose()) {
  var dt = gui.getFrameTime();

  if (gui.isKeyDown("KEY_RIGHT")) x = x + speed * dt;
  if (gui.isKeyDown("KEY_LEFT"))  x = x - speed * dt;
  if (gui.isKeyDown("KEY_UP"))    y = y - speed * dt;
  if (gui.isKeyDown("KEY_DOWN"))  y = y + speed * dt;

  gui.beginDrawing();
  gui.clearBackground(25, 25, 35);
  gui.drawCircle(x, y, 24, 232, 79, 115);
  gui.drawText("Use Arrow Keys to Move", 20, 20, 22, 245, 240, 230);
  gui.drawFPS(700, 20);
  gui.endDrawing();
}

gui.closeWindow();`

const audioTemplate = `use "pb_gui" as gui;

gui.initWindow(640, 480, "Audio Demo");
gui.initAudio();

var jumpSound = gui.loadSound("assets/jump.wav");
var bgMusic = gui.loadMusic("assets/ambient.ogg");

gui.setMusicVolume(bgMusic, 0.6);
gui.playMusic(bgMusic);

while (!gui.windowShouldClose()) {
  gui.updateMusic(bgMusic); // Streams audio data each frame

  if (gui.isKeyPressed("KEY_SPACE")) {
    gui.playSound(jumpSound);
  }

  gui.beginDrawing();
  gui.clearBackground(20, 20, 20);
  gui.drawText("Press SPACE for SFX", 200, 220, 20, 255, 255, 255);
  gui.endDrawing();
}

gui.unloadSound(jumpSound);
gui.unloadMusic(bgMusic);
gui.closeAudio();
gui.closeWindow();`

const lifecycle = `use "pb_gui" as gui;
use "std.math";

let x = 40;

fun init() {
  // Load data and create the initial game state.
  print("Game session initialized.");
}

fun update(dt) {
  // dt is the elapsed time in seconds.
  x = x + 120 * dt;
  if (x > gui.getScreenWidth()) x = -30;
}

fun draw() {
  gui.clearBackground(31, 28, 40);
  gui.drawRectangle(x, 150, 30, 30, 232, 79, 115);
  gui.drawText("X: " + str(math.floor(x)), 20, 20, 20, 244, 240, 231);
}`

const modules = `// game/player.pb
export let startingHealth = 100;

export class Player {
  init(name) {
    this.name = name;
    this.health = startingHealth;
  }
}

// main.pb
use "game/player";

let hero = player.Player("Mira");
print(hero.health);`

export default function Learn() {
  return <>
    <PageHero
      eyebrow="DOCUMENTATION"
      title="Complete guide to"
      italic="language & 2D engine."
      text="Everything you need to write Pogberry programs and build standalone 2D games with Raylib."
    />
    <div className="manual-layout shell">
      <aside className="manual-nav">
        <strong>CONTENTS</strong>
        <a href="#start">Start a project</a>
        <a href="#language">Values & bindings</a>
        <a href="#expressions">Strings & operators</a>
        <a href="#prelude">Built-in functions</a>
        <a href="#functions">Functions & flow</a>
        <a href="#collections">Lists & maps</a>
        <a href="#classes">Classes</a>
        <a href="#modules">Source modules</a>
        <a href="#math">Standard math</a>
        <a href="#gui">2D Game Engine (pb_gui)</a>
        <a href="#games">Web & desktop loops</a>
        <a href="#project">Playable example</a>
        <a href="#errors">Diagnostics & errors</a>
        <a href="#roadmap">Engine roadmap</a>
      </aside>
      <article className="manual">
        <section id="start">
          <p className="doc-section-label">GETTING STARTED</p>
          <h2>Start a project</h2>
          <p className="doc-lead">A Pogberry project is a directory containing a <code>main.pb</code> entry file. Run a project directory with the CLI or write code directly inside the browser editor.</p>
          <CodeBlock code={`mkdir berry-game\ncd berry-game\nprintf 'print("Hello, Pogberry.");\\n' > main.pb\npb run`} title="terminal" />
          <div className="doc-callout">
            <b>In the browser</b>
            <p>The editor runs the real Pogberry C bytecode VM inside a Web Worker. Files are saved in local storage automatically.</p>
            <Link to="/playground">Open the editor →</Link>
          </div>
        </section>

        <section id="language">
          <p className="doc-section-label">THE LANGUAGE</p>
          <h2>Values and bindings</h2>
          <p>Pogberry is dynamically typed. A binding can hold a number, string, Boolean, <code>nil</code>, list, map, function, class, instance, or module. Statements end with semicolons and <code>//</code> begins a line comment.</p>
          <CodeBlock code={consoleExamples.hello} title="main.pb" />
          <div className="doc-table">
            <div><b>Declaration</b><b>Meaning</b></div>
            <div><code>let score = 0;</code><span>A mutable binding. Preferred in new code.</span></div>
            <div><code>var score = 0;</code><span>The mutable variable keyword, also used in <code>for</code> initializers.</span></div>
            <div><code>nil</code><span>The absence of a value. Only <code>nil</code> and <code>false</code> are falsey.</span></div>
            <div><code>str(value)</code><span>Converts a value explicitly before string concatenation.</span></div>
          </div>
        </section>

        <section id="expressions">
          <p className="doc-section-label">EXPRESSIONS</p>
          <h2>Strings, numbers, and operators</h2>
          <p>Numbers use IEEE-754 double precision. Division by zero is a checked runtime error, and modulo requires finite integers. String concatenation requires strings; convert other values with <code>str()</code>.</p>
          <div className="doc-table">
            <div><b>Operators</b><b>Behavior</b></div>
            <div><code>() . []</code><span>Function calls, property access, and collection indexing.</span></div>
            <div><code>! -</code><span>Logical negation and numeric negation.</span></div>
            <div><code>* / %</code><span>Multiplication, division, and integer modulo.</span></div>
            <div><code>+ -</code><span>Numeric arithmetic; <code>+</code> also concatenates two strings.</span></div>
            <div><code>&lt; &lt;= &gt; &gt;=</code><span>Numeric or lexicographic string comparisons.</span></div>
            <div><code>== !=</code><span>Value equality, including structural list and map comparison.</span></div>
            <div><code>and or</code><span>Short-circuit logic returning the decisive operand.</span></div>
            <div><code>=</code><span>Assignment to a variable, object field, list index, or map key.</span></div>
          </div>
          <h3>String escapes and indexing</h3>
          <p>Strings use double quotes and support <code>\\</code>, <code>\"</code>, <code>\n</code>, <code>\r</code>, and <code>\t</code>. Strings support finite integer indexing, such as <code>word[0]</code> or negative indexes like <code>word[-1]</code>.</p>
        </section>

        <section id="prelude">
          <p className="doc-section-label">BUILT-IN FUNCTIONS</p>
          <h2>Functions available without an import</h2>
          <div className="api-reference">
            <div><code>print(value, newline=true)</code><p>Write a value through the host output callback. Pass <code>newline=false</code> to keep the cursor on the same line.</p></div>
            <div><code>len(value)</code><p>Return the length of a string, list, or map.</p></div>
            <div><code>str(value)</code><p>Return Pogberry’s canonical string representation of any value.</p></div>
            <div><code>type(value)</code><p>Return the runtime type name (e.g. <code>"number"</code>, <code>"string"</code>, <code>"list"</code>, <code>"map"</code>).</p></div>
            <div><code>strInput(prompt)</code><p>Read one line from standard input. Returns <code>nil</code> when input closes.</p></div>
            <div><code>rand() / rand(bound)</code><p>Return a random float in [0, 1), or a random integer in [0, bound) when passed a positive integer.</p></div>
            <div><code>clock() / getTime()</code><p>Return elapsed wall-clock seconds from the host system.</p></div>
          </div>
        </section>

        <section id="functions">
          <p className="doc-section-label">FUNCTIONS AND FLOW</p>
          <h2>Put behavior into functions</h2>
          <p>Functions are first-class values that can be passed, returned, and nested. A nested function captures surrounding locals as a lexical closure.</p>
          <CodeBlock code={`fun damage(health, amount) {
  let remaining = health - amount;
  if (remaining < 0) return 0;
  return remaining;
}

for (var wave = 1; wave <= 3; wave = wave + 1) {
  print("Starting wave " + str(wave));
}`} />
          <h3>Control-flow statements</h3>
          <p><code>if</code> and <code>else</code> handle conditional branches. <code>while</code> loops repeat while a condition holds true. <code>for</code> loops provide standard initialization, condition, and increment clauses. Use <code>break</code> to exit loops prematurely.</p>
        </section>

        <section id="collections">
          <p className="doc-section-label">COLLECTIONS</p>
          <h2>Store game state in lists and maps</h2>
          <p>Lists are mutable dynamic arrays with negative indexing support (<code>items[-1]</code> accesses the last item). Maps maintain insertion order and support keys of type <code>nil</code>, Boolean, number, or string.</p>
          <CodeBlock code={consoleExamples.collections} />
          <div className="api-columns">
            <div>
              <h3>List methods</h3>
              <code>push(value)</code>
              <code>extend(list)</code>
              <code>pop() / pop(index)</code>
              <code>insert(index, value)</code>
              <code>remove(value)</code>
              <code>removeAt(index)</code>
              <code>clear()</code>
              <code>copy()</code>
              <code>reverse()</code>
              <code>sort()</code>
            </div>
            <div>
              <h3>Map methods & properties</h3>
              <code>has(key)</code>
              <code>get(key, defaultValue)</code>
              <code>delete(key)</code>
              <code>clear()</code>
              <code>length</code>
              <code>len(map)</code>
            </div>
          </div>
        </section>

        <section id="classes">
          <p className="doc-section-label">CLASSES</p>
          <h2>Represent actors and objects</h2>
          <p>Classes support dynamic instance fields, methods, constructors (<code>init</code>), single inheritance, <code>this</code>, and <code>super</code>.</p>
          <CodeBlock code={consoleExamples.classes} title="actors.pb" />
          <p>Methods remain bound to their originating instance when extracted: <code>let speak = slime.speak; speak();</code> retains the instance as <code>this</code>.</p>
        </section>

        <section id="modules">
          <p className="doc-section-label">PROJECTS</p>
          <h2>Split a game into modules</h2>
          <p>Imports resolve relative to the project entry directory. Module globals are private by default; only declarations prefixed with <code>export</code> are exposed.</p>
          <CodeBlock code={modules} title="two-file project" />
          <p>The optional <code>as</code> clause lets you specify an alias: <code>use "game/player" as hero;</code>. If omitted, the default alias is the last path component.</p>
        </section>

        <section id="math">
          <p className="doc-section-label">STANDARD LIBRARY</p>
          <h2>Math utilities (std.math)</h2>
          <p>Pogberry includes a standard math module providing mathematical constants and common operations without external dependencies.</p>
          <CodeBlock code={consoleExamples.math} title="math_example.pb" />
          <div className="doc-table">
            <div><b>Export</b><b>Description</b></div>
            <div><code>math.pi</code><span>The mathematical constant π (3.141592653589793).</span></div>
            <div><code>math.e</code><span>Euler's number e (2.718281828459045).</span></div>
            <div><code>math.abs(value)</code><span>Returns the absolute value of a number.</span></div>
            <div><code>math.floor(value)</code><span>Rounds a number downward to the nearest integer.</span></div>
            <div><code>math.sqrt(value)</code><span>Returns the square root of a non-negative number.</span></div>
            <div><code>math.min(a, b)</code><span>Returns the smaller of two numbers.</span></div>
            <div><code>math.max(a, b)</code><span>Returns the larger of two numbers.</span></div>
            <div><code>math.clamp(val, low, high)</code><span>Clamps a number between minimum and maximum bounds.</span></div>
          </div>
        </section>

        <section id="gui" className="manual-game-section">
          <p className="doc-section-label">2D GAME ENGINE</p>
          <h2>2D game development with pb_gui</h2>
          <p className="doc-lead">Pogberry includes a full-featured 2D game engine module powered by Raylib. It provides windowing, shapes, typography, keyboard & mouse input, 2D collisions, sprite textures, sound effects, and streaming music.</p>
          <CodeBlock code={raylibTemplate} title="game.pb" />

          <h3>1. Windowing & Display</h3>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.initWindow(w, h, title)</code><span>Creates a graphical window with specified dimensions and title.</span></div>
            <div><code>gui.closeWindow()</code><span>Closes the window and frees loaded audio/texture resources.</span></div>
            <div><code>gui.windowShouldClose()</code><span>Returns true if the window close button or exit key was pressed.</span></div>
            <div><code>gui.setTargetFPS(fps)</code><span>Caps framerate (e.g. 60 FPS).</span></div>
            <div><code>gui.getFrameTime()</code><span>Delta time in seconds since the previous frame (e.g. 0.016).</span></div>
            <div><code>gui.getScreenWidth() / getScreenHeight()</code><span>Returns current window pixel dimensions.</span></div>
            <div><code>gui.getFPS()</code><span>Returns current rendered frames per second.</span></div>
            <div><code>gui.toggleFullscreen()</code><span>Toggles fullscreen display mode.</span></div>
          </div>

          <h3>2. Shapes & Drawing</h3>
          <p>Drawing commands are wrapped between <code>gui.beginDrawing()</code> and <code>gui.endDrawing()</code>. Colors are integer RGB channels from 0 to 255.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.clearBackground(r, g, b)</code><span>Fills the canvas with a solid RGB background color.</span></div>
            <div><code>gui.drawRectangle(x, y, w, h, r, g, b)</code><span>Draws a solid filled rectangle.</span></div>
            <div><code>gui.drawRectangleLines(x, y, w, h, r, g, b)</code><span>Draws an outlined rectangle border.</span></div>
            <div><code>gui.drawRectangleRounded(x, y, w, h, roundness, segs, r, g, b)</code><span>Draws a rounded card with smooth corners.</span></div>
            <div><code>gui.drawCircle(cx, cy, radius, r, g, b)</code><span>Draws a solid filled circle.</span></div>
            <div><code>gui.drawCircleLines(cx, cy, radius, r, g, b)</code><span>Draws a circle outline.</span></div>
            <div><code>gui.drawLine(x1, y1, x2, y2, r, g, b)</code><span>Draws a 1-pixel line between two points.</span></div>
            <div><code>gui.drawPixel(x, y, r, g, b)</code><span>Draws a single colored pixel.</span></div>
          </div>

          <h3>3. Typography & Text</h3>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.drawText(text, x, y, size, r, g, b)</code><span>Renders text at (x, y) with specified font size and RGB color.</span></div>
            <div><code>gui.measureText(text, size)</code><span>Returns text width in pixels for layout centering.</span></div>
            <div><code>gui.drawFPS(x, y)</code><span>Draws a pre-built FPS counter for performance profiling.</span></div>
          </div>

          <h3>4. Input: Keyboard & Mouse</h3>
          <p>Check keyboard keys using standard Raylib key names such as <code>"KEY_LEFT"</code>, <code>"KEY_RIGHT"</code>, <code>"KEY_UP"</code>, <code>"KEY_DOWN"</code>, <code>"KEY_SPACE"</code>, <code>"KEY_W"</code>, <code>"KEY_A"</code>, <code>"KEY_S"</code>, and <code>"KEY_D"</code>.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.isKeyDown(keyName)</code><span>Returns true continuously while the key is held down.</span></div>
            <div><code>gui.isKeyPressed(keyName)</code><span>Returns true only on the initial frame the key was pressed.</span></div>
            <div><code>gui.isKeyReleased(keyName)</code><span>Returns true on the frame the key was released.</span></div>
            <div><code>gui.isKeyUp(keyName)</code><span>Returns true while the key is not pressed.</span></div>
            <div><code>gui.getMouseX() / getMouseY()</code><span>Returns current cursor pixel coordinates.</span></div>
            <div><code>gui.isMouseButtonDown(button)</code><span>Checks mouse button state (<code>"LEFT"</code>, <code>"RIGHT"</code>).</span></div>
            <div><code>gui.isMouseButtonPressed(button)</code><span>Returns true on the mouse click frame.</span></div>
            <div><code>gui.getMouseWheelMove()</code><span>Returns mouse wheel movement delta.</span></div>
          </div>

          <h3>5. 2D Collision Detection</h3>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.checkCollisionRecs(x1,y1,w1,h1, x2,y2,w2,h2)</code><span>Fast axis-aligned bounding box (AABB) intersection check.</span></div>
            <div><code>gui.checkCollisionCircles(x1,y1,r1, x2,y2,r2)</code><span>Circle-to-circle radius collision test.</span></div>
            <div><code>gui.checkCollisionCircleRec(cx,cy,r, rx,ry,rw,rh)</code><span>Circle vs. rectangle intersection query.</span></div>
            <div><code>gui.checkCollisionPointRec(px,py, rx,ry,rw,rh)</code><span>Tests if a point (e.g. mouse cursor) is inside a rectangle.</span></div>
            <div><code>gui.checkCollisionPointCircle(px,py, cx,cy,r)</code><span>Tests if a point is inside a circle.</span></div>
          </div>

          <h3>6. Sprites & Textures</h3>
          <p>Load PNG, BMP, or JPEG images directly into GPU memory and render spritesheets with sub-rectangle clipping.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.loadTexture(path)</code><span>Loads image file into GPU VRAM. Returns handle (id &gt; 0).</span></div>
            <div><code>gui.unloadTexture(id)</code><span>Frees texture memory when finished.</span></div>
            <div><code>gui.drawTexture(id, x, y)</code><span>Draws texture at (x, y) in original size.</span></div>
            <div><code>gui.drawTextureTint(id, x, y, r, g, b)</code><span>Draws texture tinted with an RGB color multiplier.</span></div>
            <div><code>gui.drawTextureRec(id, sx, sy, sw, sh, dx, dy)</code><span>Draws a sub-rectangle from a spritesheet at (dx, dy).</span></div>
            <div><code>gui.getTextureWidth(id) / getTextureHeight(id)</code><span>Queries texture pixel dimensions.</span></div>
          </div>

          <h3>7. Audio: Sound Effects & Music</h3>
          <p>Built-in sound effect playback and disk-streamed background music.</p>
          <CodeBlock code={audioTemplate} title="audio_example.pb" />
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.initAudio() / gui.closeAudio()</code><span>Initializes or tears down the host audio device.</span></div>
            <div><code>gui.loadSound(path) / unloadSound(id)</code><span>Loads short WAV, OGG, or MP3 sound effects into memory.</span></div>
            <div><code>gui.playSound(id) / stopSound(id)</code><span>Triggers or halts sound effect playback.</span></div>
            <div><code>gui.setSoundVolume(id, volume)</code><span>Sets sound volume from 0.0 (silent) to 1.0 (full).</span></div>
            <div><code>gui.loadMusic(path) / unloadMusic(id)</code><span>Streams audio tracks from disk to conserve memory.</span></div>
            <div><code>gui.playMusic(id) / pauseMusic(id)</code><span>Controls streaming background music playback.</span></div>
            <div><code>gui.updateMusic(id)</code><span>Streams music buffer. Must be called once per frame!</span></div>
            <div><code>gui.setMusicVolume(id, volume)</code><span>Adjusts background music volume.</span></div>
          </div>
        </section>

        <section id="games" className="manual-game-section">
          <p className="doc-section-label">MAKING GAMES</p>
          <h2>Web & desktop execution loops</h2>
          <p className="doc-lead">On desktop with the Raylib host, games control their own <code>while (!gui.windowShouldClose())</code> loop. In the browser editor, the WebAssembly host manages non-blocking animation frames via <code>init()</code>, <code>update(dt)</code>, and <code>draw()</code>.</p>
          <CodeBlock code={lifecycle} title="main.pb" />
          <div className="lifecycle-table">
            <div><code>init()</code><p>Called once at startup. Initialize state and configure game entities here.</p></div>
            <div><code>update(dt)</code><p>Called before each frame with elapsed delta time in seconds. Advance gameplay, physics, and input here.</p></div>
            <div><code>draw()</code><p>Called after update. Clear the background and submit drawing primitives to the canvas.</p></div>
            <div><code>shutdown()</code><p>Called when the game closes to release resources and save persistent state.</p></div>
          </div>
        </section>

        <section id="project">
          <p className="doc-section-label">COMPLETE EXAMPLE</p>
          <h2>Playable moving-berry game</h2>
          <p>The interactive example below demonstrates state management, clamping, delta time, and drawing primitives running in real time. Click the canvas to focus controls.</p>
          <LiveGame project={gameProjects.firstGame} />
          <div className="project-source-pair">
            <CodeBlock code={gameProjects.firstGame.files['main.pb']} title="main.pb" />
            <CodeBlock code={gameProjects.firstGame.files['game/config.pb']} title="game/config.pb" />
          </div>
          <Link className="button primary" to="/playground">Edit the complete project →</Link>
        </section>

        <section id="errors">
          <p className="doc-section-label">DIAGNOSTICS</p>
          <h2>Compile, runtime, and host errors</h2>
          <p>Pogberry provides clear, actionable diagnostics without crashing the host process. Errors include file names, line numbers, and readable stack traces.</p>
          <CodeBlock code={`fun divide(total, count) {
  return total / count;
}

print(divide(10, 0));

// Runtime error:
// Division by zero.
// [line 2] in divide()
// [line 5] in script`} title="error_example.pb" />
          <div className="doc-table">
            <div><b>Exit code</b><b>Meaning</b></div>
            <div><code>64</code><span>Invalid command-line usage.</span></div>
            <div><code>65</code><span>Source compilation failed.</span></div>
            <div><code>70</code><span>Execution halted due to a runtime error.</span></div>
            <div><code>74</code><span>The specified entry file could not be read.</span></div>
          </div>
        </section>

        <section id="roadmap" className="tba-section">
          <p className="doc-section-label">ARCHITECTURE & EVOLUTION</p>
          <h2>Next milestones for Pogberry</h2>
          <p>With core language features, collections, classes, bytecode optimizations, Raylib 2D game engine (<code>pb_gui</code>), and standard library (<code>std.math</code>) complete, active development is focusing on unified engine abstraction layers, opaque host resource types, and project packaging.</p>
          <div>
            <span>portable engine surface</span>
            <span>opaque host resources</span>
            <span>custom shaders</span>
            <span>multi-channel audio groups</span>
            <span>asset packager</span>
            <span>standalone exe export</span>
          </div>
        </section>
      </article>
    </div>
  </>
}

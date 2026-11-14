import { Link } from 'react-router-dom'
import { CodeBlock, PageHero } from '../components'
import { gameProjects, consoleExamples } from '../data'
import { LiveGame } from '../studio'

const raylib2DTemplate = `use "pb_gui" as gui;

gui.initWindow(800, 600, "2D Example");
gui.setTargetFPS(60);

let x = 400;
let y = 300;
let speed = 240;

while (!gui.windowShouldClose()) {
  let dt = gui.getFrameTime();

  if (gui.isKeyDown("KEY_RIGHT")) x += speed * dt;
  if (gui.isKeyDown("KEY_LEFT"))  x -= speed * dt;
  if (gui.isKeyDown("KEY_UP"))    y -= speed * dt;
  if (gui.isKeyDown("KEY_DOWN"))  y += speed * dt;

  gui.beginDrawing();
  gui.clearBackground(gui.DARKGRAY);
  gui.drawCircle(x, y, 24, gui.RED);
  gui.drawText("Use Arrow Keys to Move", 20, 20, 22, gui.RAYWHITE);
  gui.drawFPS(700, 20);
  gui.endDrawing();
}

gui.closeWindow();`

const colorPresetsTemplate = `use "pb_gui" as gui;

gui.initWindow(800, 600, "Color Presets Demo");
gui.setTargetFPS(60);

while (!gui.windowShouldClose()) {
  gui.beginDrawing();
  gui.clearBackground(gui.DARKGRAY);

  // Module color constants
  gui.drawCircle(120, 100, 36, gui.RED);
  gui.drawCircle(240, 100, 36, gui.GOLD);
  gui.drawCircle(360, 100, 36, gui.SKYBLUE);

  // Preset name strings and hex strings
  gui.drawRectangle(80, 180, 80, 50, "lime");
  gui.drawRectangle(200, 180, 80, 50, "violet");
  gui.drawRectangle(320, 180, 80, 50, "#ff8800");

  // Alpha fade helper
  let faded = gui.fade(gui.SKYBLUE, 0.5);
  gui.drawCircle(480, 100, 36, faded);

  // Color helper with alpha
  let transparentCard = gui.color("black", 0.6);
  gui.drawRectangle(80, 260, 320, 70, transparentCard);

  gui.drawText("Clean Color Presets", 100, 285, 20, gui.RAYWHITE);
  gui.endDrawing();
}

gui.closeWindow();`

const raylib3DTemplate = `use "pb_gui" as gui;

gui.initWindow(1280, 720, "3D in Pogberry");
gui.setTargetFPS(60);

let angle = 0.0;

while (!gui.windowShouldClose()) {
  let dt = gui.getFrameTime();
  angle += 40.0 * dt;

  gui.beginDrawing();
  gui.clearBackground(gui.DARKGRAY);

  // 3D pass: camera position, target position, field of view
  gui.begin3D([0.0, 6.0, 12.0], [0.0, 0.0, 0.0], 45.0);
  gui.drawGrid(20, 1.0);
  gui.drawPlane3D([0.0, 0.0, 0.0], [20.0, 20.0], gui.GRAY);
  gui.drawCube3D([0.0, 1.0, 0.0], [2.0, 2.0, 2.0], gui.SKYBLUE);
  gui.drawCubeWires3D([0.0, 1.0, 0.0], [2.0, 2.0, 2.0], gui.WHITE);
  gui.drawSphere3D([-4.0, 1.0, 0.0], 1.0, gui.RED);
  gui.drawCylinder3D([4.0, 0.0, 0.0], 1.0, 1.0, 2.5, gui.GOLD);
  gui.end3D();

  // 2D interface pass
  gui.drawText("3D Game Engine", 20, 20, 24, gui.RAYWHITE);
  gui.drawFPS(1200, 20);
  gui.endDrawing();
}

gui.closeWindow();`

const model3DTemplate = `use "pb_gui" as gui;

gui.initWindow(1280, 720, "3D Model Viewer");
gui.setTargetFPS(60);

let car = gui.loadModel("assets/car.obj");
let rotation = 0.0;

while (!gui.windowShouldClose()) {
  let dt = gui.getFrameTime();
  rotation += 35.0 * dt;

  gui.beginDrawing();
  gui.clearBackground(gui.BLACK);

  gui.begin3DEx([0.0, 4.0, 9.0], [0.0, 1.0, 0.0], [0.0, 1.0, 0.0], 45.0);
  gui.drawGrid(20, 1.0);
  gui.drawModelRotY(car, [0.0, 0.0, 0.0], rotation, [1.0, 1.0, 1.0], gui.GOLD);
  gui.end3D();

  gui.drawText("Loaded OBJ Model", 20, 20, 22, gui.RAYWHITE);
  gui.drawFPS(1200, 20);
  gui.endDrawing();
}

gui.unloadModel(car);
gui.closeWindow();`

const audioTemplate = `use "pb_gui" as gui;

gui.initWindow(640, 480, "Audio Demo");
gui.initAudio();

let jumpSound = gui.loadSound("assets/jump.wav");
let bgMusic = gui.loadMusic("assets/ambient.ogg");

gui.setMusicVolume(bgMusic, 0.6);
gui.playMusic(bgMusic);

while (!gui.windowShouldClose()) {
  gui.updateMusic(bgMusic);

  if (gui.isKeyPressed("KEY_SPACE")) {
    gui.playSound(jumpSound);
  }

  gui.beginDrawing();
  gui.clearBackground(gui.DARKGRAY);
  gui.drawText("Press SPACE for SFX", 200, 220, 20, gui.RAYWHITE);
  gui.endDrawing();
}

gui.unloadSound(jumpSound);
gui.unloadMusic(bgMusic);
gui.closeAudio();
gui.closeWindow();`

const vectorExample = `let v1 = vec3(1.0, 2.0, 3.0);
let v2 = vec3(0.0, 1.0, 0.0);

let dotProduct = v1.dot(v2);
let unit = v1.normalize();
let magnitude = v1.length();

let transform = mat4();
let moved = transform.translate(10.0, 0.0, 5.0);
let rotated = moved.rotateY(3.14159 / 4.0);`

const mapSortExample = `let scores = {
  "Sajid": 92,
  "Mira": 98,
  "Devansh": 95
};

// Returns a list of [key, value] pairs sorted by key
let byName = scores.sortKey();

// Returns a list of [key, value] pairs sorted by value
let byRank = scores.sortValue();`

const stdlibExample = `use "std.math";
use "std.file";
use "std.json";

let root = math.sqrt(144);
let clamped = math.clamp(120, 0, 100);

let payload = {"score": 420, "level": "Suzuka"};
let encoded = json.stringify(payload);
file.writeText("save.json", encoded);

let loaded = json.parse(file.readText("save.json"));
print("Score: " + str(loaded["score"]));`

const lifecycle = `use "pb_gui" as gui;
use "std.math";

let x = 40;

fun init() {
  print("Game session initialized.");
}

fun update(dt) {
  x += 120 * dt;
  if (x > gui.getScreenWidth()) x = -30;
}

fun draw() {
  gui.clearBackground(gui.DARKGRAY);
  gui.drawRectangle(x, 150, 30, 30, gui.RED);
  gui.drawText("X: " + str(math.floor(x)), 20, 20, 20, gui.RAYWHITE);
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
      italic="language, 2D and 3D engine."
      text="Everything you need to write Pogberry programs and build standalone 2D and 3D games with Raylib."
    />
    <div className="manual-layout shell">
      <aside className="manual-nav">
        <strong>CONTENTS</strong>
        <a href="#start">Start a project</a>
        <a href="#language">Values and bindings</a>
        <a href="#expressions">Strings and operators</a>
        <a href="#prelude">Built-in functions</a>
        <a href="#functions">Functions and flow</a>
        <a href="#collections">Lists, maps, and strings</a>
        <a href="#vectors">Vectors and matrices</a>
        <a href="#classes">Classes</a>
        <a href="#modules">Source modules</a>
        <a href="#stdlib">Standard library</a>
        <a href="#colors">Color preset system</a>
        <a href="#gui">2D game engine</a>
        <a href="#gui3d">3D game engine</a>
        <a href="#games">Web and desktop loops</a>
        <a href="#project">Playable example</a>
        <a href="#errors">Diagnostics and errors</a>
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
            <p>The editor runs the real Pogberry C bytecode VM inside a Web Worker. Files save in local storage automatically.</p>
            <Link to="/playground">Open the editor</Link>
          </div>
        </section>

        <section id="language">
          <p className="doc-section-label">THE LANGUAGE</p>
          <h2>Values and bindings</h2>
          <p>Pogberry is dynamically typed. A binding holds a number, string, boolean, <code>nil</code>, list, map, function, class, instance, module, vector, matrix, or host resource. Statements end with semicolons and <code>//</code> begins a line comment.</p>
          <CodeBlock code={consoleExamples.hello} title="main.pb" />
          <div className="doc-table">
            <div><b>Declaration</b><b>Meaning</b></div>
            <div><code>let score = 0;</code><span>A mutable binding. Preferred in all new code.</span></div>
            <div><code>var score = 0;</code><span>The mutable variable keyword, also used in loop initializers.</span></div>
            <div><code>nil</code><span>The absence of a value. Only nil and false evaluate to false.</span></div>
            <div><code>str(value)</code><span>Converts a value explicitly before string concatenation.</span></div>
          </div>
        </section>

        <section id="expressions">
          <p className="doc-section-label">EXPRESSIONS</p>
          <h2>Strings, numbers, and operators</h2>
          <p>Numbers use IEEE-754 double precision. Division by zero is a checked runtime error, and modulo requires finite integers. String concatenation requires two strings. Convert other types with <code>str()</code>.</p>
          <div className="doc-table">
            <div><b>Operators</b><b>Behavior</b></div>
            <div><code>() . []</code><span>Function calls, property access, and collection indexing.</span></div>
            <div><code>! -</code><span>Logical negation and numeric negation.</span></div>
            <div><code>* / %</code><span>Multiplication, division, and integer modulo.</span></div>
            <div><code>+ -</code><span>Numeric arithmetic and string concatenation.</span></div>
            <div><code>&lt; &lt;= &gt; &gt;=</code><span>Numeric and lexicographic string comparisons.</span></div>
            <div><code>== !=</code><span>Value equality, including structural list and map comparisons.</span></div>
            <div><code>and or</code><span>Short-circuit logic returning the decisive operand.</span></div>
            <div><code>= += -= *= /= %=</code><span>Direct and compound assignment to variables, properties, list indices, and map keys.</span></div>
          </div>
          <h3>String escapes and indexing</h3>
          <p>Strings use double quotes and support escape sequences for backslash, quotes, newlines, carriage returns, and tabs. Strings support zero-based integer indexing, including negative offsets from the end.</p>
        </section>

        <section id="prelude">
          <p className="doc-section-label">BUILT-IN FUNCTIONS</p>
          <h2>Functions available without an import</h2>
          <p>The prelude provides core input, conversion, measurement, math, and object construction without requiring an import statement.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>print(value, newline=true)</code><span>Writes a value through the host output callback. Pass newline=false to keep the cursor on the same line.</span></div>
            <div><code>len(value)</code><span>Returns the length of a string, list, or map.</span></div>
            <div><code>str(value)</code><span>Returns the canonical string representation of any value.</span></div>
            <div><code>num(string)</code><span>Parses a numeric string into an IEEE-754 double precision number.</span></div>
            <div><code>type(value)</code><span>Returns the runtime type string, such as number, string, list, map, function, class, instance, vec2, vec3, vec4, or mat4.</span></div>
            <div><code>strInput()</code><span>Reads one line from standard input. Returns nil if input closes.</span></div>
            <div><code>strInput(prompt)</code><span>Prints prompt and reads one line from standard input.</span></div>
            <div><code>rand()</code><span>Returns a pseudo-random floating point number from 0.0 up to 1.0.</span></div>
            <div><code>rand(bound)</code><span>Returns a pseudo-random integer from 0 up to bound minus 1 for a positive integer bound.</span></div>
            <div><code>seed(n)</code><span>Sets the random number generator seed using a non-negative integer.</span></div>
            <div><code>vec2(x, y)</code><span>Creates a 2D vector object with x and y floating point components.</span></div>
            <div><code>vec3(x, y, z)</code><span>Creates a 3D vector object with x, y, and z floating point components.</span></div>
            <div><code>vec4(x, y, z, w)</code><span>Creates a 4D vector object with x, y, z, and w floating point components.</span></div>
            <div><code>mat4()</code><span>Creates a 4x4 identity transform matrix object.</span></div>
            <div><code>join(list)</code><span>Joins elements of a list into a single string.</span></div>
            <div><code>join(list, delimiter)</code><span>Joins elements of a list into a string separated by delimiter.</span></div>
            <div><code>clock()</code><span>Returns elapsed processor execution time in seconds.</span></div>
            <div><code>getTime()</code><span>Returns elapsed wall-clock seconds from the host system.</span></div>
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

for (let wave = 1; wave <= 3; wave += 1) {
  print("Starting wave " + str(wave));
}`} />
          <h3>Control flow statements</h3>
          <p>Conditional branches use <code>if</code> and <code>else</code>. Repetition uses <code>while</code> and <code>for</code> loops. Loops support early exits with <code>break</code> and loop iteration jumps with <code>continue</code>.</p>
        </section>

        <section id="collections">
          <p className="doc-section-label">COLLECTIONS</p>
          <h2>Store game state in lists, maps, and strings</h2>
          <p>Lists are mutable dynamic arrays with negative indexing support. Maps maintain insertion order and support keys of type nil, boolean, number, or string. Strings are immutable character sequences with dedicated query and slice methods.</p>
          <CodeBlock code={consoleExamples.collections} />

          <h3>List methods</h3>
          <div className="doc-table">
            <div><b>Method</b><b>Description</b></div>
            <div><code>list.push(value)</code><span>Appends value to the end of the list.</span></div>
            <div><code>list.pop()</code><span>Removes and returns the last element of the list.</span></div>
            <div><code>list.pop(index)</code><span>Removes and returns the element at index.</span></div>
            <div><code>list.insert(index, value)</code><span>Inserts value at index and shifts subsequent elements to the right.</span></div>
            <div><code>list.remove(value)</code><span>Removes the first occurrence of value from the list.</span></div>
            <div><code>list.removeAt(index)</code><span>Removes and returns the element at index.</span></div>
            <div><code>list.clear()</code><span>Removes all elements from the list.</span></div>
            <div><code>list.copy()</code><span>Returns a shallow copy of the list.</span></div>
            <div><code>list.reverse()</code><span>Reverses the list elements in place.</span></div>
            <div><code>list.sort()</code><span>Sorts a list of numbers or a list of strings in ascending order in place.</span></div>
            <div><code>list.extend(otherList)</code><span>Appends every element from otherList to the end of the list.</span></div>
            <div><code>list.index(value)</code><span>Returns the zero-based index of the first occurrence of value.</span></div>
            <div><code>list.count(value)</code><span>Returns the total occurrences of value in the list.</span></div>
          </div>

          <h3>Map methods and properties</h3>
          <CodeBlock code={mapSortExample} title="map_sorting.pb" />
          <div className="doc-table">
            <div><b>Method / Property</b><b>Description</b></div>
            <div><code>map.has(key)</code><span>Returns true if key exists in the map.</span></div>
            <div><code>map.get(key, defaultValue)</code><span>Returns the value for key, or defaultValue if key is absent.</span></div>
            <div><code>map.delete(key)</code><span>Removes key from the map and returns true if key was present.</span></div>
            <div><code>map.clear()</code><span>Removes all entries from the map.</span></div>
            <div><code>map.keys()</code><span>Returns a list containing all map keys in insertion order.</span></div>
            <div><code>map.sortKey()</code><span>Sorts map entries by key in ascending order and returns a list of key and value pairs.</span></div>
            <div><code>map.sortValue()</code><span>Sorts map entries by value in ascending order and returns a list of key and value pairs.</span></div>
            <div><code>map.length</code><span>Property returning the number of entries in the map.</span></div>
            <div><code>len(map)</code><span>Built-in function returning the number of entries in the map.</span></div>
          </div>

          <h3>String methods</h3>
          <div className="doc-table">
            <div><b>Method</b><b>Description</b></div>
            <div><code>string.find(substring)</code><span>Returns the zero-based index of the first occurrence of substring, or -1 if absent.</span></div>
            <div><code>string.substr(start)</code><span>Returns the substring starting from start to the end of the string.</span></div>
            <div><code>string.substr(start, length)</code><span>Returns a substring of length characters starting from start.</span></div>
            <div><code>string.split(delimiter)</code><span>Splits the string by delimiter and returns a list of string segments.</span></div>
            <div><code>string.trim()</code><span>Returns the string with leading and trailing whitespace characters removed.</span></div>
          </div>
        </section>

        <section id="vectors">
          <p className="doc-section-label">GEOMETRY PRIMITIVES</p>
          <h2>Vectors and matrices</h2>
          <p>Pogberry provides native vector and matrix types designed for 2D and 3D games. Vectors support coordinate properties, array indexing, and element-wise arithmetic.</p>
          <CodeBlock code={vectorExample} title="math_vectors.pb" />

          <h3>Vector methods and operations</h3>
          <div className="doc-table">
            <div><b>Operation</b><b>Description</b></div>
            <div><code>vec.dot(other)</code><span>Computes the dot product with another vector of identical dimension.</span></div>
            <div><code>vec.length()</code><span>Computes the Euclidean length of the vector.</span></div>
            <div><code>vec.normalize()</code><span>Returns a unit vector pointing in the same direction with length 1.0.</span></div>
            <div><code>vec.x, vec.y, vec.z, vec.w</code><span>Properties accessing individual coordinates.</span></div>
            <div><code>vec[index]</code><span>Numeric index access for coordinates 0 through dimension minus 1.</span></div>
            <div><code>v1 + v2, v1 - v2</code><span>Element-wise vector addition and subtraction.</span></div>
            <div><code>vec * scalar, vec / scalar</code><span>Uniform scaling by numbers and element-wise arithmetic.</span></div>
          </div>

          <h3>Matrix methods and operations</h3>
          <div className="doc-table">
            <div><b>Method / Operator</b><b>Description</b></div>
            <div><code>mat.translate(x, y)</code><span>Multiplies the matrix by a 2D translation transform.</span></div>
            <div><code>mat.translate(x, y, z)</code><span>Multiplies the matrix by a 3D translation transform.</span></div>
            <div><code>mat.scale(factor)</code><span>Multiplies the matrix by a uniform scale factor across all axes.</span></div>
            <div><code>mat.scale(x, y)</code><span>Multiplies the matrix by separate scale factors across X and Y axes.</span></div>
            <div><code>mat.scale(x, y, z)</code><span>Multiplies the matrix by separate scale factors across X, Y, and Z axes.</span></div>
            <div><code>mat.rotateX(radians)</code><span>Multiplies the matrix by a rotation around the X axis in radians.</span></div>
            <div><code>mat.rotateY(radians)</code><span>Multiplies the matrix by a rotation around the Y axis in radians.</span></div>
            <div><code>mat.rotateZ(radians)</code><span>Multiplies the matrix by a rotation around the Z axis in radians.</span></div>
            <div><code>mat1 * mat2</code><span>Concatenates two 4x4 transformation matrices.</span></div>
            <div><code>mat * vec</code><span>Transforms a vector by the matrix.</span></div>
          </div>
        </section>

        <section id="classes">
          <p className="doc-section-label">CLASSES</p>
          <h2>Represent actors with classes</h2>
          <p>Classes support dynamic instance fields, methods, constructors named <code>init</code>, single inheritance, <code>this</code>, and <code>super</code>.</p>
          <CodeBlock code={consoleExamples.classes} title="actors.pb" />
          <p>Methods remain bound to their originating instance when extracted to a variable.</p>
        </section>

        <section id="modules">
          <p className="doc-section-label">PROJECTS</p>
          <h2>Split programs into modules</h2>
          <p>Imports resolve relative to the project entry directory. Module declarations are private by default. Only declarations prefixed with <code>export</code> are exposed.</p>
          <CodeBlock code={modules} title="two-file project" />
          <p>The optional <code>as</code> clause specifies an import alias. If omitted, the default alias is the final path component.</p>
        </section>

        <section id="stdlib">
          <p className="doc-section-label">STANDARD LIBRARY</p>
          <h2>Standard library modules</h2>
          <p>Pogberry provides standard modules for math, file access, JSON encoding, camera tracking, text fields, and time calculation.</p>
          <CodeBlock code={stdlibExample} title="stdlib_demo.pb" />

          <h3>Math module: std.math</h3>
          <div className="doc-table">
            <div><b>Export</b><b>Description</b></div>
            <div><code>math.pi</code><span>Mathematical constant pi, 3.141592653589793.</span></div>
            <div><code>math.e</code><span>Euler number e, 2.718281828459045.</span></div>
            <div><code>math.abs(value)</code><span>Returns the absolute value of a number.</span></div>
            <div><code>math.floor(value)</code><span>Rounds a number downward to the nearest integer.</span></div>
            <div><code>math.ceil(value)</code><span>Rounds a number upward to the nearest integer.</span></div>
            <div><code>math.round(value)</code><span>Rounds a number to the nearest integer.</span></div>
            <div><code>math.sqrt(value)</code><span>Returns the square root of a non-negative number.</span></div>
            <div><code>math.min(a, b)</code><span>Returns the smaller of two numbers.</span></div>
            <div><code>math.max(a, b)</code><span>Returns the larger of two numbers.</span></div>
            <div><code>math.clamp(val, low, high)</code><span>Restricts val within low and high bounds.</span></div>
            <div><code>math.sin(radians)</code><span>Computes the sine of an angle in radians.</span></div>
            <div><code>math.cos(radians)</code><span>Computes the cosine of an angle in radians.</span></div>
            <div><code>math.tan(radians)</code><span>Computes the tangent of an angle in radians.</span></div>
            <div><code>math.asin(value)</code><span>Computes the arc sine in radians.</span></div>
            <div><code>math.acos(value)</code><span>Computes the arc cosine in radians.</span></div>
            <div><code>math.atan(value)</code><span>Computes the arc tangent in radians.</span></div>
            <div><code>math.atan2(y, x)</code><span>Computes the angle in radians from the positive X axis to point y, x.</span></div>
            <div><code>math.pow(base, exp)</code><span>Raises base to the exp power.</span></div>
            <div><code>math.lerp(start, end, amount)</code><span>Computes linear interpolation between start and end.</span></div>
            <div><code>math.dist(x1, y1, x2, y2)</code><span>Computes the Euclidean distance between two 2D points.</span></div>
            <div><code>math.deg2rad(degrees)</code><span>Converts degrees to radians.</span></div>
            <div><code>math.rad2deg(radians)</code><span>Converts radians to degrees.</span></div>
          </div>

          <h3>Filesystem module: std.file</h3>
          <div className="doc-table">
            <div><b>Export</b><b>Description</b></div>
            <div><code>file.readText(path)</code><span>Reads complete file contents as a UTF-8 string.</span></div>
            <div><code>file.writeText(path, text)</code><span>Writes text to a file, replacing existing content.</span></div>
            <div><code>file.appendText(path, text)</code><span>Appends text to the end of a file.</span></div>
            <div><code>file.exists(path)</code><span>Returns true if the file or directory exists.</span></div>
            <div><code>file.delete(path)</code><span>Deletes the file at path.</span></div>
            <div><code>file.readBytes(path)</code><span>Reads a file and returns a list of byte integers.</span></div>
            <div><code>file.writeBytes(path, bytes)</code><span>Writes a list of byte integers to a file.</span></div>
            <div><code>file.listFiles(dir)</code><span>Returns a list of filenames and directory names in dir.</span></div>
            <div><code>file.makeDir(path)</code><span>Creates a directory at path.</span></div>
            <div><code>file.removeDir(path)</code><span>Removes an empty directory at path.</span></div>
            <div><code>file.open(path, mode)</code><span>Opens a file stream with mode string r, w, a, rb, wb, or ab and returns a File object.</span></div>
            <div><code>fileHandle.read()</code><span>Reads content from an open File object.</span></div>
            <div><code>fileHandle.write(text)</code><span>Writes content to an open File object.</span></div>
            <div><code>fileHandle.close()</code><span>Closes an open File object.</span></div>
          </div>

          <h3>JSON module: std.json</h3>
          <div className="doc-table">
            <div><b>Export</b><b>Description</b></div>
            <div><code>json.parse(text)</code><span>Parses a JSON string into Pogberry lists, maps, numbers, strings, and booleans.</span></div>
            <div><code>json.stringify(value)</code><span>Encodes Pogberry lists, maps, numbers, strings, and booleans into a JSON string.</span></div>
          </div>

          <h3>2D Camera module: std.camera</h3>
          <div className="doc-table">
            <div><b>Export</b><b>Description</b></div>
            <div><code>camera.Camera(viewW, viewH)</code><span>Constructs a 2D camera with viewport width and height.</span></div>
            <div><code>cam.setZoom(zoom)</code><span>Sets zoom factor between 0.25 and 4.0.</span></div>
            <div><code>cam.snapTo(wx, wy)</code><span>Centers camera immediately on world coordinates wx and wy.</span></div>
            <div><code>cam.follow(wx, wy, smoothing, dt)</code><span>Smoothly interpolates camera toward world target.</span></div>
            <div><code>cam.clampTo(minX, minY, maxX, maxY)</code><span>Restricts camera position within bounding box limits.</span></div>
            <div><code>cam.addShake(amount)</code><span>Adds trauma from 0.0 to 1.0 for screen shake effects.</span></div>
            <div><code>cam.update(dt)</code><span>Decays trauma and calculates randomized shake offsets.</span></div>
            <div><code>cam.applyX(wx)</code><span>Converts world X coordinate to screen X pixel coordinate.</span></div>
            <div><code>cam.applyY(wy)</code><span>Converts world Y coordinate to screen Y pixel coordinate.</span></div>
            <div><code>cam.worldX(sx)</code><span>Converts screen X pixel coordinate to world X coordinate.</span></div>
            <div><code>cam.worldY(sy)</code><span>Converts screen Y pixel coordinate to world Y coordinate.</span></div>
            <div><code>cam.isVisible(wx, wy, w, h, margin)</code><span>Returns true if the bounding rectangle is within the visible viewport.</span></div>
          </div>

          <h3>UI widget module: std.ui</h3>
          <div className="doc-table">
            <div><b>Export</b><b>Description</b></div>
            <div><code>ui.TextField(maxLength)</code><span>Constructs a text input controller with optional maximum character length.</span></div>
            <div><code>field.insertChar(ch)</code><span>Inserts a character string at the cursor position.</span></div>
            <div><code>field.eraseOne()</code><span>Deletes the character preceding the cursor.</span></div>
            <div><code>field.moveCursor(delta)</code><span>Shifts the cursor position by delta characters.</span></div>
            <div><code>field.update(dt)</code><span>Reads characters from input buffer and handles backspace, enter, and escape keys.</span></div>
          </div>

          <h3>Host time module: pb.time</h3>
          <div className="doc-table">
            <div><b>Export</b><b>Description</b></div>
            <div><code>time.unix()</code><span>Returns current Unix epoch time in seconds.</span></div>
            <div><code>time.cpu()</code><span>Returns processor execution time in seconds.</span></div>
            <div><code>time.sleep(seconds)</code><span>Suspends program execution for seconds.</span></div>
            <div><code>time.parts()</code><span>Returns a map with broken-down date components year, month, day, hour, min, sec, wday, yday, and isdst.</span></div>
            <div><code>time.parts(timestamp, utc)</code><span>Breaks down timestamp into a date map in local time or UTC.</span></div>
            <div><code>time.format(formatStr)</code><span>Formats the current time using standard strftime format specifiers.</span></div>
            <div><code>time.format(formatStr, timestamp, utc)</code><span>Formats timestamp using strftime specifiers.</span></div>
            <div><code>time.fromParts(map, utc)</code><span>Converts a broken-down date map into a Unix epoch timestamp number.</span></div>
          </div>
        </section>

        <section id="colors">
          <p className="doc-section-label">GRAPHICS SUBSYSTEM</p>
          <h2>Color preset system</h2>
          <p className="doc-lead">All 2D and 3D drawing functions accept built-in module constants, preset name strings, hex color codes, and alpha helpers without writing raw RGB numbers.</p>
          <CodeBlock code={colorPresetsTemplate} title="colors_demo.pb" />

          <h3>Module color constants</h3>
          <p>Every standard palette color is available directly on <code>gui</code> as an uppercase constant.</p>
          <div className="doc-table">
            <div><b>Constant</b><b>Color</b></div>
            <div><code>gui.RAYWHITE</code><span>Raylib off-white background color.</span></div>
            <div><code>gui.WHITE</code><span>Pure white.</span></div>
            <div><code>gui.BLACK</code><span>Pure black.</span></div>
            <div><code>gui.BLANK, gui.TRANSPARENT</code><span>Fully transparent color with zero alpha.</span></div>
            <div><code>gui.LIGHTGRAY, gui.GRAY, gui.DARKGRAY</code><span>Standard neutral gray tones.</span></div>
            <div><code>gui.RED, gui.MAROON</code><span>Bright red and deep maroon tones.</span></div>
            <div><code>gui.GREEN, gui.LIME, gui.DARKGREEN</code><span>Standard green, bright lime, and dark green tones.</span></div>
            <div><code>gui.SKYBLUE, gui.BLUE, gui.DARKBLUE</code><span>Sky blue, standard saturated blue, and dark blue tones.</span></div>
            <div><code>gui.YELLOW, gui.GOLD, gui.ORANGE</code><span>Vivid yellow, warm gold, and rich orange tones.</span></div>
            <div><code>gui.PINK, gui.MAGENTA</code><span>Soft pink and bright magenta tones.</span></div>
            <div><code>gui.PURPLE, gui.VIOLET, gui.DARKPURPLE</code><span>Medium purple, violet, and deep purple tones.</span></div>
            <div><code>gui.BEIGE, gui.BROWN, gui.DARKBROWN</code><span>Earthy beige, warm brown, and dark brown tones.</span></div>
            <div><code>gui.CYAN</code><span>Pure cyan tone.</span></div>
          </div>

          <h3>Color helper functions</h3>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.fade(color, alpha)</code><span>Returns a color list with adjusted opacity. Alpha accepts a float from 0.0 to 1.0 or an integer from 0 to 255.</span></div>
            <div><code>gui.color(color, alpha)</code><span>Converts a preset name, hex string, or color value into a color list with optional opacity.</span></div>
          </div>

          <h3>Preset names and hex strings</h3>
          <p>Drawing functions accept case-insensitive string names such as <code>"red"</code>, <code>"darkgray"</code>, <code>"skyblue"</code>, and <code>"gold"</code>. Hex codes with three, four, six, or eight characters are also supported, including <code>"#ff0000"</code>, <code>"#334455"</code>, and <code>"#00ff0088"</code>.</p>
        </section>

        <section id="gui" className="manual-game-section">
          <p className="doc-section-label">2D GAME ENGINE</p>
          <h2>2D game development with pb_gui</h2>
          <p className="doc-lead">Pogberry includes a full 2D game engine module powered by Raylib. It provides window control, shapes, fonts, keyboard and mouse input, 2D collisions, sprite textures, audio playback, and custom shaders.</p>
          <CodeBlock code={raylib2DTemplate} title="game_2d.pb" />

          <h3>1. Windowing and display</h3>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.initWindow(w, h, title)</code><span>Creates a graphical display window with width, height, and title.</span></div>
            <div><code>gui.closeWindow()</code><span>Closes the window and frees graphics and audio subsystems.</span></div>
            <div><code>gui.windowShouldClose()</code><span>Returns true if the close button or exit key was pressed.</span></div>
            <div><code>gui.isWindowMinimized()</code><span>Returns true if the window is currently minimized.</span></div>
            <div><code>gui.isWindowFocused()</code><span>Returns true if the window currently has input focus.</span></div>
            <div><code>gui.isWindowResized()</code><span>Returns true if the window was resized in the current frame.</span></div>
            <div><code>gui.toggleFullscreen()</code><span>Toggles fullscreen display mode on the active monitor.</span></div>
            <div><code>gui.toggleBorderlessWindowed()</code><span>Toggles borderless windowed mode.</span></div>
            <div><code>gui.setWindowTitle(title)</code><span>Updates the window title text.</span></div>
            <div><code>gui.setWindowSize(w, h)</code><span>Changes the window dimensions to width and height.</span></div>
            <div><code>gui.setWindowPosition(x, y)</code><span>Moves the window to display coordinates x and y.</span></div>
            <div><code>gui.isWindowFullscreen()</code><span>Returns true if the window is running fullscreen.</span></div>
            <div><code>gui.isWindowMaximized()</code><span>Returns true if the window is maximized.</span></div>
            <div><code>gui.maximizeWindow()</code><span>Maximizes the window.</span></div>
            <div><code>gui.restoreWindow()</code><span>Restores the window from maximized state.</span></div>
            <div><code>gui.hideCursor()</code><span>Hides the mouse cursor.</span></div>
            <div><code>gui.showCursor()</code><span>Makes the mouse cursor visible.</span></div>
            <div><code>gui.setTargetFPS(fps)</code><span>Limits framerate to target frames per second.</span></div>
            <div><code>gui.getFPS()</code><span>Returns current rendered frames per second.</span></div>
            <div><code>gui.getFrameTime()</code><span>Returns delta time in seconds for the previous frame.</span></div>
            <div><code>gui.getTime()</code><span>Returns elapsed seconds since window initialization.</span></div>
            <div><code>gui.getScreenWidth()</code><span>Returns the window width in pixels.</span></div>
            <div><code>gui.getScreenHeight()</code><span>Returns the window height in pixels.</span></div>
            <div><code>gui.setVirtualResolution(w, h)</code><span>Sets virtual render dimensions for pixel-perfect scaling.</span></div>
            <div><code>gui.getRenderWidth()</code><span>Returns the active render target width in pixels.</span></div>
            <div><code>gui.getRenderHeight()</code><span>Returns the active render target height in pixels.</span></div>
            <div><code>gui.takeScreenshot(filename)</code><span>Writes the current screen contents to an image file.</span></div>
            <div><code>gui.setTraceLogLevel(level)</code><span>Sets Raylib log level to ALL, DEBUG, INFO, WARN, ERROR, or NONE.</span></div>
            <div><code>gui.setDebugMode(enabled)</code><span>Enables or disables engine debug logging.</span></div>
            <div><code>gui.setExitKey(keyName)</code><span>Sets the keyboard key that closes the window. Pass empty string or KEY_NULL to disable.</span></div>
          </div>

          <h3>2. Shapes and drawing</h3>
          <p>Drawing commands run between <code>gui.beginDrawing()</code> and <code>gui.endDrawing()</code>. Shapes accept color preset constants, preset name strings, hex codes, or lists created with <code>gui.fade</code>.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.beginDrawing()</code><span>Begins 2D drawing canvas pass for the current frame.</span></div>
            <div><code>gui.endDrawing()</code><span>Submits drawing commands and swaps screen buffers.</span></div>
            <div><code>gui.clearBackground(color)</code><span>Clears the canvas with a solid color preset, hex string, or color value.</span></div>
            <div><code>gui.drawPixel(x, y, color)</code><span>Draws a single pixel at coordinate x, y with color. Also accepts <code>drawPixel(pos, color)</code>.</span></div>
            <div><code>gui.drawLine(x1, y1, x2, y2, color)</code><span>Draws a line between two points. Also accepts <code>drawLine(p1, p2, color)</code>.</span></div>
            <div><code>gui.drawCircle(cx, cy, radius, color)</code><span>Draws a solid filled circle with color. Also accepts <code>drawCircle(center, radius, color)</code>.</span></div>
            <div><code>gui.drawCircleLines(cx, cy, radius, color)</code><span>Draws an outline circle ring with color. Also accepts <code>drawCircleLines(center, radius, color)</code>.</span></div>
            <div><code>gui.drawCircleAlpha(cx, cy, radius, color, alpha)</code><span>Draws a circle with opacity. Also accepts <code>drawCircleAlpha(center, radius, colorWithAlpha)</code>.</span></div>
            <div><code>gui.drawEllipse(cx, cy, rx, ry, color)</code><span>Draws a solid ellipse with horizontal and vertical radii. Also accepts <code>drawEllipse(center, [rx, ry], color)</code>.</span></div>
            <div><code>gui.drawRectangle(x, y, w, h, color)</code><span>Draws a solid filled rectangle with color. Also accepts <code>drawRectangle([x, y, w, h], color)</code>.</span></div>
            <div><code>gui.drawRectangleLines(x, y, w, h, color)</code><span>Draws a rectangle outline border with color. Also accepts <code>drawRectangleLines([x, y, w, h], color)</code>.</span></div>
            <div><code>gui.drawRectangleAlpha(x, y, w, h, color, alpha)</code><span>Draws a rectangle with opacity. Also accepts <code>drawRectangleAlpha(rect, color, alpha)</code>.</span></div>
            <div><code>gui.drawRectangleRounded(x, y, w, h, roundness, segs, color)</code><span>Draws a rounded rectangle with corner roundness and color. Also accepts <code>drawRectangleRounded(rect, roundness, segs, color)</code>.</span></div>
          </div>

          <h3>3. Typography and text</h3>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.drawText(text, x, y, size, color)</code><span>Renders text at coordinate x, y with font size and color. Also accepts <code>drawText(text, pos, size, color)</code>.</span></div>
            <div><code>gui.measureText(text, size)</code><span>Returns text width in pixels for layout calculations.</span></div>
            <div><code>gui.drawFPS(x, y)</code><span>Draws the built-in real-time FPS counter at coordinate x, y.</span></div>
            <div><code>gui.loadFont(path)</code><span>Loads a TTF or OTF font file from disk and returns an integer font handle.</span></div>
            <div><code>gui.unloadFont(id)</code><span>Releases the loaded font from memory.</span></div>
            <div><code>gui.drawTextFont(id, text, x, y, size, spacing, color)</code><span>Renders text with a custom font, character spacing, and color. Also accepts <code>drawTextFont(id, text, pos, size, spacing, color)</code>.</span></div>
            <div><code>gui.measureTextFont(id, text, size, spacing)</code><span>Measures text width in pixels using a custom font.</span></div>
            <div><code>gui.measureTextHeight(id, text, size, spacing)</code><span>Measures text height in pixels using a custom font.</span></div>
            <div><code>gui.measureTextEx(id, text, size, spacing)</code><span>Measures both text width and height, returning a list [width, height].</span></div>
          </div>

          <h3>4. Input: keyboard and mouse</h3>
          <p>Key queries accept standard key names such as KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN, KEY_SPACE, KEY_ENTER, KEY_ESCAPE, KEY_W, KEY_A, KEY_S, and KEY_D.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.isKeyDown(keyName)</code><span>Returns true continuously while the key is held down.</span></div>
            <div><code>gui.isKeyPressed(keyName)</code><span>Returns true on the single frame the key was pressed down.</span></div>
            <div><code>gui.isKeyReleased(keyName)</code><span>Returns true on the frame the key was released.</span></div>
            <div><code>gui.isKeyUp(keyName)</code><span>Returns true while the key is up.</span></div>
            <div><code>gui.getKeyPressed()</code><span>Returns the next keycode integer from the input buffer.</span></div>
            <div><code>gui.getCharPressed()</code><span>Returns the next unicode codepoint integer from the input buffer.</span></div>
            <div><code>gui.readChar()</code><span>Returns the next character string from input, or an empty string if empty.</span></div>
            <div><code>gui.getMouseX()</code><span>Returns the mouse horizontal pixel coordinate.</span></div>
            <div><code>gui.getMouseY()</code><span>Returns the mouse vertical pixel coordinate.</span></div>
            <div><code>gui.isMouseButtonDown(button)</code><span>Returns true while the mouse button is down, such as LEFT or RIGHT.</span></div>
            <div><code>gui.isMouseButtonPressed(button)</code><span>Returns true on the frame the mouse button was clicked.</span></div>
            <div><code>gui.isMouseButtonReleased(button)</code><span>Returns true on the frame the mouse button was released.</span></div>
            <div><code>gui.isMouseButtonUp(button)</code><span>Returns true while the mouse button is released.</span></div>
            <div><code>gui.getMouseWheelMove()</code><span>Returns mouse wheel movement delta for the frame.</span></div>
          </div>

          <h3>5. 2D Collision detection</h3>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.checkCollisionRecs(x1, y1, w1, h1, x2, y2, w2, h2)</code><span>Tests intersection between two axis-aligned rectangles.</span></div>
            <div><code>gui.checkCollisionCircles(x1, y1, r1, x2, y2, r2)</code><span>Tests intersection between two circles.</span></div>
            <div><code>gui.checkCollisionCircleRec(cx, cy, r, rx, ry, rw, rh)</code><span>Tests intersection between a circle and a rectangle.</span></div>
            <div><code>gui.checkCollisionPointRec(px, py, rx, ry, rw, rh)</code><span>Tests if coordinate px, py is inside a rectangle.</span></div>
            <div><code>gui.checkCollisionPointCircle(px, py, cx, cy, r)</code><span>Tests if coordinate px, py is inside a circle.</span></div>
          </div>

          <h3>6. Textures and render targets</h3>
          <p>Load PNG, BMP, or JPEG images into GPU memory and render sub-rectangles from spritesheets.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.loadTexture(path)</code><span>Loads an image file into GPU memory and returns an integer handle.</span></div>
            <div><code>gui.unloadTexture(id)</code><span>Releases texture memory from the GPU.</span></div>
            <div><code>gui.drawTexture(id, x, y)</code><span>Draws texture at position x, y at original scale.</span></div>
            <div><code>gui.drawTextureTint(id, x, y, tint)</code><span>Draws texture tinted by a color preset, hex string, or color list.</span></div>
            <div><code>gui.drawTextureRec(id, sx, sy, sw, sh, dx, dy)</code><span>Draws a sub-rectangle from a texture to destination dx, dy.</span></div>
            <div><code>gui.drawTexturePro(id, sx, sy, sw, sh, dx, dy, dw, dh, ox, oy, rot, tint)</code><span>Draws scaled and rotated texture section with custom origin point and color tint.</span></div>
            <div><code>gui.getTextureWidth(id)</code><span>Returns the texture pixel width.</span></div>
            <div><code>gui.getTextureHeight(id)</code><span>Returns the texture pixel height.</span></div>
            <div><code>gui.loadRenderTexture(w, h)</code><span>Allocates an off-screen render texture buffer with width and height.</span></div>
            <div><code>gui.unloadRenderTexture(id)</code><span>Releases the off-screen render texture buffer from memory.</span></div>
            <div><code>gui.beginTextureMode(id)</code><span>Directs subsequent drawing operations into the render texture.</span></div>
            <div><code>gui.endTextureMode()</code><span>Restores drawing output to the main window display.</span></div>
            <div><code>gui.drawRenderTexture(id, x, y)</code><span>Draws the completed render texture to the screen.</span></div>
            <div><code>gui.drawRenderTextureRec(id, sx, sy, sw, sh, dx, dy)</code><span>Draws a region of the render texture to the screen.</span></div>
          </div>

          <h3>7. Audio: sound effects and music</h3>
          <p>Play short WAV, OGG, or MP3 sound effects from memory and stream large background tracks from disk.</p>
          <CodeBlock code={audioTemplate} title="audio_demo.pb" />
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.initAudio()</code><span>Initializes the host audio hardware and streaming device.</span></div>
            <div><code>gui.closeAudio()</code><span>Shuts down the host audio device and frees resources.</span></div>
            <div><code>gui.setMasterVolume(volume)</code><span>Sets overall audio volume from 0.0 silent to 1.0 full volume.</span></div>
            <div><code>gui.loadSound(path)</code><span>Loads a WAV, OGG, or MP3 sound effect into memory and returns a handle.</span></div>
            <div><code>gui.unloadSound(id)</code><span>Releases a sound effect from memory.</span></div>
            <div><code>gui.playSound(id)</code><span>Plays a sound effect.</span></div>
            <div><code>gui.stopSound(id)</code><span>Halts sound effect playback.</span></div>
            <div><code>gui.isSoundPlaying(id)</code><span>Returns true if the sound effect is currently playing.</span></div>
            <div><code>gui.setSoundVolume(id, volume)</code><span>Sets sound effect volume from 0.0 to 1.0.</span></div>
            <div><code>gui.setSoundPitch(id, pitch)</code><span>Adjusts the playback pitch multiplier for a sound effect.</span></div>
            <div><code>gui.loadMusic(path)</code><span>Streams an audio file from disk and returns an integer music handle.</span></div>
            <div><code>gui.unloadMusic(id)</code><span>Closes the streaming music file and frees audio buffers.</span></div>
            <div><code>gui.playMusic(id)</code><span>Starts playing streaming background music.</span></div>
            <div><code>gui.pauseMusic(id)</code><span>Pauses streaming background music.</span></div>
            <div><code>gui.resumeMusic(id)</code><span>Resumes paused streaming background music.</span></div>
            <div><code>gui.stopMusic(id)</code><span>Halts streaming background music.</span></div>
            <div><code>gui.updateMusic(id)</code><span>Streams audio data from disk into buffers. Call once per frame while music plays.</span></div>
            <div><code>gui.isMusicStreamPlaying(id)</code><span>Returns true if background music is active.</span></div>
            <div><code>gui.setMusicVolume(id, volume)</code><span>Sets streaming music volume from 0.0 to 1.0.</span></div>
          </div>

          <h3>8. Custom shaders</h3>
          <p>Load custom GLSL vertex and fragment shaders and update uniform parameters each frame.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.loadShader(vsPath, fsPath)</code><span>Loads vertex and fragment shaders. Pass nil for default vertex shader.</span></div>
            <div><code>gui.unloadShader(id)</code><span>Releases the compiled shader program from GPU memory.</span></div>
            <div><code>gui.beginShaderMode(id)</code><span>Activates custom shader pipeline for subsequent draw calls.</span></div>
            <div><code>gui.endShaderMode()</code><span>Restores the default rendering pipeline.</span></div>
            <div><code>gui.setShaderFloat(id, uniform, val)</code><span>Updates a float uniform variable in the active shader.</span></div>
            <div><code>gui.setShaderVec2(id, uniform, x, y)</code><span>Updates a 2D float vector uniform variable.</span></div>
            <div><code>gui.setShaderVec3(id, uniform, x, y, z)</code><span>Updates a 3D float vector uniform variable.</span></div>
            <div><code>gui.setShaderVec4(id, uniform, x, y, z, w)</code><span>Updates a 4D float vector uniform variable.</span></div>
            <div><code>gui.setShaderColor(id, uniform, color)</code><span>Updates a shader color uniform using a preset, hex string, or color list.</span></div>
            <div><code>gui.setShaderTexture(id, uniform, texId)</code><span>Binds a texture handle to a sampler uniform in the shader.</span></div>
          </div>
        </section>

        <section id="gui3d" className="manual-game-section">
          <p className="doc-section-label">3D GAME ENGINE</p>
          <h2>3D game development with pb_gui</h2>
          <p className="doc-lead">Pogberry includes a 3D game engine module backed by Raylib. It provides perspective camera passes, procedural 3D shapes, ground grids, billboarding, quad strips, OBJ and GLB model loading, rotation, wireframes, and material textures.</p>
          <CodeBlock code={raylib3DTemplate} title="game_3d.pb" />

          <h3>1. 3D Camera passes</h3>
          <p>All 3D drawing commands execute between <code>gui.begin3D(...)</code> and <code>gui.end3D()</code>. Once <code>end3D()</code> executes, you can draw 2D HUD text, maps, and interface cards directly on top of the scene.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.begin3D(camPos, targetPos, fovy)</code><span>Begins a 3D rendering pass with camera position, look target, and vertical field of view in degrees. Also accepts 7 numbers: camX, camY, camZ, targetX, targetY, targetZ, fovy.</span></div>
            <div><code>gui.begin3DEx(camPos, targetPos, upVec, fovy)</code><span>Begins a 3D camera pass with custom up vector for roll and camera tilt. Also accepts 10 numbers: camX, camY, camZ, targetX, targetY, targetZ, upX, upY, upZ, fovy.</span></div>
            <div><code>gui.end3D()</code><span>Ends the 3D rendering pass and restores 2D coordinate space.</span></div>
          </div>

          <h3>2. 3D Primitives and shapes</h3>
          <p>Draw cubes, spheres, cylinders, planes, triangles, quads, quad strips, and ground grids directly in world coordinates with color presets.</p>
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.drawCube3D(pos, size, color)</code><span>Draws a solid 3D cube. Size accepts a single dimension number or a [width, height, length] list. Color accepts preset constants such as gui.SKYBLUE, preset strings, or hex strings.</span></div>
            <div><code>gui.drawCubeWires3D(pos, size, color)</code><span>Draws a wireframe 3D cube outline with color.</span></div>
            <div><code>gui.drawPlane3D(pos, size, color)</code><span>Draws a flat horizontal plane centered at pos on the XZ plane with color. Size accepts a single dimension number or a [width, length] list.</span></div>
            <div><code>gui.drawSphere3D(pos, radius, color)</code><span>Draws a solid 3D sphere at pos with radius and color.</span></div>
            <div><code>gui.drawCylinder3D(pos, radTop, radBottom, height, color)</code><span>Draws a solid 3D cylinder or cone between top and bottom radii with height and color. Also accepts pos, [radTop, radBottom, height], slices, color.</span></div>
            <div><code>gui.drawCylinderWires3D(pos, radTop, radBottom, height, color)</code><span>Draws a wireframe 3D cylinder outline with color.</span></div>
            <div><code>gui.drawTriangle3D(p1, p2, p3, color)</code><span>Draws a solid 3D triangle between three 3D points with color.</span></div>
            <div><code>gui.drawQuad3D(p1, p2, p3, p4, color)</code><span>Draws a solid 3D quad surface between four points with color. Also accepts <code>drawQuad3D([p1, p2, p3, p4], color)</code>.</span></div>
            <div><code>gui.drawQuadStrip3D(quads, color)</code><span>Draws a strip of 3D quads from a list of quad vertex lists with color. Optimized for track ribbons, curbs, boundaries, and roads.</span></div>
            <div><code>gui.drawGrid(slices, spacing)</code><span>Draws an XZ reference plane grid with slices subdivisions and spacing units between lines.</span></div>
            <div><code>gui.drawBillboard(textureId, pos, size, color)</code><span>Draws a 2D texture sprite in 3D world coordinates that rotates automatically to face the camera with color.</span></div>
          </div>

          <h3>3. 3D Models and meshes</h3>
          <p>Load external 3D models in OBJ, GLB, GLTF, VOX, or IQM formats. Position, rotate, scale, and bind textures to models in real time.</p>
          <CodeBlock code={model3DTemplate} title="model_demo.pb" />
          <div className="doc-table">
            <div><b>Function</b><b>Description</b></div>
            <div><code>gui.loadModel(path)</code><span>Loads a 3D model file from disk and returns an integer handle. Supports OBJ, GLB, GLTF, VOX, and IQM files.</span></div>
            <div><code>gui.unloadModel(id)</code><span>Releases loaded 3D model geometry and GPU buffers from memory.</span></div>
            <div><code>gui.drawModel(id, pos, scale, tint)</code><span>Draws a 3D model at pos with uniform scale and color tint.</span></div>
            <div><code>gui.drawModelEx(id, pos, rot, scale, tint)</code><span>Draws a 3D model with custom position, rotation, 3D scale, and color tint. Rotation accepts an angle number around Y or [rx, ry, rz, angle]. Scale accepts a number or [sx, sy, sz].</span></div>
            <div><code>gui.drawModelRotY(id, pos, rotY, scale, tint)</code><span>Draws a 3D model rotated around the vertical Y axis by rotY degrees with 3D scale [sx, sy, sz] and tint.</span></div>
            <div><code>gui.drawModelWires(id, pos, scale, tint)</code><span>Draws a wireframe outline of a 3D model with uniform scale and tint.</span></div>
            <div><code>gui.drawModelWiresEx(id, pos, rot, scale, tint)</code><span>Draws a wireframe outline of a 3D model with custom rotation, 3D scale, and tint.</span></div>
            <div><code>gui.drawModelWiresRotY(id, pos, rotY, scale, tint)</code><span>Draws a wireframe outline of a 3D model rotated around the vertical Y axis with 3D scale and tint.</span></div>
            <div><code>gui.setModelTexture(modelId, materialIndex, textureId)</code><span>Assigns a loaded texture handle to a material index on the 3D model.</span></div>
          </div>
        </section>

        <section id="games" className="manual-game-section">
          <p className="doc-section-label">MAKING GAMES</p>
          <h2>Web and desktop execution loops</h2>
          <p className="doc-lead">On desktop with the Raylib host, games control their own loop using <code>while (!gui.windowShouldClose())</code>. In the browser editor, the WebAssembly host manages non-blocking animation frames using <code>init()</code>, <code>update(dt)</code>, and <code>draw()</code>.</p>
          <CodeBlock code={lifecycle} title="main.pb" />
          <div className="lifecycle-table">
            <div><code>init()</code><p>Runs once at startup. Initialize game state and entities here.</p></div>
            <div><code>update(dt)</code><p>Runs before each frame with elapsed delta time in seconds. Advance gameplay, physics, and input here.</p></div>
            <div><code>draw()</code><p>Runs after update. Clear the background and submit drawing primitives to the canvas.</p></div>
            <div><code>shutdown()</code><p>Runs when the game closes to release resources and save persistent state.</p></div>
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
          <Link className="button primary" to="/playground">Edit the complete project</Link>
        </section>

        <section id="errors">
          <p className="doc-section-label">DIAGNOSTICS</p>
          <h2>Diagnostics and exit codes</h2>
          <p>Pogberry provides clear diagnostics without crashing the host process. Errors include file names, line numbers, and readable stack traces.</p>
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
          <p className="doc-section-label">ARCHITECTURE AND EVOLUTION</p>
          <h2>Next milestones for Pogberry</h2>
          <p>With core language capabilities, collections, classes, vectors, matrices, standard library modules, color presets, 2D rendering, and 3D rendering complete, active development focuses on engine unification and standalone distribution.</p>
          <div>
            <span>unified engine surface</span>
            <span>opaque host resources</span>
            <span>custom shaders</span>
            <span>multi-channel audio groups</span>
            <span>asset packager</span>
            <span>standalone executable export</span>
          </div>
        </section>
      </article>
    </div>
  </>
}

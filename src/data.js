export const repoUrl = 'https://github.com/tyagidevansh/pogberry'

export const consoleExamples = {
  hello: `let name = "Pogberry";
let berries = ["red", "blue", "gold"];

print("Hello from " + name + ".");
print("Berries packed: " + str(len(berries)));`,
  collections: `let inventory = ["map", "key", "potion"];
inventory.push("small sword");
inventory.remove("map");
inventory.sort();

let stats = {"health": 100, "level": 2};
stats["health"] = 85;

print("Sorted inventory: " + str(inventory));
print("Has level? " + str(stats.has("level")));
print("Health: " + str(stats.get("health", 0)));`,
  math: `use "std.math";

print("Pi: " + str(math.pi));
print("Sqrt(81): " + str(math.sqrt(81)));
print("Clamped: " + str(math.clamp(14, 0, 10)));
print("Min(10, 20): " + str(math.min(10, 20)));`,
  classes: `class Actor {
  init(name) { this.name = name; }
  speak() { print(this.name + " makes a noise."); }
}

class Slime < Actor {
  speak() { print(this.name + " goes blorp."); }
}

let slime = Slime("Pebble");
slime.speak();`
}

export const gameProjects = {
  firstGame: {
    title: 'Moving berry',
    subtitle: 'A complete game project',
    description: 'A controllable character, a game loop, drawing, input, and a separate configuration module.',
    controls: 'Arrow keys or WASD',
    entry: 'main.pb',
    files: {
      'main.pb': `use "engine.graphics";
use "engine.input";
use "game/config";

let x = 300;
let y = 160;

fun init() {
  print("Game started.");
}

fun update(dt) {
  let distance = config.speed * dt;
  if (input.down("left")) x = x - distance;
  if (input.down("right")) x = x + distance;
  if (input.down("up")) y = y - distance;
  if (input.down("down")) y = y + distance;

  x = config.clamp(x, 0, 608);
  y = config.clamp(y, 0, 328);
}

fun draw() {
  graphics.clear(202, 193, 229);
  graphics.circle(550, 70, 34, 244, 200, 77);
  graphics.rectangle(70, 92, 110, 18, 244, 240, 231);
  graphics.rectangle(105, 75, 45, 22, 244, 240, 231);
  graphics.rectangle(0, 300, 640, 60, 80, 126, 86);
  graphics.circle(x + 16, y + 17, 16, 232, 79, 115);
  graphics.rectangle(x + 17, y - 2, 13, 7, 111, 158, 101);
  graphics.rectangle(x + 8, y + 12, 4, 5, 41, 36, 50);
  graphics.rectangle(x + 21, y + 12, 4, 5, 41, 36, 50);
  graphics.text("MOVE WITH ARROWS OR WASD", 18, 28, 16, 244, 240, 231);
}`,
      'game/config.pb': `export let speed = 180;

export fun clamp(value, low, high) {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}`,
      'README.txt': `main.pb is the project entry point.
game/config.pb is imported as "game/config".

Press Run, focus the game screen, and use the arrow keys or WASD.`
    }
  },
  bounce: {
    title: 'Bouncing ball', subtitle: 'Movement and delta time',
    description: 'Frame-rate independent motion, boundary collision, and simple shape drawing.', controls: 'Runs automatically', entry: 'main.pb',
    files: { 'main.pb': `use "engine.graphics";

let x = 120;
let y = 100;
let dx = 170;
let dy = 135;

fun init() {}

fun update(dt) {
  x = x + dx * dt;
  y = y + dy * dt;
  if (x < 24 or x > 616) dx = -dx;
  if (y < 24 or y > 336) dy = -dy;
}

fun draw() {
  graphics.clear(244, 200, 77);
  graphics.circle(x, y, 22, 232, 79, 115);
  graphics.circle(x - 7, y - 5, 3, 41, 36, 50);
  graphics.circle(x + 7, y - 5, 3, 41, 36, 50);
  graphics.text("DELTA TIME KEEPS MOTION STEADY", 18, 32, 15, 41, 36, 50);
}` }
  },
  snake: {
    title: 'Pocket snake', subtitle: 'Lists, input, and a game board',
    description: 'A playable grid game whose body is a mutable list of positions.', controls: 'Arrow keys or WASD', entry: 'main.pb',
    files: { 'main.pb': `use "engine.graphics";
use "engine.input";

let snake = [[7, 7], [6, 7], [5, 7], [4, 7]];
let timer = 0;
let dx = 1;
let dy = 0;
let foodX = 15;
let foodY = 7;
let score = 0;

fun init() {}

fun update(dt) {
  if (input.down("left") and dx != 1) { dx = -1; dy = 0; }
  if (input.down("right") and dx != -1) { dx = 1; dy = 0; }
  if (input.down("up") and dy != 1) { dx = 0; dy = -1; }
  if (input.down("down") and dy != -1) { dx = 0; dy = 1; }

  timer = timer + dt;
  if (timer < 0.14) return;
  timer = 0;

  let head = snake[0];
  let nextX = head[0] + dx;
  let nextY = head[1] + dy;
  if (nextX > 19) nextX = 0;
  if (nextX < 0) nextX = 19;
  if (nextY > 9) nextY = 0;
  if (nextY < 0) nextY = 9;
  snake.insert(0, [nextX, nextY]);

  if (nextX == foodX and nextY == foodY) {
    score = score + 1;
    foodX = (foodX + 7) % 20;
    foodY = (foodY + 3) % 10;
  } else {
    snake.pop();
  }
}

fun draw() {
  graphics.clear(31, 28, 40);
  for (var i = 0; i < len(snake); i = i + 1) {
    let part = snake[i];
    graphics.rectangle(part[0] * 30 + 20, part[1] * 30 + 48,
      26, 26, 184, 220, 192);
  }
  graphics.circle(foodX * 30 + 33, foodY * 30 + 61,
    10, 232, 79, 115);
  graphics.text("POCKET SNAKE   SCORE " + str(score),
    20, 16, 16, 244, 240, 231);
}` }
  },
  orbit: {
    title: 'Berry catcher', subtitle: 'Rules, state, and scoring',
    description: 'Move the basket, catch falling berries, and keep score across frames.', controls: 'Left/right arrows or A/D', entry: 'main.pb',
    files: { 'main.pb': `use "engine.graphics";
use "engine.input";

let playerX = 280;
let berryX = 110;
let berryY = 45;
let score = 0;
let misses = 0;

fun resetBerry() {
  berryY = -18;
  berryX = (berryX + 173) % 580 + 30;
}

fun init() {}

fun update(dt) {
  if (input.down("left")) playerX = playerX - 230 * dt;
  if (input.down("right")) playerX = playerX + 230 * dt;
  if (playerX < 18) playerX = 18;
  if (playerX > 542) playerX = 542;

  berryY = berryY + 125 * dt;
  if (berryY > 292 and berryY < 330 and
      berryX > playerX - 8 and berryX < playerX + 106) {
    score = score + 1;
    resetBerry();
  }
  if (berryY > 370) {
    misses = misses + 1;
    resetBerry();
  }
}

fun draw() {
  graphics.clear(31, 28, 40);
  graphics.circle(berryX, berryY, 14, 232, 79, 115);
  graphics.rectangle(berryX + 2, berryY - 18, 12, 5, 111, 158, 101);
  graphics.rectangle(playerX, 307, 80, 17, 244, 200, 77);
  graphics.rectangle(playerX + 8, 324, 64, 13, 184, 220, 192);
  graphics.text("SCORE " + str(score) + "   MISSED " + str(misses),
    20, 22, 16, 244, 240, 231);
  graphics.text("MOVE THE BASKET WITH LEFT AND RIGHT",
    20, 52, 13, 184, 174, 194);
} ` }
  },
  cube3d: {
    title: '3D wireframe cube',
    subtitle: 'Perspective projection and rotation',
    description: 'Real time 3D perspective projection rotating eight cube vertices across pitch and yaw with depth scaling.',
    controls: 'Arrow keys or WASD rotate, SPACE toggles spin',
    entry: 'main.pb',
    files: {
      'main.pb': `use "engine.graphics";
use "engine.input";
use "std.math";
use "math3d";

let vertices = [
  [-1.0, -1.0, -1.0],
  [ 1.0, -1.0, -1.0],
  [ 1.0,  1.0, -1.0],
  [-1.0,  1.0, -1.0],
  [-1.0, -1.0,  1.0],
  [ 1.0, -1.0,  1.0],
  [ 1.0,  1.0,  1.0],
  [-1.0,  1.0,  1.0]
];

let edges = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7]
];

let rotX = 0.4;
let rotY = 0.6;
let autoSpin = true;
let spaceHeld = false;

fun init() {
  print("3D cube initialized.");
}

fun drawLine(x1, y1, x2, y2, r, g, b) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let len = math.sqrt(dx * dx + dy * dy);
  let steps = math.floor(len / 4.0);
  if (steps < 1) steps = 1;
  for (let s = 0; s <= steps; s = s + 1) {
    let t = s / steps;
    graphics.circle(x1 + dx * t, y1 + dy * t, 1.5, r, g, b);
  }
}

fun update(dt) {
  if (input.down("space")) {
    if (!spaceHeld) {
      autoSpin = !autoSpin;
      spaceHeld = true;
    }
  } else {
    spaceHeld = false;
  }

  if (autoSpin) {
    rotX = rotX + 0.6 * dt;
    rotY = rotY + 0.9 * dt;
  }

  if (input.down("left") or input.down("a")) rotY = rotY - 2.0 * dt;
  if (input.down("right") or input.down("d")) rotY = rotY + 2.0 * dt;
  if (input.down("up") or input.down("w")) rotX = rotX - 2.0 * dt;
  if (input.down("down") or input.down("s")) rotX = rotX + 2.0 * dt;
}

fun draw() {
  graphics.clear(24, 20, 32);

  let projected = [];
  for (let i = 0; i < len(vertices); i = i + 1) {
    let v = vertices[i];
    let pt = math3d.project(v[0], v[1], v[2], rotX, rotY, 260.0, 3.4, 320.0, 175.0);
    projected.push(pt);
  }

  for (let e = 0; e < len(edges); e = e + 1) {
    let edge = edges[e];
    let p1 = projected[edge[0]];
    let p2 = projected[edge[1]];
    drawLine(p1[0], p1[1], p2[0], p2[1], 232, 79, 115);
  }

  for (let i = 0; i < len(projected); i = i + 1) {
    let pt = projected[i];
    let radius = 18.0 / pt[2];
    if (radius < 2.0) radius = 2.0;
    graphics.circle(pt[0], pt[1], radius, 244, 200, 77);
    graphics.circle(pt[0], pt[1], radius * 0.5, 255, 255, 255);
  }

  graphics.text("3D PERSPECTIVE CUBE", 24, 20, 16, 244, 200, 77);
  graphics.text("VERTICES 8   EDGES 12", 24, 46, 12, 184, 174, 194);
  graphics.text("ARROWS/WASD ROTATE   SPACE TOGGLE SPIN", 24, 324, 12, 202, 193, 229);
}`,
      'math3d.pb': `use "std.math";

export let pi = 3.14159265;
export let twoPi = 6.2831853;

export fun sin(x) {
  let v = x;
  while (v > pi) v = v - twoPi;
  while (v < -pi) v = v + twoPi;
  let v2 = v * v;
  let v3 = v * v2;
  let v5 = v3 * v2;
  let v7 = v5 * v2;
  let v9 = v7 * v2;
  return v - v3 / 6.0 + v5 / 120.0 - v7 / 5040.0 + v9 / 362880.0;
}

export fun cos(x) {
  return sin(x + 1.5707963);
}

export fun project(x, y, z, angleX, angleY, fov, dist, cx, cy) {
  let cx_cos = cos(angleX);
  let cx_sin = sin(angleX);
  let cy_cos = cos(angleY);
  let cy_sin = sin(angleY);

  let x1 = x * cy_cos + z * cy_sin;
  let y1 = y;
  let z1 = -x * cy_sin + z * cy_cos;

  let x2 = x1;
  let y2 = y1 * cx_cos - z1 * cx_sin;
  let z2 = y1 * cx_sin + z1 * cx_cos;

  let depth = z2 + dist;
  if (depth < 0.1) depth = 0.1;
  let sx = cx + (x2 * fov) / depth;
  let sy = cy + (y2 * fov) / depth;
  return [sx, sy, depth];
}`,
      'README.txt': `main.pb is the entry file.
math3d.pb provides trigonometric formulas and perspective projection.

Use the arrow keys or WASD to rotate the cube. Press Space to toggle continuous spin.`
    }
  }
}

export const installOptions = {
  linux: { label: 'Linux', title: 'Build and install the CLI & GUI', text: 'Build the VM, Raylib 2D engine adapter, standard library, and CLI for your user.', requires: ['gcc', 'make', 'raylib', 'readline', 'git'], command: `git clone https://github.com/tyagidevansh/pogberry.git
cd pogberry
make
make raylib-backend
make test
make install PREFIX="$HOME/.local"
pb run examples/games/cyber_runner` },
  windows: { label: 'Windows', title: 'Build on Windows', text: 'Use a Developer Command Prompt or MinGW environment with GCC and Make available.', requires: ['gcc', 'make', 'git'], command: `git clone https://github.com/tyagidevansh/pogberry.git
cd pogberry
make
build\\pb.exe run examples/basics/hello_world.pb` },
  source: { label: 'Embed it', title: 'Embed Pogberry in a host', text: 'Build the VM as a shared library and include the public C header in your application.', requires: ['C11', 'make'], command: `git clone https://github.com/tyagidevansh/pogberry.git
cd pogberry
make shared

# Linux: build/libpb.so
# Windows: build/pb.dll
# Public embedding header: src/headers/pb.h` },
  web: { label: 'WebAssembly', title: 'Compile the VM for the browser', text: 'Emscripten compiles the same scanner, compiler, bytecode VM, and garbage collector used by the CLI.', requires: ['emsdk', 'emcc'], command: `source /path/to/emsdk/emsdk_env.sh
cd pb-site
npm run build:wasm
npm run dev` }
}


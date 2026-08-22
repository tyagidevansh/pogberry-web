export const repoUrl = 'https://github.com/tyagidevansh/pogberry'

export const consoleExamples = {
  hello: `let name = "Pogberry";
let berries = ["red", "blue", "gold"];

print("Hello from " + name + ".");
print("Berries packed: " + str(len(berries)));`,
  collections: `let inventory = ["map", "key", "potion"];
inventory.push("small sword");
inventory.remove("map");

let stats = {"health": 100, "level": 2};
stats["health"] = 85;

print(inventory);
print(stats);`,
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
}` }
  }
}

export const installOptions = {
  linux: { label: 'Linux', title: 'Build and install the CLI', text: 'Build the VM and install the CLI, engine adapter, and standard library for your user.', requires: ['gcc', 'make', 'readline', 'git'], command: `git clone https://github.com/tyagidevansh/pogberry.git
cd pogberry
make
make test
make install PREFIX="$HOME/.local"
pb repl` },
  windows: { label: 'Windows', title: 'Build on Windows', text: 'Use a Developer Command Prompt or MinGW environment with GCC and Make available.', requires: ['gcc', 'make', 'git'], command: `git clone https://github.com/tyagidevansh/pogberry.git
cd pogberry
make
build\\pb.exe repl` },
  source: { label: 'Embed it', title: 'Embed Pogberry in a host', text: 'Build the VM as a shared library and include the public C header in your application.', requires: ['C11', 'make'], command: `git clone https://github.com/tyagidevansh/pogberry.git
cd pogberry
make shared

# Linux: build/libpb.so
# Windows: build/pb.dll
# Header: src/headers/pb.h` },
  web: { label: 'WebAssembly', title: 'Compile the VM for the browser', text: 'Emscripten compiles the same scanner, compiler, bytecode VM, and garbage collector used by the CLI.', requires: ['emsdk', 'emcc'], command: `source /path/to/emsdk/emsdk_env.sh
cd pb-site
npm run build:wasm
npm run dev` }
}

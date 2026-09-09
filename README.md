# Pogberry website

The site with complete language and game guide, playable example projects, downloads, architecture overview, and browser editor for [Pogberry](https://github.com/tyagidevansh/pogberry).

## Run the site

```sh
npm install
npm run dev
```

## Build the real Pogberry VM for the browser

The editor does not reimplement the language in JavaScript. It runs the actual C VM inside a Web Worker. The build expects the Pogberry repository at `../pogberry` by default.

Install and activate the official Emscripten SDK, then run:

```sh
source /path/to/emsdk/emsdk_env.sh
npm run build:wasm
```

The script compiles `../pogberry/src/*.c` with `wasm/bridge.c` and writes these generated assets:

```text
public/runtime/pogberry.js
public/runtime/pogberry.wasm
```

If the language repository lives somewhere else:

```sh
POGBERRY_DIR=/absolute/path/to/pogberry npm run build:wasm
```

The bridge supports ordinary scripts, registered source modules, and persistent game sessions. Its browser host currently provides `engine.graphics` and `engine.input`, calls `init`, `update`, and `draw`, and sends drawing commands back to Canvas. The editor includes a file tree, directories, tabs, local persistence, project import/export, terminal diagnostics, keyboard input, and a live game viewport.


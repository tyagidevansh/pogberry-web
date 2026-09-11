#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
POGBERRY_DIR="${POGBERRY_DIR:-$SITE_DIR/../pogberry}"
OUTPUT_DIR="$SITE_DIR/public/runtime"

if ! command -v emcc >/dev/null 2>&1; then
  echo "emcc was not found. Activate emsdk first: source /path/to/emsdk/emsdk_env.sh" >&2
  exit 1
fi

if [[ ! -f "$POGBERRY_DIR/src/headers/pb.h" ]]; then
  echo "Pogberry source not found at $POGBERRY_DIR" >&2
  echo "Set POGBERRY_DIR=/absolute/path/to/pogberry and try again." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

emcc \
  "$SITE_DIR/wasm/bridge.c" \
  "$POGBERRY_DIR"/src/*.c \
  -I"$POGBERRY_DIR/src" \
  -O3 \
  -flto \
  -sMODULARIZE=1 \
  -sEXPORT_ES6=1 \
  -sENVIRONMENT=web,worker \
  -sENVIRONMENT=web,worker,node \
  -sALLOW_MEMORY_GROWTH=1 \
  -sINITIAL_MEMORY=16777216 \
  -sSTACK_SIZE=1048576 \
  -sFILESYSTEM=0 \
  -sASSERTIONS=0 \
  -sEXPORTED_FUNCTIONS=_pb_web_clear_modules,_pb_web_add_module,_pb_web_run,_pb_web_game_start,_pb_web_game_frame,_pb_web_game_stop,_pb_web_set_key,_pb_web_output,_pb_web_diagnostics,_pb_web_commands \
  -sEXPORTED_RUNTIME_METHODS=ccall,UTF8ToString \
  -o "$OUTPUT_DIR/pogberry.js"

echo "Built $OUTPUT_DIR/pogberry.js and $OUTPUT_DIR/pogberry.wasm"

#include <math.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>

#include <emscripten/emscripten.h>
#include "headers/pb.h"

#define PB_WEB_BUFFER_SIZE (1024 * 1024)
#define PB_WEB_MAX_MODULES 64
#define PB_WEB_MAX_KEYS 32

typedef struct { char *name; char *source; } WebModule;

static char outputBuffer[PB_WEB_BUFFER_SIZE];
static size_t outputLength;
static char diagnosticBuffer[PB_WEB_BUFFER_SIZE];
static size_t diagnosticLength;
static char commandBuffer[PB_WEB_BUFFER_SIZE];
static size_t commandLength;
static WebModule modules[PB_WEB_MAX_MODULES];
static size_t moduleCount;
static char *keys[PB_WEB_MAX_KEYS];
static size_t keyCount;
static PbVM *gameVM;
static double currentDt = 0.016666667;

static const char *stdMathSource =
    "use \"pb.math\" as native;\n"
    "export let pi = 3.141592653589793;\n"
    "export let e = 2.718281828459045;\n"
    "export fun abs(value) {\n"
    "  if (value == 0) return 0;\n"
    "  if (value < 0) return -value;\n"
    "  return value;\n"
    "}\n"
    "export fun floor(value) {\n"
    "  return native.floor(value);\n"
    "}\n"
    "export fun sqrt(value) {\n"
    "  return native.sqrt(value);\n"
    "}\n"
    "export fun min(left, right) {\n"
    "  if (left < right) return left;\n"
    "  return right;\n"
    "}\n"
    "export fun max(left, right) {\n"
    "  if (left > right) return left;\n"
    "  return right;\n"
    "}\n"
    "export fun clamp(value, minimum, maximum) {\n"
    "  if (value < minimum) return minimum;\n"
    "  if (value > maximum) return maximum;\n"
    "  return value;\n"
    "}\n";

static void append(char *buffer, size_t *length, const char *text, size_t textLength) {
  size_t room = PB_WEB_BUFFER_SIZE - *length - 1;
  if (textLength > room) textLength = room;
  if (textLength == 0) return;
  memcpy(buffer + *length, text, textLength);
  *length += textLength;
  buffer[*length] = '\0';
}

static void appendText(char *buffer, size_t *length, const char *text) {
  append(buffer, length, text, strlen(text));
}

static void appendCommand(const char *name, const double *values, size_t count) {
  appendText(commandBuffer, &commandLength, name);
  char number[48];
  for (size_t i = 0; i < count; i++) {
    int written = snprintf(number, sizeof(number), " %.8g", values[i]);
    if (written > 0) append(commandBuffer, &commandLength, number, (size_t)written);
  }
  appendText(commandBuffer, &commandLength, "\n");
}

static void captureOutput(PbVM *vm, const char *text, size_t length, void *userData) {
  (void)vm; (void)userData;
  append(outputBuffer, &outputLength, text, length);
}

static void captureDiagnostic(PbVM *vm, PbDiagnosticKind kind, const char *message, void *userData) {
  (void)vm; (void)kind; (void)userData;
  appendText(diagnosticBuffer, &diagnosticLength, message);
  appendText(diagnosticBuffer, &diagnosticLength, "\n");
}

static bool expectNumbers(PbVM *vm, int argCount, const PbValue *args, int expected, const char *name) {
  if (argCount != expected) {
    char message[96];
    snprintf(message, sizeof(message), "%s() expects %d arguments.", name, expected);
    pbRuntimeError(vm, message);
    return false;
  }
  for (int i = 0; i < expected; i++) {
    if (args[i].type != PB_VALUE_NUMBER || !isfinite(args[i].as.number)) {
      char message[96];
      snprintf(message, sizeof(message), "%s() expects finite numbers.", name);
      pbRuntimeError(vm, message);
      return false;
    }
  }
  return true;
}

static PbValue mathFloor(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 1, "math.floor")) return pbNilValue();
  return pbNumberValue(floor(args[0].as.number));
}

static PbValue mathSqrt(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 1, "math.sqrt")) return pbNilValue();
  return pbNumberValue(sqrt(args[0].as.number));
}

static PbValue graphicsClear(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 3, "graphics.clear")) return pbNilValue();
  double values[] = {args[0].as.number, args[1].as.number, args[2].as.number};
  appendCommand("clear", values, 3);
  return pbNilValue();
}

static PbValue graphicsRectangle(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 7, "graphics.rectangle")) return pbNilValue();
  double values[7]; for (int i = 0; i < 7; i++) values[i] = args[i].as.number;
  appendCommand("rect", values, 7);
  return pbNilValue();
}

static PbValue graphicsRectangleLines(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 7, "graphics.drawRectangleLines")) return pbNilValue();
  double values[7]; for (int i = 0; i < 7; i++) values[i] = args[i].as.number;
  appendCommand("rectLines", values, 7);
  return pbNilValue();
}

static PbValue graphicsRectangleRounded(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 9, "graphics.drawRectangleRounded")) return pbNilValue();
  double values[9]; for (int i = 0; i < 9; i++) values[i] = args[i].as.number;
  appendCommand("roundedRect", values, 9);
  return pbNilValue();
}

static PbValue graphicsCircle(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 6, "graphics.circle")) return pbNilValue();
  double values[6]; for (int i = 0; i < 6; i++) values[i] = args[i].as.number;
  appendCommand("circle", values, 6);
  return pbNilValue();
}

static PbValue graphicsCircleLines(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 6, "graphics.drawCircleLines")) return pbNilValue();
  double values[6]; for (int i = 0; i < 6; i++) values[i] = args[i].as.number;
  appendCommand("circleLines", values, 6);
  return pbNilValue();
}

static PbValue graphicsLine(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 7, "graphics.drawLine")) return pbNilValue();
  double values[7]; for (int i = 0; i < 7; i++) values[i] = args[i].as.number;
  appendCommand("line", values, 7);
  return pbNilValue();
}

static PbValue graphicsText(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (argCount != 7 || args[0].type != PB_VALUE_STRING) {
    pbRuntimeError(vm, "graphics.text() expects text followed by six numbers.");
    return pbNilValue();
  }
  for (int i = 1; i < 7; i++) {
    if (args[i].type != PB_VALUE_NUMBER || !isfinite(args[i].as.number)) {
      pbRuntimeError(vm, "graphics.text() expects text followed by six numbers.");
      return pbNilValue();
    }
  }
  double values[6]; for (int i = 0; i < 6; i++) values[i] = args[i + 1].as.number;
  appendCommand("text", values, 6);
  if (commandLength > 0 && commandBuffer[commandLength - 1] == '\n') commandBuffer[--commandLength] = '\0';
  appendText(commandBuffer, &commandLength, " ");
  for (size_t i = 0; i < args[0].as.string.length; i++) {
    unsigned char value = (unsigned char)args[0].as.string.chars[i];
    char hex[3]; snprintf(hex, sizeof(hex), "%02x", value);
    append(commandBuffer, &commandLength, hex, 2);
  }
  appendText(commandBuffer, &commandLength, "\n");
  return pbNilValue();
}

static PbValue graphicsWidth(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)args; (void)data;
  if (argCount != 0) { pbRuntimeError(vm, "graphics.width() expects no arguments."); return pbNilValue(); }
  return pbNumberValue(640);
}

static PbValue graphicsHeight(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)args; (void)data;
  if (argCount != 0) { pbRuntimeError(vm, "graphics.height() expects no arguments."); return pbNilValue(); }
  return pbNumberValue(360);
}

static bool stringEquals(PbValue value, const char *text) {
  size_t length = strlen(text);
  return value.type == PB_VALUE_STRING && value.as.string.length == length && memcmp(value.as.string.chars, text, length) == 0;
static bool keyMatches(const char *requested, const char *held) {
  if (strcmp(requested, held) == 0 || strcasecmp(requested, held) == 0) return true;
  if (strncasecmp(requested, "KEY_", 4) == 0) {
    const char *sub = requested + 4;
    if (strcasecmp(sub, held) == 0) return true;
    if (strcasecmp(sub, "LEFT") == 0 && (strcasecmp(held, "left") == 0 || strcasecmp(held, "a") == 0)) return true;
    if (strcasecmp(sub, "RIGHT") == 0 && (strcasecmp(held, "right") == 0 || strcasecmp(held, "d") == 0)) return true;
    if (strcasecmp(sub, "UP") == 0 && (strcasecmp(held, "up") == 0 || strcasecmp(held, "w") == 0)) return true;
    if (strcasecmp(sub, "DOWN") == 0 && (strcasecmp(held, "down") == 0 || strcasecmp(held, "s") == 0)) return true;
    if (strcasecmp(sub, "SPACE") == 0 && strcasecmp(held, "space") == 0) return true;
  }
  if (strcasecmp(requested, "left") == 0 && (strcasecmp(held, "KEY_LEFT") == 0 || strcasecmp(held, "KEY_A") == 0)) return true;
  if (strcasecmp(requested, "right") == 0 && (strcasecmp(held, "KEY_RIGHT") == 0 || strcasecmp(held, "KEY_D") == 0)) return true;
  if (strcasecmp(requested, "up") == 0 && (strcasecmp(held, "KEY_UP") == 0 || strcasecmp(held, "KEY_W") == 0)) return true;
  if (strcasecmp(requested, "down") == 0 && (strcasecmp(held, "KEY_DOWN") == 0 || strcasecmp(held, "KEY_S") == 0)) return true;
  if (strcasecmp(requested, "space") == 0 && strcasecmp(held, "KEY_SPACE") == 0) return true;
  return false;
}

static bool isKeyCurrentlyDown(const char *keyName) {
  for (size_t i = 0; i < keyCount; i++) {
    if (keyMatches(keyName, keys[i])) return true;
  }
  return false;
}

static PbValue inputDown(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (argCount != 1 || args[0].type != PB_VALUE_STRING) {
    pbRuntimeError(vm, "input.down() expects a key name.");
    return pbNilValue();
  }
  for (size_t i = 0; i < keyCount; i++) if (stringEquals(args[0], keys[i])) return pbBoolValue(true);
  char keyName[64];
  size_t len = args[0].as.string.length < sizeof(keyName) - 1 ? args[0].as.string.length : sizeof(keyName) - 1;
  memcpy(keyName, args[0].as.string.chars, len);
  keyName[len] = '\0';
  return pbBoolValue(isKeyCurrentlyDown(keyName));
}

/* pb_gui API Implementation */
static PbValue guiNoop(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNilValue();
}

static PbValue guiWindowShouldClose(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbBoolValue(false);
}

static PbValue guiGetScreenWidth(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(640);
}

static PbValue guiGetScreenHeight(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(360);
}

static PbValue guiGetFPS(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(60);
}

static PbValue guiGetFrameTime(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(currentDt > 0.0 ? currentDt : 0.016666667);
}

static PbValue guiGetTime(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(emscripten_get_now() / 1000.0);
}

static PbValue guiDrawPixel(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 5, "gui.drawPixel")) return pbNilValue();
  double values[7] = {args[0].as.number, args[1].as.number, 1.0, 1.0, args[2].as.number, args[3].as.number, args[4].as.number};
  appendCommand("rect", values, 7);
  return pbNilValue();
}

static PbValue guiMeasureText(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (argCount != 2 || args[0].type != PB_VALUE_STRING || args[1].type != PB_VALUE_NUMBER) {
    pbRuntimeError(vm, "gui.measureText(text, fontSize) expected.");
    return pbNilValue();
  }
  return pbNumberValue((double)args[0].as.string.length * args[1].as.number * 0.6);
}

static PbValue guiDrawFPS(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 2, "gui.drawFPS")) return pbNilValue();
  double values[6] = {args[0].as.number, args[1].as.number, 16.0, 0.0, 220.0, 100.0};
  appendCommand("text", values, 6);
  if (commandLength > 0 && commandBuffer[commandLength - 1] == '\n') commandBuffer[--commandLength] = '\0';
  appendText(commandBuffer, &commandLength, " 363020465053\n"); /* "60 FPS" in hex */
  return pbNilValue();
}

static PbValue guiIsKeyDown(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (argCount != 1 || args[0].type != PB_VALUE_STRING) {
    pbRuntimeError(vm, "gui.isKeyDown(keyName) expected.");
    return pbNilValue();
  }
  char keyName[64];
  size_t len = args[0].as.string.length < sizeof(keyName) - 1 ? args[0].as.string.length : sizeof(keyName) - 1;
  memcpy(keyName, args[0].as.string.chars, len);
  keyName[len] = '\0';
  return pbBoolValue(isKeyCurrentlyDown(keyName));
}

static PbValue guiIsKeyUp(PbVM *vm, int argCount, const PbValue *args, void *data) {
  PbValue down = guiIsKeyDown(vm, argCount, args, data);
  if (down.type != PB_VALUE_BOOL) return down;
  return pbBoolValue(!down.as.boolean);
}

static PbValue guiGetMouseX(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(0);
}

static PbValue guiGetMouseY(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(0);
}

static PbValue guiGetMouseWheelMove(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)vm; (void)argCount; (void)args; (void)data;
  return pbNumberValue(0);
}

static PbValue guiCheckCollisionRecs(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 8, "gui.checkCollisionRecs")) return pbNilValue();
  double x1 = args[0].as.number, y1 = args[1].as.number, w1 = args[2].as.number, h1 = args[3].as.number;
  double x2 = args[4].as.number, y2 = args[5].as.number, w2 = args[6].as.number, h2 = args[7].as.number;
  bool collision = (x1 < x2 + w2) && (x1 + w1 > x2) && (y1 < y2 + h2) && (y1 + h1 > y2);
  return pbBoolValue(collision);
}

static PbValue guiCheckCollisionCircles(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 6, "gui.checkCollisionCircles")) return pbNilValue();
  double x1 = args[0].as.number, y1 = args[1].as.number, r1 = args[2].as.number;
  double x2 = args[3].as.number, y2 = args[4].as.number, r2 = args[5].as.number;
  double dx = x2 - x1, dy = y2 - y1, r = r1 + r2;
  return pbBoolValue((dx * dx + dy * dy) <= (r * r));
}

static PbValue guiCheckCollisionCircleRec(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 7, "gui.checkCollisionCircleRec")) return pbNilValue();
  double cx = args[0].as.number, cy = args[1].as.number, r = args[2].as.number;
  double rx = args[3].as.number, ry = args[4].as.number, rw = args[5].as.number, rh = args[6].as.number;
  double closestX = cx < rx ? rx : (cx > rx + rw ? rx + rw : cx);
  double closestY = cy < ry ? ry : (cy > ry + rh ? ry + rh : cy);
  double dx = cx - closestX, dy = cy - closestY;
  return pbBoolValue((dx * dx + dy * dy) <= (r * r));
}

static PbValue guiCheckCollisionPointRec(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 6, "gui.checkCollisionPointRec")) return pbNilValue();
  double px = args[0].as.number, py = args[1].as.number;
  double rx = args[2].as.number, ry = args[3].as.number, rw = args[4].as.number, rh = args[5].as.number;
  bool inside = (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh);
  return pbBoolValue(inside);
}

static PbValue guiCheckCollisionPointCircle(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 5, "gui.checkCollisionPointCircle")) return pbNilValue();
  double px = args[0].as.number, py = args[1].as.number;
  double cx = args[2].as.number, cy = args[3].as.number, r = args[4].as.number;
  double dx = px - cx, dy = py - cy;
  return pbBoolValue((dx * dx + dy * dy) <= (r * r));
}

static bool registerWebCapabilities(PbVM *vm) {
  const PbNativeDefinition graphics[] = {
    {"clear", graphicsClear, NULL}, {"rectangle", graphicsRectangle, NULL},
    {"circle", graphicsCircle, NULL}, {"text", graphicsText, NULL},
    {"width", graphicsWidth, NULL}, {"height", graphicsHeight, NULL}
  };
  const PbNativeDefinition input[] = {{"down", inputDown, NULL}};
  const PbNativeDefinition mathDefs[] = {
    {"floor", mathFloor, NULL}, {"sqrt", mathSqrt, NULL}
  };
  const PbNativeDefinition guiDefs[] = {
    {"initWindow", guiNoop, NULL},
    {"closeWindow", guiNoop, NULL},
    {"windowShouldClose", guiWindowShouldClose, NULL},
    {"setTargetFPS", guiNoop, NULL},
    {"getScreenWidth", guiGetScreenWidth, NULL},
    {"getScreenHeight", guiGetScreenHeight, NULL},
    {"getFPS", guiGetFPS, NULL},
    {"getFrameTime", guiGetFrameTime, NULL},
    {"getTime", guiGetTime, NULL},
    {"beginDrawing", guiNoop, NULL},
    {"endDrawing", guiNoop, NULL},
    {"clearBackground", graphicsClear, NULL},
    {"drawPixel", guiDrawPixel, NULL},
    {"drawLine", graphicsLine, NULL},
    {"drawCircle", graphicsCircle, NULL},
    {"drawCircleLines", graphicsCircleLines, NULL},
    {"drawRectangle", graphicsRectangle, NULL},
    {"drawRectangleLines", graphicsRectangleLines, NULL},
    {"drawRectangleRounded", graphicsRectangleRounded, NULL},
    {"drawText", graphicsText, NULL},
    {"measureText", guiMeasureText, NULL},
    {"drawFPS", guiDrawFPS, NULL},
    {"isKeyDown", guiIsKeyDown, NULL},
    {"isKeyPressed", guiIsKeyDown, NULL},
    {"isKeyReleased", guiIsKeyUp, NULL},
    {"isKeyUp", guiIsKeyUp, NULL},
    {"getMouseX", guiGetMouseX, NULL},
    {"getMouseY", guiGetMouseY, NULL},
    {"getMouseWheelMove", guiGetMouseWheelMove, NULL},
    {"isMouseButtonDown", guiNoop, NULL},
    {"isMouseButtonPressed", guiNoop, NULL},
    {"isMouseButtonReleased", guiNoop, NULL},
    {"isMouseButtonUp", guiNoop, NULL},
    {"checkCollisionRecs", guiCheckCollisionRecs, NULL},
    {"checkCollisionCircles", guiCheckCollisionCircles, NULL},
    {"checkCollisionCircleRec", guiCheckCollisionCircleRec, NULL},
    {"checkCollisionPointRec", guiCheckCollisionPointRec, NULL},
    {"checkCollisionPointCircle", guiCheckCollisionPointCircle, NULL},
    {"initAudio", guiNoop, NULL},
    {"closeAudio", guiNoop, NULL},
    {"loadSound", guiNoop, NULL},
    {"unloadSound", guiNoop, NULL},
    {"playSound", guiNoop, NULL},
    {"stopSound", guiNoop, NULL},
    {"setSoundVolume", guiNoop, NULL},
    {"loadMusic", guiNoop, NULL},
    {"unloadMusic", guiNoop, NULL},
    {"playMusic", guiNoop, NULL},
    {"stopMusic", guiNoop, NULL},
    {"updateMusic", guiNoop, NULL},
    {"setMusicVolume", guiNoop, NULL}
  };

  return pbRegisterCapability(vm, "engine.graphics", graphics, sizeof(graphics) / sizeof(graphics[0])) &&
         pbRegisterCapability(vm, "engine.input", input, sizeof(input) / sizeof(input[0]));
         pbRegisterCapability(vm, "engine.input", input, sizeof(input) / sizeof(input[0])) &&
         pbRegisterCapability(vm, "pb.math", mathDefs, sizeof(mathDefs) / sizeof(mathDefs[0])) &&
         pbRegisterCapability(vm, "pb_gui", guiDefs, sizeof(guiDefs) / sizeof(guiDefs[0]));
}

static void registerStandardModules(PbVM *vm) {
  pbRegisterModuleSource(vm, "std.math", stdMathSource);
}

static void registerProjectModules(PbVM *vm) {
  registerStandardModules(vm);
  for (size_t i = 0; i < moduleCount; i++) pbRegisterModuleSource(vm, modules[i].name, modules[i].source);
}

static void resetOutput(void) {
  outputLength = diagnosticLength = commandLength = 0;
  outputBuffer[0] = diagnosticBuffer[0] = commandBuffer[0] = '\0';
}

static PbVM *createWebVM(void) {
  PbConfig config = {captureOutput, captureDiagnostic, NULL, NULL};
  PbVM *vm = pbCreateVM(&config);
  if (vm == NULL) appendText(diagnosticBuffer, &diagnosticLength, "Could not create the Pogberry VM.\n");
  return vm;
}

EMSCRIPTEN_KEEPALIVE void pb_web_clear_modules(void) {
  for (size_t i = 0; i < moduleCount; i++) { free(modules[i].name); free(modules[i].source); }
  moduleCount = 0;
}

EMSCRIPTEN_KEEPALIVE int pb_web_add_module(const char *name, const char *source) {
  if (moduleCount >= PB_WEB_MAX_MODULES || name == NULL || source == NULL) return 0;
  modules[moduleCount].name = strdup(name);
  modules[moduleCount].source = strdup(source);
  if (modules[moduleCount].name == NULL || modules[moduleCount].source == NULL) return 0;
  moduleCount++;
  return 1;
}

EMSCRIPTEN_KEEPALIVE int pb_web_run(const char *source) {
  resetOutput();
  PbVM *vm = createWebVM();
  if (vm == NULL) return INTERPRET_RUNTIME_ERROR;
  registerWebCapabilities(vm);
  registerProjectModules(vm);
  PbResult result = pbInterpret(vm, source);
  pbDestroyVM(vm);
  return result;
}

EMSCRIPTEN_KEEPALIVE int pb_web_game_start(const char *source) {
  if (gameVM != NULL) { pbDestroyVM(gameVM); gameVM = NULL; }
  resetOutput();
  gameVM = createWebVM();
  if (gameVM == NULL) return INTERPRET_RUNTIME_ERROR;
  if (!registerWebCapabilities(gameVM)) return INTERPRET_RUNTIME_ERROR;
  registerProjectModules(gameVM);
  PbResult result = pbInterpret(gameVM, source);
  if (result != INTERPRET_OK) return result;
  PbValue ignored;
  return pbCall(gameVM, "init", 0, NULL, &ignored);
}

EMSCRIPTEN_KEEPALIVE int pb_web_game_frame(double dt) {
  if (gameVM == NULL) return INTERPRET_RUNTIME_ERROR;
  currentDt = dt;
  commandLength = 0; commandBuffer[0] = '\0';
  PbValue argument = pbNumberValue(dt); PbValue ignored;
  PbResult result = pbCall(gameVM, "update", 1, &argument, &ignored);
  if (result != INTERPRET_OK) return result;
  return pbCall(gameVM, "draw", 0, NULL, &ignored);
}

EMSCRIPTEN_KEEPALIVE void pb_web_game_stop(void) {
  if (gameVM != NULL) { pbDestroyVM(gameVM); gameVM = NULL; }
  for (size_t i = 0; i < keyCount; i++) free(keys[i]);
  keyCount = 0;
}

EMSCRIPTEN_KEEPALIVE void pb_web_set_key(const char *name, int down) {
  if (name == NULL) return;
  for (size_t i = 0; i < keyCount; i++) {
    if (strcmp(keys[i], name) != 0) continue;
    if (!down) { free(keys[i]); keys[i] = keys[--keyCount]; }
    return;
  }
  if (down && keyCount < PB_WEB_MAX_KEYS) keys[keyCount++] = strdup(name);
}

EMSCRIPTEN_KEEPALIVE const char *pb_web_output(void) { return outputBuffer; }
EMSCRIPTEN_KEEPALIVE const char *pb_web_diagnostics(void) { return diagnosticBuffer; }
EMSCRIPTEN_KEEPALIVE const char *pb_web_commands(void) { return commandBuffer; }


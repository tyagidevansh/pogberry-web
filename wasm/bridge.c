#include <math.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

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

static PbValue graphicsCircle(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (!expectNumbers(vm, argCount, args, 6, "graphics.circle")) return pbNilValue();
  double values[6]; for (int i = 0; i < 6; i++) values[i] = args[i].as.number;
  appendCommand("circle", values, 6);
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
}

static PbValue inputDown(PbVM *vm, int argCount, const PbValue *args, void *data) {
  (void)data;
  if (argCount != 1 || args[0].type != PB_VALUE_STRING) {
    pbRuntimeError(vm, "input.down() expects a key name.");
    return pbNilValue();
  }
  for (size_t i = 0; i < keyCount; i++) if (stringEquals(args[0], keys[i])) return pbBoolValue(true);
  return pbBoolValue(false);
}

static bool registerWebCapabilities(PbVM *vm) {
  const PbNativeDefinition graphics[] = {
    {"clear", graphicsClear, NULL}, {"rectangle", graphicsRectangle, NULL},
    {"circle", graphicsCircle, NULL}, {"text", graphicsText, NULL},
    {"width", graphicsWidth, NULL}, {"height", graphicsHeight, NULL}
  };
  const PbNativeDefinition input[] = {{"down", inputDown, NULL}};
  return pbRegisterCapability(vm, "engine.graphics", graphics, sizeof(graphics) / sizeof(graphics[0])) &&
         pbRegisterCapability(vm, "engine.input", input, sizeof(input) / sizeof(input[0]));
}

static void registerProjectModules(PbVM *vm) {
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

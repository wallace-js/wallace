export enum COMPONENT_BUILD_PARAMS {
  component = "component",
  rootElement = "root",
  elementStash = "elements",
  miscStash = "stash",
  refs = "refs"
}

export enum COMPONENT_METHODS {
  render = "render",
  getStub = "_gs"
}

export const HTML_SPLITTER = "____split____";

export enum IMPORTABLES {
  defineComponent = "defineComponent",
  extendComponent = "extendComponent",
  findElement = "findElement",
  nestComponent = "nestComponent",
  saveRef = "saveRef",
  stashMisc = "stashMisc",
  onEvent = "onEvent",
  SequentialRepeater = "SequentialRepeater"
}

/**
 * The names allowed in xargs.
 * The value is not indicative of the final variable name.
 */
export enum XARGS {
  controller = "ctrl",
  component = "self",
  event = "event",
  element = "element"
}

/**
 * The scope variables that might be allowed in directive expressions.
 * The value is not indicative of the final variable name.
 */
export enum EXPRESSION_SCOPE_VARIABLES {
  component = "self",
  props = "props",
  element = "element",
  event = "event"
}

export enum WATCH_CALLBACK_ARGS {
  newValue = "n",
  oldValue = "o",
  element = XARGS.element,
  props = "p",
  component = "c"
}

export enum WATCH_AlWAYS_CALLBACK_ARGS {
  element = XARGS.element,
  props = "p",
  component = "c"
}

export enum EVENT_CALLBACK_ARGS {
  event = XARGS.event,
  element = XARGS.element
}

export enum SPECIAL_SYMBOLS {
  elementStash = "_e",
  objectStash = "_s",
  refs = "refs",
  noLookup = "__",
  patch = "patch",
  ctrl = "ctrl"
}

export const DOM_EVENTS = [
  "Abort",
  "AnimationCancel",
  "AnimationEnd",
  "AnimationIteration",
  "AnimationStart",
  "AuxClick",
  "BeforeInput",
  "Blur",
  "Cancel",
  "CanPlay",
  "CanPlayThrough",
  "Change",
  "Click",
  "Close",
  "ContextMenu",
  "Copy",
  "CueChange",
  "Cut",
  "DblClick",
  "Drag",
  "DragEnd",
  "DragEnter",
  "DragLeave",
  "DragOver",
  "DragStart",
  "Drop",
  "DurationChange",
  "Emptied",
  "Ended",
  "Error",
  "Focus",
  "FormData",
  "GotPointerCapture",
  "Input",
  "Invalid",
  "KeyDown",
  "KeyPress",
  "KeyUp",
  "Load",
  "LoadedData",
  "LoadedMetadata",
  "LoadStart",
  "LostPointerCapture",
  "MouseDown",
  "MouseEnter",
  "MouseLeave",
  "MouseMove",
  "MouseOut",
  "MouseOver",
  "MouseUp",
  "Paste",
  "Pause",
  "Play",
  "Playing",
  "PointerCancel",
  "PointerDown",
  "PointerEnter",
  "PointerLeave",
  "PointerMove",
  "PointerOut",
  "PointerOver",
  "PointerUp",
  "Progress",
  "RateChange",
  "Reset",
  "Resize",
  "Scroll",
  "SecurityPolicyViolation",
  "Seeked",
  "Seeking",
  "Select",
  "SlotChange",
  "Stalled",
  "Submit",
  "Suspend",
  "TimeUpdate",
  "Toggle",
  "TouchCancel",
  "TouchEnd",
  "TouchMove",
  "TouchStart",
  "TransitionCancel",
  "TransitionEnd",
  "TransitionRun",
  "TransitionStart",
  "VolumeChange",
  "Waiting",
  "Wheel"
];

export const DOM_EVENTS_LOWERCASE = DOM_EVENTS.map(e => e.toLowerCase());
export const DOM_EVENT_HANDLERS = DOM_EVENTS_LOWERCASE.map(e => `on${e}`);

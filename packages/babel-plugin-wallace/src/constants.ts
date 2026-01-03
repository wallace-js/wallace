export const HTML_SPLITTER = "____split____";

export enum IMPORTABLES {
  defineComponent = "defineComponent",
  extendComponent = "extendComponent",
  findElement = "findElement",
  getStub = "getStub",
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
  props = "props",
  event = "event",
  element = "element"
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

export enum COMPONENT_PROPERTIES {
  ctrl = "ctrl",
  props = "props",
  refs = "refs",
  root = "el",
  elements = "_e",
  watchLength = "_l",
  stash = "_s",
  previous = "_p",
  template = "_t",
  watches = "_w",
  render = "render",
  tmpThis = "_this"
}

export enum SPECIAL_SYMBOLS {
  elementStash = "_e",
  objectStash = "_s",
  previous = "_p",
  template = "_t",
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

export const HTML_SPLITTER = "____split____";

export enum IMPORTABLES {
  defineComponent = "defineComponent",
  detacher = "Detacher",
  extendComponent = "extendComponent",
  findElement = "findElement",
  getStub = "getStub",
  Nester = "Nester",
  saveRef = "saveRef",
  savePart = "savePart",
  stashMisc = "stashMisc",
  onEvent = "onEvent",
  SequentialRepeater = "SequentialRepeater",
  KeyedRepeater = "KeyedRepeater",
  toDateString = "toDateString"
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
  element = "element",
  stubs = "stubs"
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
  // We use the component-specific instances as they may get renamed.
  // props = "props",
  // component = "component",
  stash = "stash"
}

export enum EVENT_CALLBACK_ARGS {
  event = XARGS.event,
  element = XARGS.element
}

export enum COMPONENT_PROPERTIES {
  elements = "_e",
  stash = "_s",
  cache = "_c",
  dismountKeys = "_d",
  previous = "_p",
  template = "_t",
  updateInner = "_u",
  watches = "_w",
  watchLength = "_l",
  root = "el",
  ctrl = "ctrl",
  props = "props",
  ref = "ref",
  part = "part",
  render = "render",
  tmpThis = "_this",
  update = "update"
}

export enum SPECIAL_SYMBOLS {
  noLookup = "__",
  send = "send",
  patch = "patch"
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

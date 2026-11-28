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
  setAttr = "setAttr",
  SequentialRepeater = "SequentialRepeater",
  KeyedRepeater = "KeyedRepeater",
  toDateString = "toDateString",
  watch = "watch"
}

/**
 * The names allowed in xargs.
 * The value is not indicative of the final variable name.
 */
export enum XARGS {
  hub = "hub",
  component = "self",
  model = "model",
  event = "event",
  element = "element",
  stub = "stub"
}

export enum WATCH_CALLBACK_ARGS {
  newValue = "n",
  oldValue = "o",
  element = XARGS.element,
  model = "m",
  component = "c"
}

export enum WATCH_AlWAYS_CALLBACK_ARGS {
  element = XARGS.element,
  // We use the component-specific instances as they may get renamed.
  // model = "model",
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
  hub = "hub",
  model = "model",
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

// We don't support date-related types like time, week or datetime-local as they don't
// use valueAsDate as you'd expect.
export const INPUT_TYPE_VALUES = {
  checkbox: "checked",
  date: "valueAsDate",
  number: "valueAsNumber",
  range: "valueAsNumber"
};

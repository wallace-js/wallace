export enum COMPONENT_BUILD_PARAMS {
  component = "component",
  rootElement = "root"
}

export enum COMPONENT_METHODS {
  render = "render",
  getStub = "_gs"
}

export enum IMPORTABLES {
  defineComponent = "defineComponent",
  extendComponent = "extendComponent",
  findElement = "findElement",
  nestComponent = "nestComponent",
  saveRef = "saveRef",
  stashMisc = "stashMisc",
  onEvent = "onEvent",
  getSequentialRepeater = "getSequentialRepeater"
}

/**
 * The names allowed in xargs.
 * The value is not indicative of the final variable name.
 */
export enum XARGS {
  controller = "ctrl",
  component = "self",
  event = "event",
  element = "element",
  // These two are allowed, they just get renamed.
  ev = "ev",
  el = "el"
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
  event = XARGS.event
}

export enum SPECIAL_SYMBOLS {
  objectStash = "_s",
  alwaysUpdate = "__",
  patch = "patch",
  ctrl = "ctrl"
}

export const domEventNames = [
  "onAbort",
  "onAnimationCancel",
  "onAnimationEnd",
  "onAnimationIteration",
  "onAnimationStart",
  "onAuxClick",
  "onBeforeInput",
  "onBlur",
  "onCancel",
  "onCanPlay",
  "onCanPlayThrough",
  "onChange",
  "onClick",
  "onClose",
  "onContextMenu",
  "onCopy",
  "onCueChange",
  "onCut",
  "onDblClick",
  "onDrag",
  "onDragEnd",
  "onDragEnter",
  "onDragLeave",
  "onDragOver",
  "onDragStart",
  "onDrop",
  "onDurationChange",
  "onEmptied",
  "onEnded",
  "onError",
  "onFocus",
  "onFormData",
  "onGotPointerCapture",
  "onInput",
  "onInvalid",
  "onKeyDown",
  "onKeyPress",
  "onKeyUp",
  "onLoad",
  "onLoadedData",
  "onLoadedMetadata",
  "onLoadStart",
  "onLostPointerCapture",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
  "onPaste",
  "onPause",
  "onPlay",
  "onPlaying",
  "onPointerCancel",
  "onPointerDown",
  "onPointerEnter",
  "onPointerLeave",
  "onPointerMove",
  "onPointerOut",
  "onPointerOver",
  "onPointerUp",
  "onProgress",
  "onRateChange",
  "onReset",
  "onResize",
  "onScroll",
  "onSecurityPolicyViolation",
  "onSeeked",
  "onSeeking",
  "onSelect",
  "onSlotChange",
  "onStalled",
  "onSubmit",
  "onSuspend",
  "onTimeUpdate",
  "onToggle",
  "onTouchCancel",
  "onTouchEnd",
  "onTouchMove",
  "onTouchStart",
  "onTransitionCancel",
  "onTransitionEnd",
  "onTransitionRun",
  "onTransitionStart",
  "onVolumeChange",
  "onWaiting",
  "onWheel"
];

export enum WATCH_CALLBACK_PARAMS {
  newValue = "n",
  oldValue = "o",
  element = "e",
  props = "p",
  component = "c"
}

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

export enum EXTRA_PARAMETERS {
  controller = "ctrl",
  component = "self",
  event = "e"
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

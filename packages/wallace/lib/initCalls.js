import { Component } from "./component";
import { buildComponent, replaceNode } from "./utils";
import { KeyedRepeater, SequentialRepeater } from "./repeaters";
const throwAway = document.createElement("template");

/**
 * Create an element from html string.
 */
function makeEl(html) {
  throwAway.innerHTML = html;
  return throwAway.content.firstChild;
}

export function findElement(rootElement, path) {
  return path.reduce((acc, index) => acc.childNodes[index], rootElement);
}

export function nestComponent(rootElement, path, cls) {
  const el = findElement(rootElement, path),
    child = buildComponent(cls);
  replaceNode(el, child.el);
  return child;
}

/**
 * Saves a reference to element or nested component. Returns the element.
 */
export function saveRef(element, component, name) {
  component.ref[name] = element;
  return element;
}

/**
 * Stash something on the component. Returns the element.
 * The generated code is expected to keep track of the position.
 */
export function stashMisc(element, component, object) {
  component._s.push(object);
  return element;
}

export function onEvent(element, eventName, callback) {
  element.addEventListener(eventName, callback);
  return element;
}

export function getKeyedRepeater(cls, keyFn) {
  return new KeyedRepeater(cls, keyFn);
}

export function getSequentialRepeater(cls) {
  return new SequentialRepeater(cls);
}

export function extendComponent(base, componentDef) {
  // This function call will have been replaced if 2nd arg is a valid component func.
  // and therefor we would not receive it.
  if (componentDef)
    throw new Error("2nd arg to extendComponent must be a JSX arrow function");
  return _createConstructor(base);
}

export function defineComponent(
  html,
  watches,
  queries,
  buildFunction,
  inheritFrom
) {
  const ComponentDefinition = _createConstructor(inheritFrom || Component);
  const prototype = ComponentDefinition.prototype;
  //Ensure these do not clash with fields on the component itself.
  prototype._w = watches;
  prototype._q = queries;
  prototype._b = buildFunction;
  prototype._n = makeEl(html);
  return ComponentDefinition;
}

function _createConstructor(base) {
  const ComponentDefinition = function () {
    base.call(this);
  };
  ComponentDefinition.stubs = {};
  Object.assign(ComponentDefinition.stubs, base.stubs);
  // This is a helper function for the user.
  ComponentDefinition.methods = function (obj) {
    Object.assign(ComponentDefinition.prototype, obj);
  };
  ComponentDefinition.prototype = Object.create(base && base.prototype, {
    constructor: {
      value: ComponentDefinition,
      writable: true,
      configurable: true,
    },
  });
  return ComponentDefinition;
}

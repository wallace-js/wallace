import { Component } from "./component";
import { Lookup } from "./lookup";
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

export function define(componentDef, prototypeExtras, inheritFrom) {
  if (componentDef) {
    if (inheritFrom) {
      Object.assign(componentDef.prototype, inheritFrom.prototype);
    }
  } else {
    if (inheritFrom) {
      componentDef.prototype = extendComponent(inheritFrom);
    } else {
      throw new Error(
        "You must provide a component definition or inherit from one."
      );
    }
  }
  if (prototypeExtras) {
    Object.assign(componentDef.prototype, prototypeExtras);
  }
  return componentDef;
}

export function defineComponent(
  html,
  watches,
  lookups,
  buildFunction,
  inheritFrom,
  prototypeExtras
) {
  const Constructor = extendComponent(
    inheritFrom || Component,
    prototypeExtras
  );
  const prototype = Constructor.prototype;
  //Ensure these do not clash with fields on the component itself.
  prototype._w = watches;
  prototype._l = new Lookup(lookups);
  prototype._b = buildFunction;
  prototype._n = makeEl(html);
  return Constructor;
}

export function extendComponent(base, prototypeExtras) {
  const Constructor = function () {
    base.call(this);
  };
  Constructor.prototype = Object.create(base && base.prototype, {
    constructor: {
      value: Constructor,
      writable: true,
      configurable: true,
    },
  });
  Object.assign(Constructor.prototype, prototypeExtras);
  return Constructor;
}

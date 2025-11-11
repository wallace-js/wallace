import { Component } from "./component";
import { Lookup } from "./lookup";
import { buildComponent, replaceNode } from "./utils";
import { KeyedPool, SequentialPool } from "./pool";
const throwAway = document.createElement("template");

/**
 * Create an element from html string
 */
function makeEl(html) {
  throwAway.innerHTML = html;
  return throwAway.content.firstChild;
}

export const getProps = (component) => {
  return component.props;
};

export const findElement = (rootElement, path) => {
  return path.reduce((acc, index) => acc.childNodes[index], rootElement);
};

export const nestComponent = (rootElement, path, cls, parent) => {
  const el = findElement(rootElement, path),
    child = buildComponent(cls, parent);
  replaceNode(el, child.el);
  return child;
};

/**
 * Saves a reference to element or nested component. Returns the element.
 */
export const saveRef = (element, component, name) => {
  component.ref[name] = element;
  return element;
};

/**
 * Stash something on the component. Returns the element.
 * The generated code is expected to keep track of the position.
 */
export const stashMisc = (element, component, object) => {
  component._s.push(object);
  return element;
};

export const onEvent = (element, eventName, callback) => {
  element.addEventListener(eventName, callback);
  return element;
};

/**
 * Creates a pool.
 */
export const getKeyedPool = (cls, keyFn) => {
  return new KeyedPool(cls, keyFn);
};

export const getSequentialPool = (cls) => {
  return new SequentialPool(cls);
};

export function defineComponent(
  html,
  watches,
  lookups,
  buildFunction,
  inheritFrom,
  prototypeExtras,
) {
  const Constructor = extendPrototype(
    inheritFrom || Component,
    prototypeExtras,
  );
  extendComponent(Constructor.prototype, html, watches, lookups, buildFunction);
  return Constructor;
}

export function extendComponent(
  prototype,
  html,
  watches,
  lookups,
  buildFunction,
) {
  //Ensure these do not clash with fields on the component itself.
  prototype._w = watches;
  prototype._l = new Lookup(lookups);
  prototype._b = buildFunction;
  prototype._n = makeEl(html);
}

export function extendPrototype(base, prototypeExtras) {
  const Constructor = function (parent) {
    base.call(this, parent);
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

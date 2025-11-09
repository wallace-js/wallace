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
 * Saves a reference to element or nested component. Can be used to wrap a stash call.
 */
export const saveRef = (element, component, name) => {
  component.ref[name] = element;
  return element;
};

/**
 * Saves a misc object (anything that's not an element). Can be used to wrap a stash call.
 */
export const saveMiscObject = (element, component, object) => {
  component._o.push(object);
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
  /* 
  Watches is an array of objects with keys:
    e: the element reference (string)
    c: the callbacks (object)
    d: [optional] display toggle (object)

  The display toggle has keys:
    q: the query key in lookup
    s: skipCount
    r: reversed
    
  Ensure these do not clash with fields on the component itself.
  */
  prototype._w = watches;
  // .map((arr) => ({
  //   wk: arr[0], // The key of the corresponding element.
  //   sq: arr[1], // The shield query key index, or 0.
  //   rv: arr[2], // whether shieldQuery should be flipped.
  //   sc: arr[3], // The number of items to shield
  //   cb: arr[4], // The callbacks - object
  // }));
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

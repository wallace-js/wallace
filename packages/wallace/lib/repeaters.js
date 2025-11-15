import { createComponent } from "./utils";

/*
 * Gets a component from the pool.
 */
function getComponent(pool, componentDefinition, ctrl, key, props) {
  let component;
  if (pool.hasOwnProperty(key)) {
    component = pool[key];
    component.render(props, ctrl);
  } else {
    component = createComponent(componentDefinition, props, ctrl);
    pool[key] = component;
  }
  return component;
}

/**
 * Trims the unwanted child elements from the end.
 *
 * @param {Node} e
 * @param {Array} childNodes
 * @param {Int} itemsLength
 */
function trimChildren(e, childNodes, itemsLength) {
  let lastIndex = childNodes.length - 1;
  let keepIndex = itemsLength - 1;
  for (let i = lastIndex; i > keepIndex; i--) {
    e.removeChild(childNodes[i]);
  }
}

/**
 * Pulls an item forward in an array, to replicate insertBefore.
 * @param {Array} arr
 * @param {any} item
 * @param {Int} to
 */
function pull(arr, item, to) {
  const position = arr.indexOf(item);
  if (position != to) {
    arr.splice(to, 0, arr.splice(position, 1)[0]);
  }
}

/**
 * Repeats nested components, reusing items based on key.
 *
 * @param {function} componentDefinition - The ComponentDefinition to create.
 * @param {function} keyFn - A function which obtains the key.
 */
export function KeyedRepeater(componentDefinition, keyFn) {
  this._v = componentDefinition;
  this._f = keyFn;
  this._k = []; // keys
  this._p = {}; // pool of component instances
}
const proto = KeyedRepeater.prototype;

/**
 * Retrieves a single component. Though not used in wallace itself, it may
 * be used elsewhere, such as in the router.
 *
 * @param {Object} item - The item which will be passed as props.
 */
proto.getOne = function (item, ctrl) {
  return getComponent(this._p, this._v, ctrl, this._f(item), item);
};

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 */
proto.patch = function (e, items, ctrl) {
  // Attempt to speed up by reducing lookups. Does this even do anything?
  // Does webpack undo this/do it for for me? Does the engine?
  const pool = this._p;
  const componentDefinition = this._v;
  const keyFn = this._f;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  const oldKeySequence = this._k;
  const newKeys = [];
  let item,
    key,
    component,
    childElementCount = oldKeySequence.length + 1;
  for (let i = 0; i < itemsLength; i++) {
    item = items[i];
    key = keyFn(item);
    component = getComponent(pool, componentDefinition, ctrl, key, item);
    newKeys.push(key);
    if (i > childElementCount) {
      e.appendChild(component.el);
    } else if (key !== oldKeySequence[i]) {
      e.insertBefore(component.el, childNodes[i]);
      pull(oldKeySequence, key, i);
    }
  }
  this._k = newKeys;
  trimChildren(e, childNodes, itemsLength);
};

/**
 * Repeats nested components, yielding from its pool sequentially.
 *
 * @param {componentDefinition} componentDefinition - The class ComponentDefinition to create.
 */
export function SequentialRepeater(componentDefinition) {
  this._v = componentDefinition;
  this._p = []; // pool of component instances
  this._c = 0; // Child element count
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {any} ctrl - The parent item's controller.
 */
SequentialRepeater.prototype.patch = function (e, items, ctrl) {
  const pool = this._p;
  const componentDefinition = this._v;
  const childNodes = e.childNodes;
  const itemsLength = items.length;
  let item,
    component,
    poolCount = pool.length,
    childElementCount = this._c;

  for (let i = 0; i < itemsLength; i++) {
    item = items[i];
    if (i < poolCount) {
      component = pool[i];
      component.render(item, ctrl);
    } else {
      component = createComponent(componentDefinition, item, ctrl);
      pool.push(component);
      poolCount++;
    }
    if (i >= childElementCount) {
      e.appendChild(component.el);
    }
  }
  this._c = itemsLength;
  trimChildren(e, childNodes, itemsLength);
};

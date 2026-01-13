import { trimChildren } from "../utils";

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
  this.def = componentDefinition;
  this.keyFn = keyFn;
  this.keys = []; // keys
  this.pool = {}; // pool of component instances
}
const proto = KeyedRepeater.prototype;

/**
 * Retrieves a single component. Though not used in wallace itself, it may
 * be used elsewhere, such as in the router.
 *
 * @param {Object} item - The item which will be passed as props.
 */
proto.getOne = function (item, ctrl) {
  const key = this.keyFn(item),
    pool = this.pool;
  component = pool[key] || (pool[key] = new this.def());
  component.render(item, ctrl);
  return component;
};

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 */
proto.patch = function (e, items, ctrl) {
  const pool = this.pool,
    componentDefinition = this.def,
    keyFn = this.keyFn,
    childNodes = e.childNodes,
    itemsLength = items.length,
    oldKeySequence = this.keys,
    newKeys = [];
  let item,
    key,
    component,
    childElementCount = oldKeySequence.length + 1;
  for (let i = 0; i < itemsLength; i++) {
    item = items[i];
    key = keyFn(item);
    component = pool[key] || (pool[key] = new componentDefinition());
    component.render(item, ctrl);
    newKeys.push(key);
    if (i > childElementCount) {
      e.appendChild(component.el);
    } else if (key !== oldKeySequence[i]) {
      e.insertBefore(component.el, childNodes[i]);
      pull(oldKeySequence, key, i);
    }
  }
  this.keys = newKeys;
  trimChildren(e, childNodes, itemsLength);
};

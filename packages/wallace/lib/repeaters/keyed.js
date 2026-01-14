/**
 * Repeats nested components, reusing items based on key.
 *
 * @param {function} componentDefinition - The ComponentDefinition to create.
 * @param {function} keyFn - A function which obtains the key.
 */
export function KeyedRepeater(componentDefinition, keyFn) {
  this.def = componentDefinition;
  this.keyFn = keyFn;
  this.keys = []; // array of keys as last set.
  this.pool = {}; // pool of component instances.
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
 * @param {any} ctrl - The parent item's controller.
 */
proto.patch = function (e, items, ctrl) {
  const pool = this.pool,
    componentDefinition = this.def,
    keyFn = this.keyFn,
    childNodes = e.childNodes,
    itemsLength = items.length,
    previousKeys = this.keys,
    offset = previousKeys.length - itemsLength,
    newKeys = [],
    toRemove = new Set(previousKeys);
  let item,
    el,
    key,
    component,
    anchor = null,
    i = itemsLength - 1;
  // Working backwards saves us having to track moves.
  while (i >= 0) {
    item = items[i];
    key = keyFn(item);
    newKeys.push(key);
    toRemove.delete(key);
    component = pool[key] || (pool[key] = new componentDefinition());
    component.render(item, ctrl);
    el = component.el;
    if (key !== previousKeys[i + offset]) {
      e.insertBefore(el, anchor);
    }
    anchor = el;
    i--;
  }
  let toStrip = toRemove.size;
  while (toStrip > 0) {
    e.removeChild(childNodes[0]);
    toStrip--;
  }
  this.keys = newKeys.reverse();
};

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

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} e - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {any} ctrl - The parent item's controller.
 */
KeyedRepeater.prototype.patch = function (e, items, ctrl) {
  const pool = this.pool,
    componentDefinition = this.def,
    keyFn = this.keyFn,
    childNodes = e.childNodes,
    itemsLength = items.length,
    previousKeys = this.keys,
    previousKeysLength = previousKeys.length,
    newKeys = [],
    previousKeysSet = new Set(previousKeys);
  let item,
    el,
    key,
    component,
    anchor = null,
    fragAnchor = null,
    untouched = true,
    append = false,
    offset = previousKeysLength - itemsLength,
    i = itemsLength - 1;

  // Working backwards saves us having to track moves.
  const frag = document.createDocumentFragment();
  while (i >= 0) {
    item = items[i];
    key = keyFn(item);
    component = pool[key] || (pool[key] = new componentDefinition());
    component.render(item, ctrl);
    el = component.el;
    if (untouched && !previousKeysSet.has(key)) {
      frag.insertBefore(el, fragAnchor);
      fragAnchor = el;
      append = true;
      offset++;
    } else {
      if (key !== previousKeys[i + offset]) {
        e.insertBefore(el, anchor);
        untouched = false;
      }
      anchor = el;
    }
    newKeys.push(key);
    previousKeysSet.delete(key);
    i--;
  }

  if (append) {
    e.appendChild(frag);
  }

  let toStrip = previousKeysSet.size;
  while (toStrip > 0) {
    e.removeChild(childNodes[0]);
    toStrip--;
  }

  this.keys = newKeys.reverse();
};

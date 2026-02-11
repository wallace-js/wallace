import { countOffset } from "../offsetter";

/**
 * Repeats nested components, reusing items based on key.
 *
 */
export function KeyedRepeater(componentDefinition, key, adjustmentTracker, initialIndex) {
  this.def = componentDefinition;
  this.at = adjustmentTracker;
  this.ii = initialIndex;
  this.keys = []; // array of keys as last set.
  this.pool = {}; // pool of component instances.
  if (typeof key === "function") {
    this.kf = key;
  } else {
    this.kn = key;
  }
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
    keyName = this.kn,
    keyFn = this.kf,
    childNodes = e.childNodes,
    itemsLength = items.length,
    previousKeys = this.keys,
    previousKeysLength = previousKeys.length,
    newKeys = [],
    previousKeysSet = new Set(previousKeys),
    adjustmentTracker = this.at,
    initialIndex = this.ii,
    frag = document.createDocumentFragment();

  let item,
    el,
    itemKey,
    component,
    endAnchor = null,
    adjustment = 0,
    anchor = null,
    fragAnchor = null,
    untouched = true,
    append = false,
    offset = previousKeysLength - itemsLength,
    i = itemsLength - 1;

  if (adjustmentTracker) {
    adjustment = countOffset(adjustmentTracker, initialIndex);
    endAnchor = childNodes[previousKeysLength + adjustment] || null;
    anchor = endAnchor;
    untouched = false;
  }

  // Working backwards saves us having to track moves.
  while (i >= 0) {
    item = items[i];
    itemKey = keyName ? item[keyName] : keyFn(item);
    component = pool[itemKey] || (pool[itemKey] = new componentDefinition());
    component.render(item, ctrl);
    el = component.el;
    if (untouched && !previousKeysSet.has(itemKey)) {
      frag.insertBefore(el, fragAnchor);
      fragAnchor = el;
      append = true;
      offset++;
    } else {
      if (itemKey !== previousKeys[i + offset]) {
        e.insertBefore(el, anchor);
        untouched = false;
      }
      anchor = el;
    }
    newKeys.push(itemKey);
    previousKeysSet.delete(itemKey);
    i--;
  }

  if (append) {
    e.insertBefore(frag, endAnchor);
  }

  let toStrip = previousKeysSet.size;
  while (toStrip > 0) {
    e.removeChild(childNodes[adjustment]);
    toStrip--;
  }

  this.keys = newKeys.reverse();

  if (adjustmentTracker) {
    adjustmentTracker.set(initialIndex, itemsLength - 1);
  }
};

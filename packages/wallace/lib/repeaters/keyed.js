import { countAdjustments } from "../adjuster";
// WARNING: Code here is near duplicated in keyedFn.

/**
 * Repeats nested components, reusing items based on key.
 *
 * @param {function} componentDefinition - The ComponentDefinition to create.
 * @param {string} keyName - The name of the key property.
 */
export function KeyedRepeater(
  componentDefinition,
  keyName,
  adjustmentTracker,
  initialIndex
) {
  this.def = componentDefinition;
  this.keyName = keyName;
  this.at = adjustmentTracker;
  this.ii = initialIndex;
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
    keyName = this.keyName,
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
    key,
    component,
    endOfRange,
    endAnchor,
    adjustment,
    anchor = null,
    fragAnchor = null,
    untouched = true,
    append = false,
    offset = previousKeysLength - itemsLength,
    i = itemsLength - 1;

  if (adjustmentTracker) {
    // The repeat element has siblings
    adjustment = countAdjustments(adjustmentTracker, initialIndex);
    console.log(adjustment, adjustmentTracker);
    endOfRange = previousKeysLength + adjustment;
    endAnchor = childNodes[endOfRange] || null;
    anchor = endAnchor;
    untouched = false;
  }

  // Working backwards saves us having to track moves.
  while (i >= 0) {
    item = items[i];
    key = item[keyName];
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
    e.insertBefore(frag, endAnchor);
  }

  let toStrip = previousKeysSet.size;
  while (toStrip > 0) {
    e.removeChild(childNodes[adjustment]);
    toStrip--;
  }

  this.keys = newKeys.reverse();
  if (adjustmentTracker) {
    adjustmentTracker[initialIndex] = itemsLength - 1;
  }
};

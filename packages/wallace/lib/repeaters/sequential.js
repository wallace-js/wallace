import { countOffset } from "../offsetter";

/**
 * Repeats nested components, yielding from the pool sequentially.
 *
 * COMPILER_MODS:
 *   if allowRepeaterSiblings is false the last two parameters are removed.
 */
export function SequentialRepeater(
  componentDefinition,
  pool,
  adjustmentTracker,
  initialIndex
) {
  this.d = componentDefinition;
  this.p = pool; // pool of component instances. Must be an Array.
  this.c = 0; // Child count
  if (wallaceConfig.flags.allowRepeaterSiblings) {
    this.a = adjustmentTracker;
    this.i = initialIndex;
  }
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} parent - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {any} ctrl - The parent item's controller.
 */
SequentialRepeater.prototype.patch = function (parent, items, ctrl) {
  const pool = this.p,
    componentDefinition = this.d,
    previousChildCount = this.c,
    itemsLength = items.length,
    childNodes = parent.childNodes;

  let i = 0,
    offset = 0,
    component,
    nextElement,
    initialIndex,
    offsetTracker,
    endOfRange = previousChildCount,
    poolCount = pool.length;

  if (wallaceConfig.flags.allowRepeaterSiblings) {
    initialIndex = this.i;
    offsetTracker = this.a;
    if (offsetTracker) {
      // The repeat element has siblings
      offset = countOffset(offsetTracker, initialIndex);
      endOfRange += offset;
      nextElement = childNodes[endOfRange] || null;
    }
  }
  while (i < itemsLength) {
    if (i < poolCount) {
      component = pool[i];
    } else {
      component = new componentDefinition();
      pool.push(component);
      poolCount++;
    }
    component.render(items[i], ctrl);
    if (i >= previousChildCount) {
      parent.insertBefore(component.el, nextElement);
    }
    i++;
  }
  this.c = itemsLength;

  let removeAtIndex = offset + previousChildCount - 1;
  const stopatIndex = offset + itemsLength - 1;
  for (let i = removeAtIndex; i > stopatIndex; i--) {
    parent.removeChild(childNodes[i]);
  }
  if (wallaceConfig.flags.allowRepeaterSiblings) {
    if (offsetTracker) {
      offsetTracker.set(initialIndex, itemsLength - 1);
    }
  }
};

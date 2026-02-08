import { countAdjustments } from "../adjuster";
/**
 * Repeats nested components, yielding from its pool sequentially.
 */
export function SequentialRepeater(componentDefinition, adjustmentTracker, initialIndex) {
  this.def = componentDefinition;
  this.at = adjustmentTracker;
  this.ii = initialIndex;
  console.log(`ssi`, initialIndex);
  this.pool = []; // pool of component instances
  this.cc = 0; // Child count
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
  const pool = this.pool,
    componentDefinition = this.def,
    childNodes = parent.childNodes,
    itemsLength = items.length,
    previousChildCount = this.cc,
    initialIndex = this.ii,
    adjustmentTracker = this.at;
  let i = 0,
    offset = 0,
    component,
    nextElement,
    endOfRange = previousChildCount,
    poolCount = pool.length;

  if (adjustmentTracker) {
    // The repeat element has siblings
    offset = countAdjustments(adjustmentTracker, initialIndex);
    endOfRange += offset;
    nextElement = childNodes[endOfRange] || null;
    console.log("sequ", initialIndex, endOfRange, endOfRange, nextElement);
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
  this.cc = itemsLength;

  let removeAtIndex = offset + previousChildCount - 1;
  const stopatIndex = offset + itemsLength - 1;
  for (let i = removeAtIndex; i > stopatIndex; i--) {
    parent.removeChild(childNodes[i]);
  }
  if (adjustmentTracker) {
    adjustmentTracker[initialIndex] = { a: itemsLength - 1 };
  }
};

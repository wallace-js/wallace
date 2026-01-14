/**
 * Repeats nested components, yielding from its pool sequentially.
 *
 * @param {componentDefinition} componentDefinition - The ComponentDefinition to create.
 */
export function SequentialRepeater(componentDefinition) {
  this.def = componentDefinition;
  this.pool = []; // pool of component instances
  this.count = 0; // Child element count
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
  const pool = this.pool,
    componentDefinition = this.def,
    childNodes = e.childNodes,
    itemsLength = items.length,
    childElementCount = this.count;
  let i = 0,
    component,
    poolCount = pool.length;

  while (i < itemsLength) {
    if (i < poolCount) {
      component = pool[i];
    } else {
      component = new componentDefinition();
      pool.push(component);
      poolCount++;
    }
    component.render(items[i], ctrl);
    if (i >= childElementCount) {
      e.appendChild(component.el);
    }
    i++;
  }
  this.count = itemsLength;
  let lastIndex = childNodes.length - 1;
  let keepIndex = itemsLength - 1;
  for (let i = lastIndex; i > keepIndex; i--) {
    e.removeChild(childNodes[i]);
  }
};

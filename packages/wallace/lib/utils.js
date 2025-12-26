export function findElement(rootElement, path) {
  return path.reduce((acc, index) => acc.childNodes[index], rootElement);
}

export function replaceNode(nodeToReplace, newNode) {
  nodeToReplace.parentNode.replaceChild(newNode, nodeToReplace);
}

/**
 * Trims the unwanted child elements from the end.
 *
 * @param {Node} e
 * @param {Array} childNodes
 * @param {Int} itemsLength
 */
export function trimChildren(e, childNodes, itemsLength) {
  let lastIndex = childNodes.length - 1;
  let keepIndex = itemsLength - 1;
  for (let i = lastIndex; i > keepIndex; i--) {
    e.removeChild(childNodes[i]);
  }
}

/**
 * Stash something on the component. Returns the element.
 * The generated code is expected to keep track of the position.
 */
export function stashMisc(element, stash, object) {
  stash.push(object);
  return element;
}

export function onEvent(element, eventName, callback) {
  element.addEventListener(eventName, callback);
  return element;
}

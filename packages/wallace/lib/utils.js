export function findElement(rootElement, path) {
  let node = rootElement;
  for (let i = 0; i < path.length; i++) {
    node = node.childNodes[path[i]];
  }
  return node;
}

export function replaceNode(nodeToReplace, newNode) {
  nodeToReplace.parentNode.replaceChild(newNode, nodeToReplace);
}

export function onEvent(element, eventName, callback) {
  element.addEventListener(eventName, callback);
  return element;
}

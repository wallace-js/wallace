export const findElement = (rootElement, path) => {
  let node = rootElement;
  for (let i = 0; i < path.length; i++) {
    node = node.childNodes[path[i]];
  }
  return node;
};

export const onEvent = (element, eventName, callback) => {
  element.addEventListener(eventName, callback);
  return element;
};

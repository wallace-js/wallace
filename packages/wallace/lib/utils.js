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

/**
 * Sets a dynamic attribute. If `prop` is given, sets that DOM property, otherwise sets
 * the attribute. A value of null or undefined removes the attribute instead. The property
 * is set to "" first, as removing the attribute doesn't reset a property such as `value`
 * once it has changed.
 */
export const setAttr = (element, attr, value, prop) => {
  if (value == null) {
    if (prop) element[prop] = "";
    element.removeAttribute(attr);
  } else if (prop) {
    element[prop] = value;
  } else {
    element.setAttribute(attr, value);
  }
};

/**
 * Gets a component's name for development messages. The plugin only provides names in
 * development builds.
 */
export const componentName = component =>
  component.constructor.name || "Anonymous component";

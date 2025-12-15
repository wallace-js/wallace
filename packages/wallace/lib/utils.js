/**
 * Creates and mounts a component onto an element.
 *
 * @param {any} elementOrId Either a string representing an id, or an element.
 * @param {callable} componentDefinition The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 */
export function mount(elementOrId, componentDefinition, props, ctrl) {
  const component = new componentDefinition();
  component.render(props, ctrl);
  replaceNode(getElement(elementOrId), component.el);
  return component;
}

export function replaceNode(nodeToReplace, newNode) {
  nodeToReplace.parentNode.replaceChild(newNode, nodeToReplace);
}

export function getElement(elementOrId) {
  return typeof elementOrId === "string"
    ? document.getElementById(elementOrId)
    : elementOrId;
}

/**
 * Returns a proxy which calls a callback when the object or its nested objects are
 * modified.
 *
 * Note that proxies have property `isProxy` set to true.
 */
export function watch(target, callback) {
  const handler = {
    get(target, key) {
      if (key == "isProxy") return true;
      const prop = target[key];
      if (typeof prop == "undefined") return;
      if (typeof prop === "object") return new Proxy(prop, handler);
      if (Array.isArray(target) && typeof target[key] === "function") {
        return (...args) => {
          const result = target[key](...args);
          callback(target, key, args);
          return result;
        };
      }
      return prop;
    },
    set(target, key, value) {
      target[key] = value;
      callback(target, key, value);
      return true;
    }
  };
  return new Proxy(target, handler);
}

export function protect(obj) {
  return watch(obj, (target, key, value) => {
    console.log("target", target, "key", key, "value", value);
    throw new Error("Attempted to modify protected object");
  });
}

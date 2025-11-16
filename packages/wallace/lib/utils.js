/**
 * Creates and mounts a component onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 * @param {class} cls The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 */
export function mount(elementOrId, cls, props, ctrl) {
  const component = createComponent(cls, props, ctrl);
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
 * Creates a component and initialises it.
 *
 * @param {class} cls The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 */
export function createComponent(cls, props, ctrl) {
  const component = buildComponent(cls);
  component.render(props, ctrl);
  return component;
}

/**
 * Builds a component's initial DOM.
 */
export function buildComponent(cls) {
  const component = new cls();
  const proto = cls.prototype;
  const dom = proto._n.cloneNode(true);
  component.el = dom;
  proto._b(component, dom);
  return component;
}

/**
 * Wraps target in a Proxy which calls a function whenever it is modified.
 *
 * @param {*} target - Any object, including arrays.
 * @param {*} callback - A callback function.
 * @returns a Proxy of the object.
 */
export function watch(target, callback) {
  const handler = {
    get(target, key) {
      if (key == "isProxy") return true;
      const prop = target[key];
      if (typeof prop == "undefined") return;
      // set value as proxy if object
      if (!prop.isProxy && typeof prop === "object")
        target[key] = new Proxy(prop, handler);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      callback();
      return true;
    },
  };
  return new Proxy(target, handler);
}

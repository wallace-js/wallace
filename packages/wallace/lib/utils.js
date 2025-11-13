/**
 * Creates and mounts a component onto an element.
 *
 * @param {unsure} elementOrId Either a string representing an id, or an element.
 * @param {class} cls The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 * @param {object} parent The parent component (optional)
 */
export function mount(elementOrId, cls, props, parent) {
  const component = createComponent(cls, parent, props);
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
 * @param {object} parent The parent component (optional)
 * @param {object} props The props to pass to the component (optional)
 */
export function createComponent(cls, parent, props) {
  const component = buildComponent(cls, parent);
  component.render(props);
  return component;
}

/**
 * Builds a component.
 */
export function buildComponent(cls, parent) {
  const component = new cls(parent);
  const prototype = cls.prototype;
  const dom = prototype._n.cloneNode(true);
  component.el = dom;
  component._b(component, dom);
  return component;
}

/**
 * Wraps target in a Proxy which calls component.update() whenever it is modified.
 *
 * @param {*} target - Any object, including arrays.
 * @param {*} component - A component.
 * @returns a Proxy object.
 */
export const watch = (target, component) => {
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
      component.update();
      return true;
    },
  };
  return new Proxy(target, handler);
};

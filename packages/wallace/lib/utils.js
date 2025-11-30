/**
 * Creates and mounts a component onto an element.
 *
 * @param {any} elementOrId Either a string representing an id, or an element.
 * @param {callable} componentDefinition The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 */
export function mount(elementOrId, componentDefinition, props, ctrl) {
  const component = buildComponent(componentDefinition);
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
 * Builds a component's initial DOM.
 */
export function buildComponent(componentDefinition) {
  // TODO: add a dev warning here:
  // if "componentDefinition is not a constructor" then we're probably missing a stub.
  const component = new componentDefinition();
  const proto = componentDefinition.prototype;
  const dom = proto._n.cloneNode(true);
  component.el = dom;
  proto._b(component, dom);
  return component;
}

/**
 * See types for docs. Set grace to 0 for testing.
 */
export function watch(target, callback, grace) {
  let active = false;
  if (grace === undefined) grace = 100;
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
      if (grace) {
        if (!active) {
          setTimeout(() => {
            active = false;
          }, grace);
          active = true;
          callback();
        }
      } else {
        callback();
      }
      return true;
    },
  };
  return new Proxy(target, handler);
}

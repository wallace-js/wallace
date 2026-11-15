/**
 * Creates and mounts a component onto an element.
 *
 * @param {any} elementOrId Either a string representing an id, or an element.
 * @param {callable} componentDefinition The class of Component to create
 * @param {object} model The model to pass to the component (optional)
 * @param {object} hub The hub to pass to the component (optional, defaults to model)
 */
export const mount = (
  elementOrId,
  componentDefinition,
  model,
  /* #INCLUDE-IF: allowHub */ hub = model
) => {
  const element =
    typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
  if (process.env.NODE_ENV !== "production") {
    const name = componentDefinition.name || "component";
    if (!element) {
      throw new Error(
        typeof elementOrId === "string"
          ? `mount: no element with id "${elementOrId}" to mount ${name} on.`
          : `mount: expected an element or id to mount ${name} on, got ${elementOrId}.`
      );
    }
    if (!element.parentNode) {
      throw new Error(
        `mount: the element to mount ${name} on has no parent, so it can't be replaced.`
      );
    }
  }
  const component = new componentDefinition();
  component.render(model, /* #INCLUDE-IF: allowHub */ hub);
  element.parentNode.replaceChild(component.el, element);
  return component;
};

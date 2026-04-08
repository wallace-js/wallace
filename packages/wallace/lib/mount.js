/**
 * Creates and mounts a component onto an element.
 *
 * @param {any} elementOrId Either a string representing an id, or an element.
 * @param {callable} componentDefinition The class of Component to create
 * @param {object} model The model to pass to the component (optional)
 * @param {hub} model The hub to pass to the component (optional)
 */
export const mount = (
  elementOrId,
  componentDefinition,
  model,
  /* #INCLUDE-IF: allowHub */ hub
) => {
  const component = new componentDefinition();
  component.render(model, /* #INCLUDE-IF: allowHub */ hub);
  const element =
    typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
  element.parentNode.replaceChild(component.el, element);
  return component;
};

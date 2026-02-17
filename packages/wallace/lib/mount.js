import { replaceNode } from "./utils";

/**
 * Creates and mounts a component onto an element.
 *
 * @param {any} elementOrId Either a string representing an id, or an element.
 * @param {callable} componentDefinition The class of Component to create
 * @param {object} props The props to pass to the component (optional)
 * @param {ctrl} props The ctrl to pass to the component (optional)
 */
export const mount = (
  elementOrId,
  componentDefinition,
  props,
  /* #INCLUDE-IF: allowCtrl */ ctrl
) => {
  const component = new componentDefinition();
  component.render(props, /* #INCLUDE-IF: allowCtrl */ ctrl);
  const element =
    typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
  replaceNode(element, component.el);
  return component;
};

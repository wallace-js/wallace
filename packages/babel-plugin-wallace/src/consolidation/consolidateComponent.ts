import { Component, DynamicTextNode } from "../models";
import { processeVisibilityToggles } from "./visibility";
import { ComponentDefinitionData } from "./ComponentDefinitionData";
import { processNodes } from "./processNodes";
import { getSiblings } from "./utils";

/**
 * If a node contains only a JSXExpression, then rather than make a span, we set
 * textContent on that node.
 */
function hoistTextNodes(component: Component) {
  const nodesToDelete = [];
  component.extractedNodes.forEach((node) => {
    if (node instanceof DynamicTextNode) {
      if (getSiblings(node, component.extractedNodes).length === 0) {
        const parent = node.parent;
        parent.watches.push(...node.watches);
        nodesToDelete.push(node);
        node.element.remove();
      }
    }
  });
  nodesToDelete.forEach((node) => {
    component.extractedNodes.splice(component.extractedNodes.indexOf(node), 1);
  });
}

/**
 * Deals with visibility toggles, setting ref keys and such.
 */
export function consolidateComponent(
  component: Component
): ComponentDefinitionData {
  const componentDefinition = new ComponentDefinitionData(component);
  hoistTextNodes(component);
  processNodes(component, componentDefinition);
  processeVisibilityToggles(componentDefinition.watches);
  // This must be done after all the processing, as DOM may have changed.
  componentDefinition.html = component.rootElement.outerHTML;
  return componentDefinition;
}

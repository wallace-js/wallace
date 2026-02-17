import { findElement, replaceNode } from "./utils";

export const nestComponent = (rootElement, path, componentDefinition) => {
  const child = new componentDefinition();
  replaceNode(findElement(rootElement, path), child.el);
  return child;
};

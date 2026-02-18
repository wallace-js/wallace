import { findElement, replaceNode } from "./utils";

export const nestComponent = (rootElement, path, componentDefinition) => {
  if (wallaceConfig.flags.allowDismount) {
    var child = componentDefinition.pool.pop() || new componentDefinition();
  } else {
    var child = new componentDefinition();
  }
  replaceNode(findElement(rootElement, path), child.el);
  return child;
};

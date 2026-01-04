import { findElement, replaceNode } from "./utils";

export function nestComponent(rootElement, path, componentDefinition) {
  const el = findElement(rootElement, path),
    child = new componentDefinition();
  replaceNode(el, child.el);
  return child;
}

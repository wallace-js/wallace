/**
 * Saves a reference to a node (element or nested component)
 * Returns the node.
 */
export function saveRef(node, refs, name) {
  return (refs[name] = node);
}

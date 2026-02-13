/**
 * Saves a reference to a node (element or nested component)
 * Returns the node.
 */
export const saveRef = (node, refs, name) => (refs[name] = node);

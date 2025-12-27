function Ref(component, node, start, end) {
  this.node = node;
  this._c = component;
  this._s = start;
  this._e = end;
}

Ref.prototype.update = function () {
  this._c._u(this._s, this._e);
};

/**
 * Saves a reference to a node (element or nested component)
 * Returns the node.
 */
export function saveRef(node, component, refs, name, start, end) {
  refs[name] = new Ref(component, node, start, end);
  return node;
}

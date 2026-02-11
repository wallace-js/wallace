function Part(component, start, end) {
  this._c = component;
  this._s = start;
  this._e = end;
}

Part.prototype.update = function () {
  this._c._u(this._s, this._e);
};

/**
 * Saves a reference to a part of a component so it can be updated independently.
 */
export const savePart = (node, component, parts, name, start, end) => {
  parts[name] = new Part(component, start, end);
  return node;
};

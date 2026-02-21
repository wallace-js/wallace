function Part(component, start, end) {
  this.c = component;
  this.s = start;
  this.e = end;
}

Part.prototype.update = function () {
  this.c._u(this.s, this.e);
};

/**
 * Saves a reference to a part of a component so it can be updated independently.
 */
export const savePart = (node, component, parts, name, start, end) => {
  parts[name] = new Part(component, start, end);
  return node;
};

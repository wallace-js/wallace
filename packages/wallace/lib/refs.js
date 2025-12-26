function Ref(component, element, start, end) {
  this.element = element;
  this._c = component;
  this._s = start;
  this._e = end;
}

Ref.prototype.update = function () {
  this._c._u(this._s, this._e);
};

/**
 * Saves a reference to element or nested component. Returns the element.
 */
export function saveRef(element, component, refs, name, start, end) {
  refs[name] = new Ref(component, element, start, end);
  return element;
}

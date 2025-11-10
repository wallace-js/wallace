/**
 * The base component.
 */
export function Component(parent) {
  this.parent = parent; // The parent component. TODO: is this needed?
  this.props = undefined; // The props passed to the component. May be changed.
  this.el = null; // the element - will be set during build.
  this.ref = {}; // user set references to elements or components.
  // Internal state objects
  this._e = {}; // The dynamic elements in the DOM.
  this._p = {}; // The previous values for watches to compare against.
  this._s = []; // A stash for misc objects.
}

var proto = Component.prototype;

Object.defineProperty(proto, "hidden", {
  set: function (value) {
    this.el.hidden = value;
  },
});

/**
 * Sets the props and updates the component.
 */
proto.render = function (props) {
  this.props = props;
  this.update();
};

/**
 * Updates the DOM.
 * Loops over watches, skipping n watches if elements are hidden.
 */
proto.update = function () {
  let i = 0,
    watch,
    element,
    displayToggle,
    shieldQueryResult,
    shouldBeVisible;

  const watches = this._w;
  const lookup = this._l;
  const props = this.props;
  lookup.reset();
  const il = watches.length;
  /* 
  Watches is an array of objects with keys:
    e: the element reference (string)
    c: the callbacks (object)
    d: [optional] display toggle (object)

  The display toggle has keys:
    q: the query key in lookup
    s: the number of watches to skip as their node is underneath
    r: reversed
    m: mode (1: hide, 2: hide-reversed, 3: dettach-normal, 4: dettach-reversed)
  */
  while (i < il) {
    watch = watches[i];
    element = this._e[watch.e];
    displayToggle = watch.d;
    i++;
    shouldBeVisible = true;
    if (displayToggle) {
      shieldQueryResult = !!lookup.get(this, props, displayToggle.q).n;
      shouldBeVisible = displayToggle.r
        ? shieldQueryResult
        : !shieldQueryResult;
      element.hidden = !shouldBeVisible;
      i += shouldBeVisible ? 0 : displayToggle.s;
    }
    if (shouldBeVisible) {
      lookup.applyCallbacks(this, props, element, watch.c);
    }
  }
};

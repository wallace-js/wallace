/**
 * The base component.
 */
export function Component(parent) {
  this.parent = parent; // The parent component
  this.props = undefined; // The props passed to the component. May be changed.
  this.el = null; // the element - will be set during build
  this.ref = {}; // user set references to elements or components
  // Internal state objects
  this._o = []; // stashed objects like pools.
  this._e = {}; // stashed elements.
  this._p = {}; // The previous values for watches to compare against
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
    shieldQuery,
    shieldQueryResult,
    shouldBeVisible;

  const watches = this._w;
  const lookup = this._l;
  const props = this.props;
  lookup.reset();
  const il = watches.length;
  while (i < il) {
    watch = watches[i];
    element = this._e[watch.wk];
    shieldQuery = watch.sq;
    i++;
    shouldBeVisible = true;
    if (shieldQuery) {
      shieldQueryResult = !!lookup.get(this, props, shieldQuery).n;
      shouldBeVisible = watch.rv ? shieldQueryResult : !shieldQueryResult;
      element.hidden = !shouldBeVisible;
      i += shouldBeVisible ? 0 : watch.sc;
    }
    if (shouldBeVisible) {
      lookup.applyCallbacks(this, props, element, watch.cb);
    }
  }
};

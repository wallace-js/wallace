/**
 * The base component.
 */
export function Component() {
  this.ctrl = undefined; // The controller.
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
 * The render function that gets called by parent components.
 */
proto.render = function (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
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
    parent,
    displayToggle,
    detacher,
    lookupReturn,
    lookupTrue,
    shouldBeVisible,
    visibilityChanged,
    detachedElements,
    detachedElement,
    index,
    adjustedIndex,
    thisElement;

  const watches = this._w;
  const lookup = this._l;
  const props = this.props;
  lookup.reset();
  const il = watches.length;
  /* 
  Watches is an array of objects with keys:
    e: the element reference (string)
    c: the callbacks (object)
    ?v: visibility toggle (object)

  The display toggle has keys:
    q: the query key in lookup
    s: the number of watches to skip as their node is underneath
    r: reversed
    ?d: detacher 

  The detacher has keys:
    i: the initial element index
    s: the stash key of the detacher (plain object)
    e: the parent element key
  */
  while (i < il) {
    watch = watches[i];
    element = this._e[watch.e];
    displayToggle = watch.v;
    i++;
    shouldBeVisible = true;
    if (displayToggle) {
      lookupReturn = lookup.get(this, props, displayToggle.q);
      lookupTrue = !!lookupReturn.n;
      shouldBeVisible = displayToggle.r ? lookupTrue : !lookupTrue;
      visibilityChanged = lookupTrue != !!lookupReturn.o;
      detacher = displayToggle.d;
      if (detacher) {
        index = detacher.i;
        parent = this._e[detacher.e];
        detachedElements = this._s[detacher.s];
        detachedElement = detachedElements[index];
        if (shouldBeVisible && detachedElement) {
          adjustedIndex =
            index -
            Object.keys(detachedElements).filter(function (k) {
              return k < index && detachedElements[k];
            }).length;
          parent.insertBefore(
            detachedElement,
            parent.childNodes[adjustedIndex],
          );
          detachedElements[index] = null;
        } else if (!shouldBeVisible && !detachedElement) {
          thisElement = this._e[watch.e];
          parent.removeChild(thisElement);
          detachedElements[index] = thisElement;
        }
      } else {
        element.hidden = !shouldBeVisible;
      }
      if (!shouldBeVisible) {
        i += displayToggle.s;
      }
    }
    if (shouldBeVisible) {
      lookup.applyCallbacks(this, props, element, watch.c);
    }
  }
};

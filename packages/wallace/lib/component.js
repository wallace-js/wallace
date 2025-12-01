const ALWAYS_UPDATE = "__";

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
  this._s = []; // A stash for misc objects.
  this._p = {}; // The previous values for watches to compare against.
  this._r = {}; // The current values read during an update.
}

Component.stubs = {};

var proto = Component.prototype;

Object.defineProperty(proto, "hidden", {
  set: function (value) {
    this.el.hidden = value;
  }
});

proto._gs = function (name) {
  return this.constructor.stubs[name];
};

/**
 * Reads a query during update, returns an array with (oldValue, newValue, changed)
 * and saves the old value. Must reset this._r before each run.
 */
proto._rq = function (props, key) {
  const run = this._r;
  if (run[key] === undefined) {
    let oldValue = this._p[key];
    const newValue = this._q[key](props, this);
    this._p[key] = newValue;
    const rtn = [newValue, oldValue, newValue !== oldValue];
    run[key] = rtn;
    return rtn;
  }
  return run[key];
};

/**
 * Applies the callbacks.
 */
proto._ac = function (props, element, callbacks) {
  for (let key in callbacks) {
    let callback = callbacks[key];
    if (key === ALWAYS_UPDATE) {
      callback(element, props, this);
    } else {
      const result = this._rq(props, key);
      if (result[2]) {
        callback(result[0], result[1], element, props, this);
      }
    }
  }
};

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
    lookupTrue,
    shouldBeVisible,
    detachedElements,
    detachedElement,
    index,
    adjustedIndex,
    thisElement;

  const watches = this._w;
  const props = this.props;
  const il = watches.length;
  this._r = {};
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
      lookupTrue = !!this._rq(props, displayToggle.q)[0];
      shouldBeVisible = displayToggle.r ? lookupTrue : !lookupTrue;
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
            parent.childNodes[adjustedIndex]
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
      this._ac(props, element, watch.c);
    }
  }
};

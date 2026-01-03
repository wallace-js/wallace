const throwAway = document.createElement("template");
const NO_LOOKUP = "__";

const ComponentPrototype = {
  /**
   * The render function that gets called by parent components.
   */
  render: function (props, ctrl) {
    this.props = props;
    this.ctrl = ctrl;
    this.update();
  },

  /**
   * Updates the DOM and renders nested components.
   */
  update: function () {
    this._u(0, this._l);
  },

  _u: function (i, il) {
    let watch,
      element,
      parent,
      displayToggle,
      detacher,
      lookupTrue,
      shouldBeVisible,
      detachedElements,
      detachedElement,
      index,
      adjustedIndex;

    const watches = this._w,
      props = this.props,
      previous = this._p;
    /*
      Watches is an array of objects with keys:
        e: the element index (number)
        c: the callbacks (object)
        ?v: visibility toggle (object)

      The callback is an object whose key is the lookup and value is a function which
      applies the effect.

      The visibility toggle has keys:
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
      shouldBeVisible = true;
      if (displayToggle) {
        lookupTrue = !!this._q[displayToggle.q](props, this);
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
            parent.insertBefore(detachedElement, parent.childNodes[adjustedIndex]);
            detachedElements[index] = null;
          } else if (!shouldBeVisible && !detachedElement) {
            parent.removeChild(element);
            detachedElements[index] = element;
          }
        } else {
          element.hidden = !shouldBeVisible;
        }
        if (!shouldBeVisible) {
          i += displayToggle.s;
        }
      }
      if (shouldBeVisible) {
        const prev = previous[i],
          callbacks = watch.c;
        for (let key in callbacks) {
          if (key === NO_LOOKUP) {
            callbacks[key](element, props, this);
          } else {
            const oldValue = prev[key],
              newValue = this._q[key](props, this);
            if (oldValue !== newValue) {
              callbacks[key](element, props, this, newValue);
              prev[key] = newValue;
            }
          }
        }
      }
      i++;
    }
  }
};

Object.defineProperty(ComponentPrototype, "hidden", {
  set: function (value) {
    this.el.hidden = value;
  }
});

const ComponentBase = {
  stubs: {},
  prototype: ComponentPrototype
};

/**
 *
 * @param {function} ComponentFunction - The Component definition function to add bits to.
 * @param {function} BaseComponentFunction - A Component definition function to inherit bits from.
 * @returns the ComponentFunction with bits added.
 */
export function initConstructor(ComponentFunction, BaseComponentFunction) {
  const proto = (ComponentFunction.prototype = Object.create(
    BaseComponentFunction.prototype,
    {
      constructor: {
        value: ComponentFunction
      }
    }
  ));
  Object.defineProperty(ComponentFunction, "methods", {
    set: function (value) {
      Object.assign(proto, value);
    },
    get: function () {
      return proto;
    }
  });
  ComponentFunction.create = function (props, ctrl) {
    const component = new ComponentFunction();
    component.render(props, ctrl);
    return component;
  };
  ComponentFunction.stubs = Object.assign({}, BaseComponentFunction.stubs);
  return ComponentFunction;
}

export function defineComponent(html, watches, queries, contructor, inheritFrom) {
  const ComponentDefinition = initConstructor(contructor, inheritFrom || ComponentBase);
  const proto = ComponentDefinition.prototype;
  throwAway.innerHTML = html;
  proto._w = watches;
  proto._q = queries;
  proto._t = throwAway.content.firstChild;
  proto.base = ComponentPrototype;
  return ComponentDefinition;
}

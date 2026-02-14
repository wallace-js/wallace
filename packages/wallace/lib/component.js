const throwAway = document.createElement("template");
const NO_LOOKUP = "__";

const ComponentPrototype = {
  /*
  COMPILER_MODS:
    if useController is false:
     - param `ctrl` is removed.
     - `this.ctrl = ctrl` is removed.
  */
  render: function (props, ctrl) {
    this.props = props;
    this.ctrl = ctrl;
    this.update();
  },

  /*
  COMPILER_MODS:
    if useFlags is false this is deleted, so `_u` can be renamed to `update`.
  */
  update: function () {
    this._u(0, this._l);
  },

  /*
  COMPILER_MODS:
  if useFlags is false:
    - gets renamed to `update`
    - parameters are removed
    - add `i = 0, il = this._l` to variable declarator.
  */
  _u: function (i, il) {
    let watch, element, displayToggle, detacher, lookupTrue, shouldBeVisible;

    const watches = this._w,
      props = this.props,
      previous = this._p,
      elements = this._e,
      stash = this._s;
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
      */
    while (i < il) {
      watch = watches[i];
      element = elements[watch.e];
      displayToggle = watch.v;
      shouldBeVisible = true;
      if (displayToggle) {
        lookupTrue = !!this._q[displayToggle.q](props, this);
        shouldBeVisible = displayToggle.r ? lookupTrue : !lookupTrue;
        detacher = displayToggle.d;
        if (detacher) {
          detacher.apply(element, shouldBeVisible, elements, stash);
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
            callbacks[key](element, props, this, stash);
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
  prototype: ComponentPrototype
};

if (wallaceConfig.flags.allowStubs) {
  ComponentBase.stubs = {};
}

/**
 *
 * @param {function} ComponentFunction - The Component definition function to add bits to.
 * @param {function} BaseComponentFunction - A Component definition function to inherit bits from.
 * @returns the ComponentFunction with bits added.
 */
export const initConstructor = (ComponentFunction, BaseComponentFunction) => {
  const proto = (ComponentFunction.prototype = Object.create(
    BaseComponentFunction.prototype,
    {
      constructor: {
        value: ComponentFunction
      }
    }
  ));

  if (wallaceConfig.flags.allowMethods) {
    Object.defineProperty(ComponentFunction, "methods", {
      set: value => Object.assign(proto, value),
      get: () => proto
    });
  } else {
    if (process.env.NODE_ENV !== "production") {
      Object.defineProperty(ComponentFunction, "name", {
        set: function (value) {
          throw new Error(
            'Flag "allowMethods" must be set to true in the config for this feature.'
          );
        },
        get: function () {
          throw new Error(
            'Flag "allowMethods" must be set to true in the config for this feature.'
          );
        }
      });
    }
  }

  if (wallaceConfig.flags.allowStubs) {
    ComponentFunction.stubs = Object.assign({}, BaseComponentFunction.stubs);
  }

  return ComponentFunction;
};

export const defineComponent = (html, watches, queries, contructor, inheritFrom) => {
  const ComponentDefinition = initConstructor(contructor, inheritFrom || ComponentBase);
  const proto = ComponentDefinition.prototype;
  throwAway.innerHTML = html;
  proto._w = watches;
  proto._q = queries;
  proto._t = throwAway.content.firstChild;
  if (wallaceConfig.flags.allowBase) {
    proto.base = ComponentPrototype;
  } else {
    if (process.env.NODE_ENV !== "production") {
      Object.defineProperty(proto, "base", {
        set: function (value) {
          throw new Error(
            'Flag "allowBase" must be set to true in the config for this feature.'
          );
        },
        get: function () {
          throw new Error(
            'Flag "allowBase" must be set to true in the config for this feature.'
          );
        }
      });
    }
  }

  return ComponentDefinition;
};

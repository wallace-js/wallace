/**
 * Everything in here is used by or modified by the Babel plugin.
 */
import { replaceNode } from "./utils";

const throwAway = document.createElement("template");
const NO_LOOKUP = "__";

const ComponentBase = {
  stubs: {},
  prototype: {
    /**
     * Gets a stub by name.
     */
    _gs: function (name) {
      return this.constructor.stubs[name];
    },
    /**
     * Reads a query during update, returns an array with (oldValue, newValue, changed)
     * and saves the old value. Must reset this._r before each run.
     */
    _rq: function (props, key) {
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
    },

    /**
     * Applies the callbacks.
     */
    _ac: function (props, element, callbacks) {
      for (let key in callbacks) {
        let callback = callbacks[key];
        if (key === NO_LOOKUP) {
          callback(element, props, this);
        } else {
          const result = this._rq(props, key);
          if (result[2]) {
            callback(element, props, this, result[0]);
          }
        }
      }
    },

    /**
     * The render function that gets called by parent components.
     */
    render: function (props, ctrl) {
      this.props = props;
      this.ctrl = ctrl;
      this.update();
    },

    /**
     * Updates the DOM.
     * Loops over watches, skipping n watches if elements are hidden.
     */
    update: function () {
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
              parent.insertBefore(detachedElement, parent.childNodes[adjustedIndex]);
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
    }
  }
};

Object.defineProperty(ComponentBase.prototype, "hidden", {
  set: function (value) {
    this.el.hidden = value;
  }
});

/**
 * A utility function that has to be in here because it needs _createConstructor and
 * we'd otherwise get cirular inmports.
 *
 * Calls to this function which provide the 2nd argument:
 *
 *   const Foo = extendComponent(Bar, () => <div></div>))
 *
 * Are modified by the Babel plugin to become this:
 *
 *   const Foo = defineComponent(,,,,Bar);
 *
 * So it should never be called with 2nd arg in real life.
 */
export function extendComponent(base, componentDef) {
  // This function call will have been replaced if 2nd arg is a valid component func.
  // and therefor we would not receive it.
  if (componentDef)
    throw new Error("2nd arg to extendComponent must be a JSX arrow function");
  return _createConstructor(base);
}

export function findElement(rootElement, path) {
  return path.reduce((acc, index) => acc.childNodes[index], rootElement);
}

export function nestComponent(rootElement, path, componentDefinition) {
  const el = findElement(rootElement, path),
    child = new componentDefinition();
  replaceNode(el, child.el);
  return child;
}

/**
 * Saves a reference to element or nested component. Returns the element.
 */
export function saveRef(element, component, name) {
  component.refs[name] = element;
  return element;
}

/**
 * Stash something on the component. Returns the element.
 * The generated code is expected to keep track of the position.
 */
export function stashMisc(element, component, object) {
  component._s.push(object);
  return element;
}

export function onEvent(element, eventName, callback) {
  element.addEventListener(eventName, callback);
  return element;
}

export function defineComponent(html, watches, queries, buildFunction, inheritFrom) {
  const ComponentDefinition = _createConstructor(inheritFrom || ComponentBase);
  const prototype = ComponentDefinition.prototype;
  throwAway.innerHTML = html;
  //Ensure these do not clash with fields on the component itself.
  prototype._w = watches;
  prototype._q = queries;
  prototype._b = buildFunction;
  prototype._n = throwAway.content.firstChild;
  return ComponentDefinition;
}

/**
 * Creates a new component definition.
 *
 * @param {*} base - a component definition to inherit from.
 * @returns the newly created component definition function.
 */
function _createConstructor(base) {
  const Component = function () {
    // We initialise these for optimisation reasons.
    this.ctrl = {};
    this.props = {};
    this.ref = {};
    // Internal state objects (_e is created during build)
    this._s = []; // A stash for misc objects like repeaters.
    this._p = {}; // The previous values for watches to compare against.
    this._r = {}; // The current values read during an update.
    const root = this._n.cloneNode(true);
    this.el = root;
    this._b(this, root);
  };

  const proto = Object.create(base.prototype, {
    constructor: {
      value: Component,
      writable: true,
      configurable: true
    }
  });

  Component.prototype = proto;

  // This lets us assign to prototype without replacing it.
  Object.defineProperty(Component, "methods", {
    set: function (value) {
      Object.assign(proto, value);
    },
    get: function () {
      return proto;
    }
  });

  // Set up stubs
  Component.stubs = {} && base.stubs;

  // Helper to access base prototype.
  proto.base = ComponentBase.prototype;
  return Component;
}

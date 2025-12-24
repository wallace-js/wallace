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

      const watches = this._w,
        props = this.props,
        il = watches.length,
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
          this._ac(previous[i], props, element, watch.c);
        }
        i++;
      }
    },

    /**
     * Applies callbacks, and save values as previous.
     *
     */
    _ac: function (previous, props, element, callbacks) {
      for (let key in callbacks) {
        if (key === NO_LOOKUP) {
          callbacks[key](element, props, this);
        } else {
          const oldValue = previous[key],
            newValue = this._q[key](props, this);
          if (oldValue !== newValue) {
            callbacks[key](element, props, this, newValue);
            previous[key] = newValue;
          }
        }
      }
    },

    /**
     * Gets a stub by name.
     */
    _gs: function (name) {
      return this.constructor.stubs[name];
    }
  }
};

Object.defineProperty(ComponentBase.prototype, "hidden", {
  set: function (value) {
    this.el.hidden = value;
  }
});

/**
 * Creates the constructor function for a component definition.
 *
 * @param {*} baseComponent - a component definition to inherit from.
 * @returns the newly created component definition function.
 */
function _createConstructor(baseComponent) {
  const Component = function () {
    const root = (this.el = this._n.cloneNode(true)),
      dynamicElements = (this._e = []),
      stash = (this._s = []),
      previous = (this._p = []),
      refs = (this.refs = {});
    this.ctrl = {};
    this.props = {};
    this._b(this, root, dynamicElements, stash, previous, refs);
  };

  const proto = (Component.prototype = Object.create(baseComponent.prototype, {
    constructor: {
      value: Component
    }
  }));

  // This lets us assign to prototype without replacing it.
  Object.defineProperty(Component, "methods", {
    set: function (value) {
      Object.assign(proto, value);
    },
    get: function () {
      return proto;
    }
  });

  Component.stubs = {} && baseComponent.stubs;
  return Component;
}

export function defineComponent(html, watches, queries, buildFunction, inheritFrom) {
  const ComponentDefinition = _createConstructor(inheritFrom || ComponentBase);
  const proto = ComponentDefinition.prototype;
  throwAway.innerHTML = html;
  //Ensure these do not clash with fields on the component itself.
  proto._w = watches;
  proto._q = queries;
  proto._b = buildFunction;
  proto._n = throwAway.content.firstChild;
  proto.base = ComponentBase.prototype;
  return ComponentDefinition;
}

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
  // and therefore we would not receive it.
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
export function saveRef(element, refs, name) {
  return (refs[name] = element);
}

/**
 * Stash something on the component. Returns the element.
 * The generated code is expected to keep track of the position.
 */
export function stashMisc(element, stash, object) {
  stash.push(object);
  return element;
}

export function onEvent(element, eventName, callback) {
  element.addEventListener(eventName, callback);
  return element;
}

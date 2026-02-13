const MUTATING_METHODS = ["push", "pop", "shift", "unshift", "splice", "reverse", "sort"];
/**
 * Returns a proxy which calls a callback when the object or its nested objects are
 * modified.
 *
 * Note that proxies have property `isProxy` set to true.
 */
export function watch(target, callback) {
  const handler = {
    get(target, key) {
      if (key == "isProxy") return true;
      const prop = target[key],
        propType = typeof prop;
      if (propType == "undefined") return;
      if (propType === "object") return new Proxy(prop, handler);
      if (
        typeof target[key] === "function" &&
        Array.isArray(target) &&
        MUTATING_METHODS.includes(key)
      ) {
        return (...args) => {
          const result = target[key](...args);
          callback(target, key, args);
          return result;
        };
      }
      if (target instanceof Date && propType === "function") {
        return prop.bind(target);
      }
      return prop;
    },
    set(target, key, value) {
      target[key] = value;
      callback(target, key, value);
      return true;
    }
  };
  return new Proxy(target, handler);
}

export function protect(obj) {
  return watch(obj, (target, key, value) => {
    console.log("target", target, "key", key, "value", value);
    throw new Error("Attempted to modify protected object");
  });
}

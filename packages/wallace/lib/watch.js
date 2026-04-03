// These potentially trigger multiple `set` operations, so are handled separately to
// ensure the callback only fires once.
const ARRAY_MUTATING_METHODS = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort"
];
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
      const value = target[key],
        typeOfValue = typeof value;
      if (typeOfValue === "object") return new Proxy(value, handler);
      if (
        typeOfValue === "function" &&
        Array.isArray(target) &&
        ARRAY_MUTATING_METHODS.includes(key)
      ) {
        return (...args) => {
          const result = target[key](...args);
          callback(target, key, args);
          return result;
        };
      }
      if (target instanceof Date && typeOfValue === "function") {
        return value.bind(target);
      }
      return value;
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

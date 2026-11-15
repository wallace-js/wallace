import { componentName } from "./utils";

/**
 * Gets a stub by name.
 */
export const getStub = (component, name) => {
  const stub = component.constructor.stub[name];
  if (process.env.NODE_ENV !== "production") {
    if (!stub) {
      throw new Error(`${componentName(component)}: stub "${name}" is not defined.`);
    }
  }
  return stub;
};

/**
 * Gets a stub by name.
 */
export const getStub = (component, name) => component.constructor.stub[name];

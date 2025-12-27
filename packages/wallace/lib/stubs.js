/**
 * Gets a stub by name.
 */
export function getStub(component, name) {
  return component.constructor.stubs[name];
}

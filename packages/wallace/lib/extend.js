import { initConstructor } from "./component";

/**
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
  return initConstructor(function () {
    base.call(this);
  }, base);
}

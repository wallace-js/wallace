/**
 * This suite tests correct usage of all directives, not their effects.
 */

import { testMount } from "../utils";

describe("bind", () => {
  test("allows expression", () => {
    const code = `
      const Foo = (user) => (
        <input bind={user.name} />
      )
    `;
    expect(code).toCompileWithoutError();
  });
  test("disallows null", () => {
    const code = `
      const Bar = () => (
        <input bind />
      )
    `;
    expect(code).toCompileWithError(
      'The "bind" directive value must be of type expression. Found: null.'
    );
  });
  test("disallows string", () => {
    const code = `
      const Bar = () => (
        <input bind="Foo" />
      )
    `;
    expect(code).toCompileWithError(
      'The "bind" directive value must be of type expression. Found: string.'
    );
  });
});

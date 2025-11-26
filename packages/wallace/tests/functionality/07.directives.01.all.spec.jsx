/**
 * This suite tests correct usage of all directives, not their effects.
 */

import { testMount } from "../utils";

describe("base", () => {
  test("allows expression", () => {
    const code = `
      const Foo = () => (
        <span>Hello</span>
      )
      const Bar = () => (
        <span base={Foo}>Hello</span>
      )
    `;
    expect(code).toCompileWithoutError();
  });
  test("disallows null", () => {
    const code = `
      const Foo = () => (
        <span base>Hello</span>
      )
    `;
    expect(code).toCompileWithError(
      'The "base" directive value must be of type expression. Found: null.'
    );
  });
  test("disallows string", () => {
    const code = `
      const Foo = () => (
        <span base="Bar">Hello</span>
      )
    `;
    expect(code).toCompileWithError(
      'The "base" directive value must be of type expression. Found: string.'
    );
  });
});

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

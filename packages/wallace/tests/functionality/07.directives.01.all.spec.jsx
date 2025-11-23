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
        <input bind={user.name}>Hello</input>
      )
    `;
    expect(code).toCompileWithoutError();
  });
  test("disallows null", () => {
    const code = `
      const Bar = () => (
        <span base>Hello</span>
      )
    `;
    expect(code).toCompileWithError(
      'The "base" directive value must be of type expression. Found: null.'
    );
  });
  test("disallows string", () => {
    const code = `
      const Bar = () => (
        <span base="Foo">Hello</span>
      )
    `;
    expect(code).toCompileWithError(
      'The "base" directive value must be of type expression. Found: string.'
    );
  });
});

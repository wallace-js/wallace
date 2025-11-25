/*
Test that components can be defined in all legal ways.
*/
import { transform } from "../utils";

describe("Defining functions in equivalent ways compiles to same output", () => {
  const expectedOutput = transform(
    `const Foo = () => <div>Hello {name}</div>`
  ).code;
  test.each([
    ["function without props", `const Foo = () => <div>Hello {name}</div>`],
    [
      "function with normal props",
      `const Foo = (foo) => <div>Hello {name}</div>`,
    ],
    [
      "function with destructured props",
      `const Foo = ({foo}) => <div>Hello {name}</div>`,
    ],
  ])("%s", (condition, code) => {
    expect(transform(code).code).toBe(expectedOutput);
  });
});

test("JSX not allowed in expressions", () => {
  const code = `
    const Foo = () => (
      <center>
        {props.texts.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </center>
    );
  `;
  expect(code).toCompileWithError(
    "JSX elements are not allowed in expressions."
  );
});

test("JSX ignores comments and empty expressiosn", () => {
  const code = `
    const Foo = () => (
      <div>
        {/* comment */}
      </div>
    );
  `;
  expect(code).toCompileWithoutError();
});

describe("Illegal names in props", () => {
  test("illegal prop name compiles with error", () => {
    const src = `
      const A = (self) => (
        <div>
          Test
        </div>
      );
    `;
    expect(src).toCompileWithError(
      'Illegal names in props: "self" - these are reserved for extra args.'
    );
  });

  test("illegal name in destructured props compiles with error", () => {
    const src = `
      const A = ({e}) => (
        <div>
          Test
        </div>
      );
    `;
    expect(src).toCompileWithError(
      'Illegal names in props: "e" - these are reserved for extra args.'
    );
  });

  test("illegal renamed name in destructured props compiles with error", () => {
    const src = `
      const A = ({name: ctrl}) => (
        <div>
          Test
        </div>
      );
    `;
    expect(src).toCompileWithError(
      'Illegal names in props: "ctrl" - these are reserved for extra args.'
    );
  });
});

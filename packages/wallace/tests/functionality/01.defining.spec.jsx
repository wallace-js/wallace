/*
Test that components can be defined in all legal ways.
*/
import { transform } from "../utils";

describe("Defining functions in equivalent ways compiles to same output", () => {
  const expectedOutput = transform(
    `const Foo = () => <div>Hello {name}</div>`,
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
    "JSX elements are not allowed in expressions.",
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

describe("Additional arguments", () => {
  test("are allowed if recognised", () => {
    const src = `
    const A = ({}, _event, _component, _element) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithoutError();
  });

  test("must be identifiers", () => {
    const src = `
    const A = ({}, {}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError(
      'Illegal parameters: "ObjectPattern". You are only allowed "_element", "_event" and "_component".',
    );
  });

  test("are not allowed if not recognised", () => {
    const src = `
    const A = ({}, x) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError(
      'Illegal parameters: "x". You are only allowed "_element", "_event" and "_component".',
    );
  });
});

describe("Illegal names in props", () => {
  test("illegal prop name compiles with error", () => {
    const src = `
      const A = (_component) => (
        <div>
          Test
        </div>
      );
    `;
    expect(src).toCompileWithError(
      'Illegal names in props: "_component" - these are reserved for event callbacks.',
    );
  });

  test("illegal name in destructured props compiles with error", () => {
    const src = `
      const A = ({_event}) => (
        <div>
          Test
        </div>
      );
    `;
    expect(src).toCompileWithError(
      'Illegal names in props: "_event" - these are reserved for event callbacks.',
    );
  });

  test("illegal renamed name in destructured props compiles with error", () => {
    const src = `
      const A = ({name: _element}) => (
        <div>
          Test
        </div>
      );
    `;
    expect(src).toCompileWithError(
      'Illegal names in props: "_element" - these are reserved for event callbacks.',
    );
  });
});

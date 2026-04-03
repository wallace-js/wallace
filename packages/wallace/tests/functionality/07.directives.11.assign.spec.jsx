import { testMount } from "../utils";

describe("assign directive", () => {
  test("not allowed on non-root component", () => {
    const code = `
      const Foo = () => (
        <div>
          <span assign:foo>bar</span>
        </div>
      )
    `;
    expect(code).toCompileWithError(
      "The `assign` directive may only be used on root elements."
    );
  });

  test("may not provide string", () => {
    const code = `const Foo = () => <div assign="foo"></div>`;
    expect(code).toCompileWithError(
      "The `assign` directive value must be of type expression or null. Found: string."
    );
  });

  test("may not be null string", () => {
    const code = `const Foo = () => <div assign></div>`;
    expect(code).toCompileWithError(
      "The `assign` directive value must be of type expression. Found: null."
    );
  });

  // test("may not provide string", () => {
  //   const code = `
  //     const Foo = () => (
  //       <div>
  //         <span assign:foo>bar</span>
  //       </div>
  //     )
  //   `;
  //   expect(code).toCompileWithError(
  //     "The `assign` directive may only be used on root elements."
  //   );
  // });
  // test("removes its attribute", () => {
  //   const A = () => <div foo="bar" test-directive></div>;
  //   const component = testMount(A);
  //   expect(component.el.getAttribute("test-directive")).toBeNull();
  //   expect(component.el.getAttribute("foo")).toBe("bar");
  // });

  // test("reads base", () => {
  //   const A = () => <div test-directive></div>;
  //   expect(testMount(A).el.getAttribute("base")).toBe("test-directive");
  // });

  /*
  Check it isn't inherited.
  use qualifier OR expression but not both.
  defaults to field on
   */
});

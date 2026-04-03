import { extendComponent } from "wallace";
import { testMount } from "../utils";

describe("specification", () => {
  test("not allowed on non-root component", () => {
    const code = `
      const Foo = () => (
        <div>
          <span assign:foo>bar</span>
        </div>
      )
    `;
    expect(code).toCompileWithError(
      "The `assign` directive may only be used on the root element."
    );
  });

  test("must supply a value", () => {
    const code = `const Foo = () => <div assign></div>`;
    expect(code).toCompileWithError("The `assign` directive requires a value.");
  });

  test("may supply a string", () => {
    const code = `const Foo = () => <div assign="foo"></div>`;
    expect(code).toCompileWithoutError();
  });

  test("may supply a qualifier", () => {
    const code = `const Foo = () => <div assign="foo"></div>`;
    expect(code).toCompileWithoutError();
  });

  test("may supply an expression", () => {
    const code = `const Foo = () => <div assign={foo}></div>`;
    expect(code).toCompileWithoutError();
  });
});

describe("behaviour", () => {
  test("assigns to expression", () => {
    let foo;
    const MyComponent = () => <div assign={foo}></div>;
    const component = testMount(MyComponent);

    expect(component).toStrictEqual(foo);
  });

  test("assigns to props with string", () => {
    const props = {};
    const MyComponent = props => <div assign="x"></div>;
    const component = testMount(MyComponent, props);

    expect(component).toStrictEqual(props.x);
  });

  test("assigns to props with qualifier", () => {
    const props = {};
    const MyComponent = props => <div assign:x></div>;
    const component = testMount(MyComponent, props);

    expect(component).toStrictEqual(props.x);
  });

  test("assignment is not inherited", () => {
    const props = {};

    const Parent = props => <div assign:x></div>;
    const MyComponent = extendComponent(Parent, () => <div></div>);
    testMount(MyComponent, props);

    expect(props.x).toBeUndefined();
  });
});

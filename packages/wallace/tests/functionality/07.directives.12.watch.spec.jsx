import { extendComponent } from "wallace";
import { testMount } from "../utils";

describe("specification", () => {
  test("not allowed on non-root component", () => {
    const code = `
      const Foo = () => (
        <div>
          <span watch>bar</span>
        </div>
      )
    `;
    expect(code).toCompileWithError(
      "The `watch` directive may only be used on the root element."
    );
  });

  test("may supply no value", () => {
    const code = `const Foo = () => <div watch></div>`;
    expect(code).toCompileWithoutError();
  });

  test("may supply an expression", () => {
    const code = `const Foo = () => <div watch={foo}></div>`;
    expect(code).toCompileWithoutError();
  });

  test("may not supply string", () => {
    const code = `const Foo = () => <div watch="foo"></div>`;
    expect(code).toCompileWithError(
      "The `watch` directive requires a value of type `expression`."
    );
  });

  test("may not supply qualifier", () => {
    const code = `const Foo = () => <div watch:foo></div>`;
    expect(code).toCompileWithError("The `watch` directive may not have a qualifier.");
  });
});

describe("behaviour", () => {
  test("watches udpates component by default", () => {
    const props = { foo: 1 };
    const MyComponent = props => <div watch>{props.foo}</div>;
    const component = testMount(MyComponent, props);
    expect(component).toRender(`<div>1</div>`);
    component.props.foo = 2;
    expect(component).toRender(`<div>2</div>`);
  });

  // TODO: test alt callback and not inherited.

  // test("watchment is not inherited", () => {
  //   const props = {};

  //   const Parent = props => <div watch:x></div>;
  //   const MyComponent = extendComponent(Parent, () => <div></div>);
  //   testMount(MyComponent, props);

  //   expect(props.x).toBeUndefined();
  // });
});

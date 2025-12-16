import { testMount } from "../utils";

describe("Event directive", () => {
  test("disallows null", () => {
    const code = `
      const Bar = () => (
        <button onClick />
      )
    `;
    expect(code).toCompileWithError(
      'The "on*" directive value must be of type expression or string. Found: null.'
    );
  });

  test("with string value creates normal event", () => {
    const MyComponent = () => <div ref:target onClick="console.debug(999)"></div>;
    const component = testMount(MyComponent);
    // In HTML it will be lower case.
    expect(component).toRender(`<div onclick="console.debug(999)"></div>`);
  });

  test("with expression value creates event", () => {
    let callBackArgs;
    function foo(value) {
      callBackArgs = Array.from(arguments);
    }
    const props = { name: "bird" };
    const MyComponent = () => <div ref:target onClick={foo(42)}></div>;
    const component = testMount(MyComponent, props);
    expect(component).toRender(`<div></div>`);

    component.ref.target.click();
    expect(callBackArgs[0]).toBe(42);
  });

  test("with callback can access xargs", () => {
    let callBackArgs;
    function foo() {
      callBackArgs = Array.from(arguments);
    }
    const MyComponent = (_, { self, event, element }) => (
      <div>
        <button ref:btn onClick={foo(event, self, element)}></button>
      </div>
    );
    const component = testMount(MyComponent);

    component.ref.btn.click();
    expect(callBackArgs[0].type).toBe("click");
    expect(callBackArgs[1]).toEqual(component);
    expect(callBackArgs[2]).toEqual(component.ref.btn);
  });

  test("callback uses current props", () => {
    const setName = (element, birdName) => {
      element.textContent = birdName;
    };
    const props = { name: "bird" };
    const MyComponent = (props, { event }) => (
      <div ref:target onClick={setName(event.target, props.name)}></div>
    );
    const component = testMount(MyComponent, props);
    component.ref.target.click();
    expect(component.ref.target.textContent).toBe("bird");
    component.render({ name: "cat" });
    component.ref.target.click();
    expect(component.ref.target.textContent).toBe("cat");
  });
});

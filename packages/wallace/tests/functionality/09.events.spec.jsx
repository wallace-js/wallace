import { testMount } from "../utils";

describe("Event directive", () => {
  test("disallows null", () => {
    const code = `
      const Bar = () => (
        <button on:click />
      )
    `;
    expect(code).toCompileWithError(
      "The `on` directive requires a value of type `expression`."
    );
  });

  test("disallows string", () => {
    const code = `const Bar = () => <button on:click="foo()" />;`;
    expect(code).toCompileWithError(
      "The `on` directive requires a value of type `expression`."
    );
  });

  test("requires qualifier", () => {
    const code = `const Bar = () => <button on={foo()} />;`;
    expect(code).toCompileWithError("The `on` directive must have a qualifier.");
  });

  test.each([
    ["arrow function", "() => hub.save()"],
    ["function expression", "function () { hub.save(); }"]
  ])("disallows %s", (_, handler) => {
    const code = `const Bar = () => <button on:click={${handler}} />;`;
    expect(code).toCompileWithError(
      "Event handler must be a call, not a function, e.g. `on:click={hub.save()}` not `on:click={() => hub.save()}`, as the expression is run when the event fires."
    );
  });

  test.each([
    ["identifier", "save"],
    ["member expression", "hub.save"],
    ["optional member expression", "hub?.save"]
  ])("disallows uncalled %s", (_, handler) => {
    const code = `const Bar = () => <button on:click={${handler}} />;`;
    expect(code).toCompileWithError(
      "Event handler must be a call, e.g. `on:click={hub.save()}` not `on:click={hub.save}`, as the expression is run when the event fires."
    );
  });

  test.each([
    ["call", "hub.save()"],
    ["optional call", "hub.save?.()"],
    ["assignment", "hub.saved = true"],
    ["update", "hub.count++"],
    ["conditional call", "hub.ready && hub.save()"]
  ])("allows %s", (_, handler) => {
    const code = `const Bar = () => <button on:click={${handler}} />;`;
    expect(code).toCompileWithoutError();
  });

  test("onClick with string value is a normal attribute", () => {
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
    const model = { name: "bird" };
    const MyComponent = () => <div ref:target on:click={foo(42)}></div>;
    const component = testMount(MyComponent, model);
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
        <button ref:btn on:click={foo(event, self, element)}></button>
      </div>
    );
    const component = testMount(MyComponent);

    component.ref.btn.click();
    expect(callBackArgs[0].type).toBe("click");
    expect(callBackArgs[1]).toEqual(component);
    expect(callBackArgs[2]).toEqual(component.ref.btn);
  });

  test("callback uses current model", () => {
    const setName = (element, birdName) => {
      element.textContent = birdName;
    };
    const model = { name: "bird" };
    const MyComponent = (model, { event }) => (
      <div ref:target on:click={setName(event.target, model.name)}></div>
    );
    const component = testMount(MyComponent, model);
    component.ref.target.click();
    expect(component.ref.target.textContent).toBe("bird");
    component.render({ name: "cat" });
    component.ref.target.click();
    expect(component.ref.target.textContent).toBe("cat");
  });

  test("allows any event name, including custom events", () => {
    const received = [];
    const MyComponent = (_, { event }) => (
      <div ref:target on:item-selected={received.push(event.detail)}></div>
    );
    const component = testMount(MyComponent);
    component.ref.target.dispatchEvent(new CustomEvent("item-selected", { detail: 42 }));
    expect(received).toEqual([42]);
  });

  test("keeps the case of the event name", () => {
    const received = [];
    const MyComponent = (_, { event }) => (
      <div ref:target on:itemSelected={received.push(event.type)}></div>
    );
    const component = testMount(MyComponent);
    component.ref.target.dispatchEvent(new CustomEvent("itemselected"));
    component.ref.target.dispatchEvent(new CustomEvent("itemSelected"));
    expect(received).toEqual(["itemSelected"]);
  });
});

describe("Deprecated onClick syntax", () => {
  let warn;
  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  test("still creates an event listener, with a warning", () => {
    const code = `const Bar = () => <button onKeyUp={foo()} />;`;
    expect(code).toCompileWithoutError();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(
      "`onKeyUp={...}` is deprecated and will become a compile error. Use `on:keyup={...}` instead."
    );
  });

  test("works with lowercase names", () => {
    const code = `const Bar = () => <button onclick={foo()} />;`;
    expect(code).toCompileWithoutError();
    expect(warn.mock.calls[0][0]).toContain("Use `on:click={...}` instead.");
  });

  test("still checks the handler is a call", () => {
    const code = `const Bar = () => <button onClick={hub.save} />;`;
    expect(code).toCompileWithError(
      "Event handler must be a call, e.g. `on:click={hub.save()}` not `on:click={hub.save}`, as the expression is run when the event fires."
    );
  });

  test("string values don't warn", () => {
    const code = `const Bar = () => <button onClick="foo()" />;`;
    expect(code).toCompileWithoutError();
    expect(warn).not.toHaveBeenCalled();
  });
});

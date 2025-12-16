import { testMount } from "../utils";

describe("Xargs", () => {
  test("are allowed if recognised", () => {
    const src = `
    const A = ({}, {self, ctrl, element, event}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithoutError();
  });

  test("must be a destructured object", () => {
    const src = `
    const A = ({}, ctrl) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError("Extra args must be a destructured object.");
  });

  test("are not allowed if not recognised", () => {
    const src = `
    const A = ({}, {x}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError(
      'Illegal parameter in extra args: "x". You are only allowed "ctrl", "self", "event", "element".'
    );
  });

  test("are not renamed if not in args", () => {
    const ctrl = 9;
    const Foo = ({}, { self }) => <div>Test {ctrl}</div>;

    const component = testMount(Foo);
    expect(component).toRender(`<div>Test <span>9</span></div>`);
  });
});

describe("Xargs access validation in directive expressions", () => {
  const eventXargs = ["event", "element"];
  const applyXargs = ["ctrl", "self", "element"];

  test.each(eventXargs)("Event arg '%s' is not allowed in non-event directive", xarg => {
    const src = `const Foo = (_, { ${xarg} }) => <div class={${xarg}}>Test</div>;`;
    expect(src).toCompileWithError(
      `The "class" directive may not access scoped variable "${xarg}".`
    );
  });

  test("onEvent may access event", () => {
    const src = `const Foo = (_, { event }) => <div onClick={event}>Test</div>;`;
    expect(src).toCompileWithoutError();
  });

  test("onEvent may access element", () => {
    const src = `const Foo = (_, { element }) => <div onClick={element}>Test</div>;`;
    expect(src).toCompileWithoutError();
  });

  test.each(applyXargs)("Apply arg '%s' is allowed in apply directive", xarg => {
    const src = `const Foo = (_, { ${xarg} }) => <div apply={${xarg}}>Test</div>;`;
    expect(src).toCompileWithoutError();
  });

  test("apply may not access event", () => {
    const src = `const Foo = (_, { event }) => <div apply={event}>Test</div>;`;
    expect(src).toCompileWithError(
      `The "apply" directive may not access scoped variable "event".`
    );
  });
});

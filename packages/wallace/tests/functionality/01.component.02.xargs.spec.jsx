import { testMount } from "../utils";

describe("Xargs", () => {
  test("are allowed if recognised", () => {
    const src = `
    const A = ({}, {self, ctrl, element, event, props}) => (
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
      'Illegal parameter in extra args: "x". You are only allowed "ctrl", "self", "props", "event", "element".'
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
  const applyXargs = ["ctrl", "self", "props", "element"];

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

// TODO: ensure props can't be accessed in fixed/css

describe("Xargs point to correct objects", () => {
  test("element is element", () => {
    let e;
    const Foo = (_, { element }) => (
      <div>
        <button apply={(e = element)}>Test</button>
      </div>
    );
    testMount(Foo);
    expect(String(e)).toBe("[object HTMLButtonElement]");
  });

  test("event is event", () => {
    let e;
    const Foo = (_, { event }) => (
      <div>
        <button ref:btn onClick={(e = event)}>
          Test
        </button>
      </div>
    );
    const component = testMount(Foo);
    component.refs.btn.node.click();
    expect(String(e)).toBe("[object MouseEvent]");
  });

  test("ctrl is ctrl", () => {
    const Foo = (_, { ctrl }) => <div>{ctrl.name}</div>;
    Foo.prototype.render = function () {
      this.ctrl = { name: "Bear" };
      this.update();
    };
    const component = testMount(Foo);
    expect(component).toRender(`<div>Bear</div>`);
  });

  test("self is self", () => {
    const Foo = (_, { self }) => <div>{self.foo}</div>;
    Foo.prototype.render = function () {
      this.foo = "bar";
      this.update();
    };
    const component = testMount(Foo);
    expect(component).toRender(`<div>bar</div>`);
  });

  test("props are props", () => {
    const Foo = (_, { props }) => <div>{props.foo}</div>;
    const component = testMount(Foo, { foo: "baz" });
    expect(component).toRender(`<div>baz</div>`);
  });

  test("both props are allowed", () => {
    const Foo = ({ color }, { props }) => <div style:color={color}>{props.name}</div>;
    const component = testMount(Foo, { name: "Fox", color: "red" });
    expect(component).toRender(`<div style="color: red;">Fox</div>`);
  });
});

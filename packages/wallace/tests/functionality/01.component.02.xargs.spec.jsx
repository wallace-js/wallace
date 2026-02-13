import { testMount } from "../utils";

describe("Xargs", () => {
  test("are allowed if recognised", () => {
    const src = `
    const A = (_, {self, ctrl, element, event, props}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithoutError();
  });

  test("must be a destructured object", () => {
    const src = `
    const A = (_, ctrl) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError("Extra args must be a destructured object.");
  });

  test("are not allowed if not recognised", () => {
    const src = `
    const A = (_, {x}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError(
      'Illegal parameter in extra args: "x". You are only allowed "ctrl", "self", "props", "event", "element".'
    );
  });

  test("are not renamed if not in Xargs", () => {
    const ctrl = 9;
    const Foo = () => <div>Test {ctrl}</div>;

    const component = testMount(Foo);
    expect(component).toRender(`<div>Test <span>9</span></div>`);
  });

  test("are allowed in props if not in Xargs", () => {
    const Foo = ({ self, ctrl, element, event, props }) => (
      <div>
        <div>{self}</div>
        <div>{ctrl}</div>
        <div>{element}</div>
        <div>{event}</div>
        <div>{props}</div>
        <button ref:btn onClick={foo(event, element)}>
          Test
        </button>
      </div>
    );

    let args;
    const foo = (event, element) => {
      args = [event, element];
    };

    const component = testMount(Foo, {
      self: 1,
      ctrl: 2,
      element: 3,
      event: 4,
      props: 5
    });
    expect(component).toRender(
      `<div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
        <div>5</div>
        <button>Test</button>
      </div>`
    );
    component.ref.btn.click();
    expect(args).toEqual([4, 3]);
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

  test("may not access disallowed xarg if in xargs", () => {
    const src = `const Foo = (_, { event }) => <div apply={event}>Test</div>;`;
    expect(src).toCompileWithError(
      `The "apply" directive may not access scoped variable "event".`
    );
  });

  test("may access disallowed xarg if not in xargs", () => {
    const src = `const Foo = () => <div apply={event}>Test</div>;`;
    expect(src).toCompileWithoutError();
  });

  test("may access disallowed xarg if in props", () => {
    const src = `const Foo = ({ event }) => <div apply={event}>Test</div>;`;
    expect(src).toCompileWithoutError();
  });
});

describe("Xargs point to correct objects", () => {
  test("element is element in apply", () => {
    let e;
    const Foo = (_, { element }) => (
      <div>
        <button apply={(e = element)}>Test</button>
      </div>
    );
    testMount(Foo);
    expect(String(e)).toBe("[object HTMLButtonElement]");
  });

  test("element is element in event", () => {
    let e;
    const Foo = (_, { element }) => (
      <div>
        <button ref:btn onClick={(e = element)}>
          Test
        </button>
      </div>
    );
    testMount(Foo);
    const component = testMount(Foo);
    component.ref.btn.click();
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
    component.ref.btn.click();
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

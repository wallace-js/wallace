import { testMount } from "../utils";

describe("Fixed specification", () => {
  test("disallows null", () => {
    const code = `
      const Bar = () => (
        <div fixed></div>
      )
    `;
    expect(code).toCompileWithError(
      'The "fixed" directive value must be of type expression. Found: null.'
    );
  });

  test("disallows string", () => {
    const code = `
      const Bar = () => (
        <div fixed="foo"></div>
      )
    `;
    expect(code).toCompileWithError(
      'The "fixed" directive value must be of type expression. Found: string.'
    );
  });

  test("disallows expression without qualifier", () => {
    const code = `
      const Foo = () => (
        <div fixed={x}></div>
      )
    `;
    expect(code).toCompileWithError('The "fixed" directive must have a qualifier.');
  });

  test("allows expression with qualifier", () => {
    const code = `
      const Foo = () => (
        <div fixed:class={x} />
      )
    `;
    expect(code).toCompileWithoutError();
  });

  test("disallows access to props", () => {
    const code = `
      const Foo = ({foo}) => (
        <div fixed:class={foo} />
      )
    `;
    expect(code).toCompileWithError(
      'The "fixed" directive may not access scoped variable "props".'
    );
  });

  const xargs = ["self", "element", "event", "props"];
  if (wallaceConfig.flags.allowCtrl) {
    xargs.push("ctrl");
  }

  test.each(xargs)("disallows access to %s", xarg => {
    const code = `
      const Foo = (_, {${xarg}}) => (
        <div fixed:class={${xarg}} />
      )
    `;
    expect(code).toCompileWithError(
      `The "fixed" directive may not access scoped variable "${xarg}".`
    );
  });
});

describe("Fixed directive", () => {
  test("works with string", () => {
    const css = {
      danger: "red",
      ok: "green"
    };
    const Foo = () => (
      <div>
        <span fixed:class={css.ok}>Hello</span>
        <div fixed:class={css.danger}></div>
      </div>
    );
    const component = testMount(Foo);
    expect(component).toRender(`
      <div>
        <span class="green">Hello</span>
        <div class="red"></div>
      </div>
    `);
  });
});

describe("css directive", () => {
  test("works with string", () => {
    const css = {
      danger: "red",
      ok: "green"
    };
    const Foo = () => (
      <div>
        <span css={css.ok}>Hello</span>
        <div css={css.danger}></div>
      </div>
    );
    const component = testMount(Foo);
    expect(component).toRender(`
      <div>
        <span class="green">Hello</span>
        <div class="red"></div>
      </div>
    `);
  });
});

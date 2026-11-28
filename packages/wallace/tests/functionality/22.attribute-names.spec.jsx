import { testMount } from "../utils";

/**
 * Attributes must use their HTML name (`for`, not `htmlFor`). Static values go into the
 * template, and dynamic values set the DOM property, which may have a different name.
 * Other spellings are compile errors, as they would silently fail in one of the cases.
 */

describe("Label for", () => {
  test("Static `for` links the label", () => {
    const Form = () => (
      <div>
        <label for="name">Name</label>
        <input id="name" />
      </div>
    );
    const component = testMount(Form);
    const label = component.el.querySelector("label");
    expect(label.getAttribute("for")).toBe("name");
    expect(label.control).toBe(component.el.querySelector("input"));
  });

  test("Dynamic `for` links the label and updates", () => {
    const Form = ({ id }) => (
      <div>
        <label for={id}>Name</label>
        <input id={id} />
      </div>
    );
    const model = { id: "a" };
    const component = testMount(Form, model);
    const label = component.el.querySelector("label");
    expect(label.getAttribute("for")).toBe("a");
    expect(label.control).toBe(component.el.querySelector("input"));
    model.id = "b";
    component.update();
    expect(label.getAttribute("for")).toBe("b");
    expect(label.control).toBe(component.el.querySelector("input"));
  });
});

describe("Other attributes with differently named properties", () => {
  test("Dynamic values set the property", () => {
    const Foo = ({ readonly, tabindex, maxlength }) => (
      <input readonly={readonly} tabindex={tabindex} maxlength={maxlength} />
    );
    const component = testMount(Foo, { readonly: true, tabindex: 3, maxlength: 5 });
    const input = component.el;
    expect(input.readOnly).toBe(true);
    expect(input.tabIndex).toBe(3);
    expect(input.maxLength).toBe(5);
  });

  test("Dynamic colspan sets the property", () => {
    const Foo = ({ span }) => (
      <table>
        <tbody>
          <tr>
            <td colspan={span}></td>
          </tr>
        </tbody>
      </table>
    );
    const component = testMount(Foo, { span: 2 });
    expect(component.el.querySelector("td").colSpan).toBe(2);
  });

  test("Static values render as attributes", () => {
    const Foo = () => <input readonly tabindex="2" maxlength="4" />;
    const component = testMount(Foo);
    expect(component).toRender(`<input readonly="" tabindex="2" maxlength="4">`);
  });
});

describe("DOM property names are compile errors", () => {
  test.each([
    ["htmlFor", `"x"`, "for"],
    ["htmlFor", `{x}`, "for"],
    ["className", `"x"`, "class"],
    ["className", `{x}`, "class"],
    ["readOnly", `{x}`, "readonly"],
    ["tabIndex", `"1"`, "tabindex"],
    ["maxLength", `{x}`, "maxlength"],
    ["colSpan", `{x}`, "colspan"],
    ["Tabindex", `"1"`, "tabindex"]
  ])("`%s=%s` is rejected", (name, value, htmlName) => {
    const code = `
      const Foo = (x) => (
        <div ${name}=${value}></div>
      );
    `;
    expect(code).toCompileWithError(
      `Use the HTML attribute name \`${htmlName}\`, not \`${name}\`.`
    );
  });

  test("HTML names compile", () => {
    const code = `
      const Foo = (x) => (
        <div>
          <label for={x}></label>
          <input readonly tabindex="1" maxlength={x} />
        </div>
      );
    `;
    expect(code).toCompileWithoutError();
  });
});

describe("Dynamic values of null or undefined", () => {
  test("remove the attribute and reset the property", () => {
    const Foo = ({ maxlength, min, title, label, value }) => (
      <input
        maxlength={maxlength}
        min={min}
        title={title}
        aria-label={label}
        value={value}
      />
    );
    const model = { maxlength: 5, min: "2", title: "t", label: "l", value: "v" };
    const component = testMount(Foo, model);
    const input = component.el;
    expect(input.maxLength).toBe(5);
    expect(input.getAttribute("min")).toBe("2");
    expect(input.getAttribute("title")).toBe("t");
    expect(input.getAttribute("aria-label")).toBe("l");
    expect(input.value).toBe("v");

    Object.assign(model, {
      maxlength: undefined,
      min: null,
      title: undefined,
      label: undefined,
      value: undefined
    });
    component.update();
    expect(input.hasAttribute("maxlength")).toBe(false);
    expect(input.hasAttribute("min")).toBe(false);
    expect(input.hasAttribute("title")).toBe(false);
    expect(input.hasAttribute("aria-label")).toBe(false);
    expect(input.value).toBe("");

    Object.assign(model, { maxlength: 3, label: "m" });
    component.update();
    expect(input.maxLength).toBe(3);
    expect(input.getAttribute("aria-label")).toBe("m");
  });

  test("leave the attribute unset on first render", () => {
    const Foo = ({ maxlength, min, label }) => (
      <input maxlength={maxlength} min={min} aria-label={label} />
    );
    const component = testMount(Foo, {});
    const input = component.el;
    expect(input.hasAttribute("maxlength")).toBe(false);
    expect(input.hasAttribute("min")).toBe(false);
    expect(input.hasAttribute("aria-label")).toBe(false);
  });

  test("clear a dynamic class", () => {
    const Foo = ({ cls }) => <div class={cls}></div>;
    const model = { cls: "a" };
    const component = testMount(Foo, model);
    expect(component).toRender(`<div class="a"></div>`);
    model.cls = undefined;
    component.update();
    expect(component).toRender(`<div></div>`);
  });

  test("other falsy values are still set", () => {
    const Foo = ({ maxlength, title }) => <input maxlength={maxlength} title={title} />;
    const component = testMount(Foo, { maxlength: 0, title: "" });
    expect(component.el.maxLength).toBe(0);
    expect(component.el.getAttribute("title")).toBe("");
  });
});

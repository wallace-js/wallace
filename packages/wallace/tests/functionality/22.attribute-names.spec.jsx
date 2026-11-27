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

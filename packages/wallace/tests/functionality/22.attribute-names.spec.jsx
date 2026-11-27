import { testMount } from "../utils";

/**
 * Attributes whose DOM property has a different name (`for` / `htmlFor`) must work with
 * either spelling, whether the value is static (goes in the template) or dynamic (sets
 * the property).
 */

describe("Label for and htmlFor", () => {
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

  test("Static `htmlFor` links the label", () => {
    const Form = () => (
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" />
      </div>
    );
    const component = testMount(Form);
    const label = component.el.querySelector("label");
    expect(label.getAttribute("for")).toBe("name");
    expect(label.hasAttribute("htmlfor")).toBe(false);
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

  test("Dynamic `htmlFor` links the label", () => {
    const Form = ({ id }) => (
      <div>
        <label htmlFor={id}>Name</label>
        <input id={id} />
      </div>
    );
    const component = testMount(Form, { id: "a" });
    const label = component.el.querySelector("label");
    expect(label.getAttribute("for")).toBe("a");
    expect(label.control).toBe(component.el.querySelector("input"));
  });
});

describe("Other attributes with differently named properties", () => {
  test("Static `className` sets class", () => {
    const Foo = () => <div className="danger"></div>;
    const component = testMount(Foo);
    expect(component).toRender(`<div class="danger"></div>`);
  });

  test("Dynamic lowercase names set the property", () => {
    const Foo = ({ readonly, tabindex, maxlength }) => (
      <input readonly={readonly} tabindex={tabindex} maxlength={maxlength} />
    );
    const component = testMount(Foo, { readonly: true, tabindex: 3, maxlength: 5 });
    const input = component.el;
    expect(input.readOnly).toBe(true);
    expect(input.tabIndex).toBe(3);
    expect(input.maxLength).toBe(5);
  });

  test("Dynamic camelCase names set the property", () => {
    const Foo = ({ readOnly, tabIndex, maxLength }) => (
      <input readOnly={readOnly} tabIndex={tabIndex} maxLength={maxLength} />
    );
    const component = testMount(Foo, { readOnly: true, tabIndex: 3, maxLength: 5 });
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

  test("Static camelCase names render lowercase attributes", () => {
    const Foo = () => <input readOnly tabIndex="2" maxLength="4" />;
    const component = testMount(Foo);
    expect(component).toRender(`<input readonly="" tabindex="2" maxlength="4">`);
  });
});

import { testMount } from "../utils";

describe("specification", () => {
  test("with qualifier and expression", () => {
    const code = `const Foo = () => <div bind-as:range={foo} ></div>`;
    expect(code).toCompileWithoutError();
  });

  test("must supply an expression", () => {
    const code = `const Foo = () => <div bind-as:range="foo"></div>`;
    expect(code).toCompileWithError(
      "The `bind-as` directive requires a value of type `expression`."
    );
  });

  test("must supply a qualifier", () => {
    const code = `const Foo = () => <div bind-as={foo}></div>`;
    expect(code).toCompileWithError("The `bind-as` directive must have a qualifier.");
  });

  test("cannot supply unsupported qualifier", () => {
    const code = `const Foo = () => <div bind-as:time={foo}></div>`;
    expect(code).toCompileWithError(
      "`time` is not a valid value. Must be one of : checkbox, date, number, range."
    );
  });
});

describe("behaviour", () => {
  test("checkbox", () => {
    const data = true;
    const MyComponent = () => <input bind-as:checkbox={data} />;
    const component = testMount(MyComponent);
    expect(component).toRender(`<input type="checkbox">`);
    expect(component.el.checked).toStrictEqual(true);
  });

  test("date", () => {
    const data = new Date();
    const MyComponent = () => <input bind-as:date={data} />;
    const component = testMount(MyComponent);
    expect(component).toRender(`<input type="date">`);
    expect(component.el.valueAsDate.toDateString()).toStrictEqual(data.toDateString());
  });

  test("number", () => {
    const data = 42;
    const MyComponent = () => <input bind-as:number={data} />;
    const component = testMount(MyComponent);
    expect(component).toRender(`<input type="number">`);
    expect(component.el.valueAsNumber).toStrictEqual(data);
  });

  test("range", () => {
    const data = 42;
    const MyComponent = () => <input bind-as:range={data} />;
    const component = testMount(MyComponent);
    expect(component).toRender(`<input type="range">`);
    expect(component.el.valueAsNumber).toStrictEqual(data);
  });
});

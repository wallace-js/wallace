/*
We use a custom directive defined in `test.babel.config.cjs` because it's a fiddle
trying to do it any other way.
*/
import { testMount } from "../utils";

describe("Custom directive", () => {
  test("removes its attribute", () => {
    const A = () => <div foo="bar" test-directive></div>;
    const component = testMount(A);
    expect(component.el.getAttribute("test-directive")).toBeNull();
    expect(component.el.getAttribute("foo")).toBe("bar");
  });

  test("reads base", () => {
    const A = () => <div test-directive></div>;
    expect(testMount(A).el.getAttribute("base")).toBe("test-directive");
  });

  test("reads qualifier", () => {
    const A = () => <div test-directive></div>;
    expect(testMount(A).el.getAttribute("qualifier")).toBe("");

    const B = () => <div test-directive:beaver></div>;
    expect(testMount(B).el.getAttribute("qualifier")).toBe("beaver");
  });

  test("reads value-value", () => {
    const A = () => <div test-directive="pelican"></div>;
    const component = testMount(A);
    expect(component.el.getAttribute("value-value")).toBe("pelican");
    expect(component.el.getAttribute("value-expression")).toBe("");
  });

  test("reads value-expression", () => {
    const A = () => <div test-directive={pelican}></div>;
    const component = testMount(A);
    expect(component.el.getAttribute("value-value")).toBe("");
    expect(component.el.getAttribute("value-expression")).toBe(
      "[object Object]",
    );
  });

  test("renders fully", () => {
    const A = () => <div test-directive:foo="pelican"></div>;
    const component = testMount(A);
    expect(component).toRender(`
      <div
        value-value="pelican"
        value-expression=""
        qualifier="foo"
        base="test-directive"
      ></div>`);
  });
});

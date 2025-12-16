import { testMount } from "../utils";
import { watch, protect } from "wallace";

test("Can make a component reactive", () => {
  const MyComponent = ({ checked }) => (
    <div>
      <input ref:cbx type="checkbox" bind={checked} />
      <span>{checked ? "yep" : "nope"}</span>
    </div>
  );
  MyComponent.prototype.render = function (props) {
    this.props = watch(props, () => this.update());
    this.update();
  };
  const component = testMount(MyComponent, { checked: false });
  expect(component).toRender(`<div><input type="checkbox"><span>nope</span></div>`);
  const checkbox = component.ref.cbx;
  checkbox.click();
  expect(component).toRender(`<div><input type="checkbox"><span>yep</span></div>`);
  checkbox.click();
  expect(component).toRender(`<div><input type="checkbox"><span>nope</span></div>`);
});

describe("Watch", () => {
  test("Fires callback when object is modified", () => {
    let calls = 0;
    const obj = { a: 1, b: 2 };
    const reactive = watch(obj, () => calls++);
    reactive.a = 2;
    expect(calls).toBe(1);
  });

  test("Doesn't fire callback when original is modified", () => {
    let calls = 0;
    const obj = { a: 1, b: 2 };
    const reactive = watch(obj, () => calls++);
    obj.a = 2;
    expect(calls).toBe(0);
  });

  test("Fires callback when nested object is modified", () => {
    let calls = 0;
    const obj = [{ a: 1, b: 2 }];
    const reactive = watch(obj, () => calls++);
    reactive[0].a = 2;
    expect(calls).toBe(1);
  });

  test("Accessing nested object does not replace original object", () => {
    let calls = 0;
    const obj = [{ a: 1, b: 2 }];
    const reactive = watch(obj, () => calls++);
    reactive[0].a = 2;
    expect(calls).toBe(1);
    obj[0].a = 3;
    expect(calls).toBe(1);
  });

  test("Array operations fire once", () => {
    let calls = 0;
    const obj = [1, 2, 3];
    const reactive = watch(obj, () => calls++);
    reactive.pop();
    expect(calls).toBe(1);
    reactive.push(4);
    expect(calls).toBe(2);
    reactive[0] = 5;
    expect(calls).toBe(3);
  });

  test("Callback receives expected args", () => {
    let call;
    const obj = [];
    const reactive = watch(obj, (target, key, value) => (call = { target, key, value }));
    reactive.push({ c: 3 });
    expect(call.key).toEqual("push");
    expect(call.value).toEqual([{ c: 3 }]);
    reactive[0] = { a: 2 };
    expect(call.key).toEqual("0");
    expect(call.value).toEqual({ a: 2 });
  });
});

describe("Protect", () => {
  test("Throws error when object is modified", () => {
    const obj = { a: 1, b: 2 };
    const reactive = protect(obj);
    expect(() => (reactive.a = 3)).toThrow("Attempted to modify protected object");
  });

  test("Does not throw error when object is accessed", () => {
    const obj = { a: 1, b: 2 };
    const reactive = protect(obj);
    const x = reactive.a;
    expect(x).toBe(1);
  });
});

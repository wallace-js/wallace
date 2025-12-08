import { testMount } from "../utils";
import { watch } from "wallace";

test("Can make a component reactive", () => {
  const MyComponent = ({ checked }) => (
    <div>
      <input ref:cbx type="checkbox" bind={checked} />
      <span>{checked ? "yep" : "nope"}</span>
    </div>
  );
  MyComponent.prototype.render = function (props) {
    this.props = watch(props, () => this.update(), 0);
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

import { createComponent } from "wallace";
import { testMount } from "../utils";

describe("Component create", () => {
  test("creates and renders component", () => {
    const Foo = () => <div>Test</div>;
    const Bar = ({ name }, { ctrl }) => (
      <div>
        <span>{name}</span>
        <span>{ctrl.name}</span>
      </div>
    );
    const component = testMount(Foo);
    const ctrl = { name: "Wallace" };
    const child = createComponent(Bar, { name: "William" }, ctrl);
    component.el.innerHTML = child.el.innerHTML;
    expect(component).toRender(`<div><span>William</span><span>Wallace</span></div>`);
  });
});

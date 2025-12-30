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
    component.el.innerHTML = Bar.create({ name: "William" }, ctrl).el.innerHTML;
    expect(component).toRender(`<div><span>William</span><span>Wallace</span></div>`);
  });
});

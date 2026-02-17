import { createComponent } from "wallace";
import { testMount } from "../utils";

describe("Component create", () => {
  if (wallaceConfig.flags.allowCtrl) {
    test("creates and renders component with ctrl", () => {
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
  } else {
    test("creates and renders component without ctrl", () => {
      const Foo = () => <div>Test</div>;
      const Bar = ({ name }) => (
        <div>
          <span>{name}</span>
        </div>
      );
      const component = testMount(Foo);
      const child = createComponent(Bar, { name: "William" });
      component.el.innerHTML = child.el.innerHTML;
      expect(component).toRender(`<div><span>William</span></div>`);
    });
  }
});

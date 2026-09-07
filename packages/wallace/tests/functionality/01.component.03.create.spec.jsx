import { createComponent } from "wallace";
import { testMount } from "../utils";

describe("Component create", () => {
  if (wallaceConfig.flags.allowHub) {
    test("creates and renders component with hub", () => {
      const Foo = () => <div>Test</div>;
      const Bar = ({ name }, { hub }) => (
        <div>
          <span>{name}</span>
          <span>{hub.name}</span>
        </div>
      );
      const component = testMount(Foo);
      const hub = { name: "Wallace" };
      const child = createComponent(Bar, { name: "William" }, hub);
      component.el.innerHTML = child.el.innerHTML;
      expect(component).toRender(`<div><span>William</span><span>Wallace</span></div>`);
    });
  } else {
    test("creates and renders component without hub", () => {
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

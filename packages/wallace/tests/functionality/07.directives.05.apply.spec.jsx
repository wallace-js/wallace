import { testMount } from "../utils";

describe("Apply directive", () => {
  test("changes style", () => {
    const setText = (el, name) => (el.textContent = name);
    const Foo = ({ name }, { el }) => (
      <div>
        <h3 apply={setText(el, name)}></h3>
      </div>
    );
    const component = testMount(Foo, { name: "Wallace" });
    expect(component).toRender(`
      <div>
        <h3>Wallace</h3>
      </div>
    `);
  });
});

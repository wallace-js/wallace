import { testMount } from "../utils";

describe("Apply directive", () => {
  test("changes style", () => {
    const setText = (element, name) => (element.textContent = name);
    const Foo = ({ name }, { element }) => (
      <div>
        <h3 apply={setText(element, name)}></h3>
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

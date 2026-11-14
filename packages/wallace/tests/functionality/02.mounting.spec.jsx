import { mount } from "wallace";
import { createDiv, tidyHTML } from "../utils";

describe("Mounting without model", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  let name;
  const Animal = () => <div>Hello {name}</div>;

  test("Mounting to div by reference works", () => {
    name = "fox";
    const div = createDiv();
    mount(div, Animal);
    expect(document.body.innerHTML).toBe("<div>Hello <span>fox</span></div>");
  });

  // We replaced the element, so the old div will disappear.
  test("Mounting to div by id works and strips id", () => {
    name = "otter";
    createDiv("main");
    mount("main", Animal);
    expect(document.body.innerHTML).toBe("<div>Hello <span>otter</span></div>");
  });
});

describe("Mounting with model", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  const Animal = ({ name }) => <div>Hello {name}</div>;

  test("Mounting multiple components works", () => {
    document.body.innerHTML = `
      <div>
        <div id="a"></div>
        <div id="b"></div>
        <div id="c"></div>
      </div>
    `;

    mount("a", Animal, { name: "snake" });
    mount("c", Animal, { name: "crocodile" });
    expect(tidyHTML(document.body.innerHTML)).toBe(
      tidyHTML(`
      <div>
        <div>Hello <span>snake</span></div>
        <div id="b"></div>
        <div>Hello <span>crocodile</span></div>
      </div>
    `)
    );
  });
});

if (wallaceConfig.flags.allowHub) {
  describe("Mounting with hub", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });
    const Row = (item, { hub }) => (
      <li>
        {hub.prefix}
        {item}
      </li>
    );
    const List = ctrl => (
      <ul>
        <Row.repeat models={ctrl.items} />
      </ul>
    );
    const ctrl = { prefix: "#", items: ["a", "b"] };

    test("hub defaults to model and is passed down", () => {
      const component = mount(createDiv(), List, ctrl);
      expect(component.hub).toBe(ctrl);
      expect(component).toRender(`
        <ul>
          <li><span>#</span><span>a</span></li>
          <li><span>#</span><span>b</span></li>
        </ul>
      `);
    });

    test("explicit hub is used instead of model", () => {
      const hub = { prefix: "*" };
      const component = mount(createDiv(), List, ctrl, hub);
      expect(component.hub).toBe(hub);
      expect(component).toRender(`
        <ul>
          <li><span>*</span><span>a</span></li>
          <li><span>*</span><span>b</span></li>
        </ul>
      `);
    });

    test("explicit null hub is not replaced by model", () => {
      const Empty = () => <div></div>;
      const component = mount(createDiv(), Empty, ctrl, null);
      expect(component.hub).toBe(null);
    });
  });
} else {
  test("Mounting without hub ignores extra arguments", () => {
    const Animal = ({ name }) => <div>Hello {name}</div>;
    const component = mount(createDiv(), Animal, { name: "owl" }, {});
    expect(component.hub).toBeUndefined();
  });
}

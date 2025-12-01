import { mount } from "wallace";
import { createDiv, tidyHTML } from "../utils";

describe("Mounting without props", () => {
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

describe("Mounting with props", () => {
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

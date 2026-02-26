import { testMount } from "../utils";

const Child = ({ i }) => <div>{i}</div>;

const KeyString = data => (
  <div>
    <Child.repeat props={data} key={item => item.i} />
  </div>
);

const KeyFunction = data => (
  <div>
    <Child.repeat props={data} key="i" />
  </div>
);

describe("Nodes are bound to keys", () => {
  test.each([
    ["KeyString", KeyString],
    ["KeyFunction", KeyFunction]
  ])("%s", (_, Container) => {
    const component = testMount(Container, [
      { i: "red" },
      { i: "yellow" },
      { i: "blue" }
    ]);
    expect(component).toRender(`
      <div>
        <div>red</div>
        <div>yellow</div>
        <div>blue</div>
      </div>
    `);
    component.el.childNodes[0].className = "red";
    expect(component).toRender(`
      <div>
        <div class="red">red</div>
        <div>yellow</div>
        <div>blue</div>
      </div>
    `);
    component.render([{ i: "green" }, { i: "red" }, { i: "white" }]);
    expect(component).toRender(`
      <div>
        <div>green</div>
        <div class="red">red</div>
        <div>white</div>
      </div>
    `);
  });
});

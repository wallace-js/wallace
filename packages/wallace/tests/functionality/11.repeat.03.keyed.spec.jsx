import { testMount } from "../utils";

const Child = ({ i }) => <div>{i}</div>;

const KeyString = data => (
  <div>
    <Child.repeat models={data} key={item => item.i} />
  </div>
);

const KeyFunction = data => (
  <div>
    <Child.repeat models={data} key="i" />
  </div>
);

const permutations = [
  ["KeyString", KeyString],
  ["KeyFunction", KeyFunction]
];

if (wallaceConfig.flags.allowStubs) {
  const UsingStub = data => (
    <div>
      <stub.child.repeat models={data} key="i" />
    </div>
  );

  UsingStub.stub.child = ({ i }) => <div>{i}</div>;
  permutations.push(["Stubs", UsingStub]);
}

describe("Nodes are bound to keys", () => {
  test.each(permutations)("%s", (_, Container) => {
    Container.prototype.dismount = function () {};
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

describe("New items before and after existing items", () => {
  test.each(permutations)("%s", (_, Container) => {
    const component = testMount(Container, [{ i: "red" }]);
    component.render([{ i: "green" }, { i: "red" }, { i: "white" }]);
    expect(component).toRender(`
      <div>
        <div>green</div>
        <div>red</div>
        <div>white</div>
      </div>
    `);
  });
});

describe("Invalid keys", () => {
  test("throw if duplicated", () => {
    expect(() => testMount(KeyFunction, [{ i: 1 }, { i: 2 }, { i: 1 }])).toThrow(
      'Child.repeat: duplicate key 1 (key="i").'
    );
  });

  test("throw if missing", () => {
    expect(() => testMount(KeyFunction, [{ i: 1 }, { id: 2 }])).toThrow(
      'Child.repeat: item 1 has no key (key="i").'
    );
  });

  test("throw if missing from key function", () => {
    expect(() => testMount(KeyString, [{ i: 1 }, { id: 2 }])).toThrow(
      "Child.repeat: item 1 has no key (key function)."
    );
  });

  test("throw if duplicated after an update", () => {
    const component = testMount(KeyFunction, [{ i: 1 }, { i: 2 }]);
    component.model.push({ i: 2 });
    expect(() => component.update()).toThrow('Child.repeat: duplicate key 2 (key="i").');
  });
});

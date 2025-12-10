import { testMount } from "../utils";

describe("Repeat", () => {
  test("renders elements in correct order", () => {
    const items = [{ name: "Octopus" }, { name: "Seahorse" }, { name: "Squid" }];
    const Child = animal => <div>{animal.name}</div>;
    const Parent = () => (
      <div>
        <Child.repeat items={items} />
      </div>
    );
    const component = testMount(Parent);
    expect(component).toRender(
      `<div>
        <div>Octopus</div>
        <div>Seahorse</div>
        <div>Squid</div>
      </div>
    `
    );

    items.reverse();
    component.update();
    expect(component).toRender(
      `<div>
        <div>Squid</div>
        <div>Seahorse</div>
        <div>Octopus</div>
      </div>
    `
    );
  });
});

describe("Repeat compiles with error when", () => {
  test("element is not a nested component", () => {
    const code = `
      const Parent = () => (
        <div>
          <div.repeat items={items} />
        </div>
      );
    `;
    expect(code).toCompileWithError("Nested component must be capitalized.");
  });

  test("element has no parent node", () => {
    const code = `
      const Parent = () => (
        <Child.repeat items={items} />
      );
    `;
    expect(code).toCompileWithError("Repeated component not allowed on root element.");
  });

  test("element has siblings", () => {
    const code = `
      const Parent = () => (
        <div>
          <div>signling</div>
          <Child.repeat items={items} />
        </div>
      );
    `;
    expect(code).toCompileWithError(
      "Repeat may only be used when the parent node has no other children."
    );
  });

  // We already catch an error for the nested component having child nodes.
  test("Repeat with child nodes", () => {
    const code = `
      const Parent = () => (
        <div>
          <Child.repeat items={items} >
            <div>other stuff</div>
          </Child.repeat>
        </div>
      );
    `;
    expect(code).toCompileWithError("Nested component may not have child nodes.");
  });
});

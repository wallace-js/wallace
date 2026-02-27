import { testMount } from "../utils";

describe("Repeat", () => {
  test("renders elements in correct order", () => {
    const items = [{ name: "Octopus" }, { name: "Seahorse" }, { name: "Squid" }];
    const Child = animal => <div>{animal.name}</div>;
    const Parent = () => (
      <div>
        <Child.repeat props={items} />
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

  test("Cannot repeat normal elements", () => {
    const code = `
      const Parent = () => (
        <div>
          <div.repeat items={items} />
        </div>
      );
    `;
    expect(code).toCompileWithError(`Invalid tag format, must be one of:`);
  });

  test("Can repeat without props", () => {
    const Child = () => <div>Hello</div>;
    const Parent = () => (
      <div>
        <Child.repeat props={Array(3)} />
      </div>
    );
    const component = testMount(Parent);
    expect(component).toRender(
      `<div>
        <div>Hello</div>
        <div>Hello</div>
        <div>Hello</div>
      </div>
    `
    );
  });
});

describe("Repeat compiles with error when", () => {
  test("repeat on root element", () => {
    const code = `
      const Parent = () => (
        <Child.repeat props={items} />
      );
    `;
    expect(code).toCompileWithError("Nested components not allowed as root element.");
  });

  test("Disallow regular attributes", () => {
    const code = `
    const Parent = () => (
      <div>
        <Child.repeat props={items} id="foo" />
      </div>
    );
  `;
    expect(code).toCompileWithError("Nested components do not allow regular attributes.");
  });

  if (wallaceConfig.flags.allowRepeaterSiblings) {
    test("element has siblings", () => {
      const code = `
      const Parent = () => (
        <div>
          <div>signling</div>
          <Child.repeat props={items} />
        </div>
      );
    `;
      expect(code).toCompileWithoutError();
    });
  } else {
    test("element may not have siblings", () => {
      const code = `
      const Parent = () => (
        <div>
          <div>signling</div>
          <Child.repeat props={items} />
        </div>
      );
    `;
      expect(code).toCompileWithError(
        "Repeat may not have sibling elements if `allowRepeaterSiblings` flag is false."
      );
    });
  }

  // We already catch an error for the nested component having child nodes.
  test("Repeat with child nodes", () => {
    const code = `
      const Parent = () => (
        <div>
          <Child.repeat props={items} >
            <div>other stuff</div>
          </Child.repeat>
        </div>
      );
    `;
    expect(code).toCompileWithError("Nested components may not have child nodes.");
  });
});

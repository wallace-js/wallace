import { testMount } from "../utils";

test("Placeholders among text render as span elements", () => {
  const name = "Aardvark";
  const MyComponent = () => <div>Hello {name}!</div>;
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div>
      Hello <span>Aardvark</span>!
    </div>
  `);
});

test("Placeholder referencing variable works", () => {
  let name = "Tiger";
  const MyComponent = () => <div>Hello {name}!</div>;
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div>
      Hello <span>Tiger</span>!
    </div>
  `);
  name = "Lion";
  component.update();
  expect(component).toRender(`
    <div>
      Hello <span>Lion</span>!
    </div>
  `);
});

test("Placeholders with function call works", () => {
  const getName = () => "Tiger";
  const MyComponent = () => <div>Hello {getName()}!</div>;
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div>
      Hello <span>Tiger</span>!
    </div>
  `);
});

test("Multiple placeholders in children", () => {
  const [a, b, c] = ["small", "medium", "large"];
  const MyComponent = () => (
    <div>
      <span class={a}>A</span>
      <span class={b}>B</span>
      <span class={c}>C</span>
    </div>
  );
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div>
      <span class="small">A</span>
      <span class="medium">B</span>
      <span class="large">C</span>
    </div>
  `);
});

test("Multiple placeholders in same text block", () => {
  const name = "goat";
  const MyComponent = () => (
    <div>
      A {name} is a {name}.
    </div>
  );
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div>
      A <span>goat</span> is a <span>goat</span>.
    </div>
  `);
});

test("Placeholders without siblings don't get a span", () => {
  const name = "Aardvark";
  const MyComponent = () => <div>{name}</div>;
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div>
      Aardvark
    </div>
  `);
});

test("Placeholders in nested attribute works", () => {
  // Need to check with nested attributes as there was a bug whereby attributes
  // were being linked to the root node.
  const css = {
    danger: "danger",
    bold: "bold",
  };
  const MyComponent = () => (
    <div class={css.danger}>
      Hello <span class={css.bold}>Walrus</span>
    </div>
  );
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div class="danger">
      Hello <span class="bold">Walrus</span>
    </div>
  `);
});

test("Placeholders with undefined variable results in empty span", () => {
  const MyComponent = () => <div>Hello {name}!</div>;
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div>
      Hello <span></span>!
    </div>
  `);
});

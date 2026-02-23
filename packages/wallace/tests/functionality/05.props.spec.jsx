import { testMount } from "../utils";

test("Named props works", () => {
  const MyComponent = animal => <div>Hello {animal.name}</div>;
  const component = testMount(MyComponent, { name: "walrus" });
  expect(component).toRender(`<div>Hello <span>walrus</span></div>`);
});

test("Deconstructed props works", () => {
  const MyComponent = ({ name }) => <div>Hello {name}</div>;
  const component = testMount(MyComponent, { name: "walrus" });
  expect(component).toRender(`<div>Hello <span>walrus</span></div>`);
});

// TODO: what about further destructured props?

test("Cannot set props and items", () => {
  const code = `
      const Foo = () => (
        <div>
          <Bar items={[1, 2, 3]} props={foo} />
        </div>
      );
    `;
  expect(code).toCompileWithError(
    "The `props` directive may not be used on repeated elements."
  );
});

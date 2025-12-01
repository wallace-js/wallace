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

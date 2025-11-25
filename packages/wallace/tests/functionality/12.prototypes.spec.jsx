import { testMount } from "../utils";
import { extendComponent } from "wallace";

const BaseComponent = ({}, { self }) => <div>hello {self.getName()}</div>;
BaseComponent.prototype.getName = () => "mouse";

test("Can acccess prototype method", () => {
  const component = testMount(BaseComponent);
  expect(component).toRender(`<div>hello <span>mouse</span></div>`);
});

describe("Component extended with extendComponent", () => {
  test("Can access method on parent", () => {
    const SubComponent = extendComponent(BaseComponent);
    const component = testMount(SubComponent);
    expect(component).toRender(`<div>hello <span>mouse</span></div>`);
  });

  test("Can override method on parent", () => {
    const SubComponent = extendComponent(BaseComponent);
    SubComponent.prototype.getName = () => "cat";
    const component = testMount(SubComponent);
    expect(component).toRender(`<div>hello <span>cat</span></div>`);
  });
});

describe("Component extended with directive", () => {
  test("Can access method on parent", () => {
    const SubComponent = ({}, { self }) => (
      <div base={BaseComponent}>goodbye {self.getName()}</div>
    );
    const component = testMount(SubComponent);
    expect(component).toRender(`<div>goodbye <span>mouse</span></div>`);
  });

  test("Can override method on parent", () => {
    const SubComponent = ({}, { self }) => (
      <div base={BaseComponent}>goodbye {self.getName()}</div>
    );
    SubComponent.prototype.getName = () => "owl";
    const component = testMount(SubComponent);
    expect(component).toRender(`<div>goodbye <span>owl</span></div>`);
  });
});

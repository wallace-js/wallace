import { testMount } from "../utils";
import { extendComponent } from "wallace";

describe("Defining stubs", () => {
  test("is not allowed on root ", () => {
    const code = `
    const Foo = () => (
      <stub:display />
      );
      `;
    expect(code).toCompileWithError("Cannot make the root element a stub.");
  });
});

test("Can define stub and implement it on same component", () => {
  const Foo = ({}) => (
    <div>
      hello
      <stub:display />
    </div>
  );
  Foo.stubs.display = ({ name }) => <span>{name}</span>;
  const component = testMount(Foo, { name: "swan" });
  expect(component).toRender(`<div>hello <span>swan</span></div>`);
});

test("Can define stub and only implement it on child", () => {
  const BaseComponent = () => (
    <div>
      hello
      <stub:display />
    </div>
  );
  const Child = extendComponent(BaseComponent);
  Child.stubs.display = ({ name }) => <span>{name}</span>;
  const component = testMount(Child, { name: "beaver" });
  expect(component).toRender(`<div>hello <span>beaver</span></div>`);
});

test("Can define stub and not implement it on child", () => {
  const BaseComponent = () => (
    <div>
      hello
      <stub:display />
    </div>
  );
  BaseComponent.stubs.display = ({ name }) => <span>{name}</span>;
  const Child = extendComponent(BaseComponent);
  const component = testMount(Child, { name: "beaver" });
  expect(component).toRender(`<div>hello <span>beaver</span></div>`);
});

test("Child can use stub implementations from parent", () => {
  const BaseComponent = () => <div></div>;
  BaseComponent.stubs.display = ({ name }) => <span>{name}</span>;

  const Child = extendComponent(BaseComponent, () => (
    <div>
      goodbye
      <stub:display />
    </div>
  ));

  const component = testMount(Child, { name: "goat" });
  expect(component).toRender(`<div>goodbye <span>goat</span></div>`);
});

test("Stubs is sepearate object from parent", () => {
  const BaseComponent = () => (
    <div>
      <stub:display />
    </div>
  );
  BaseComponent.stubs.display = ({ name }) => <h3>Parent {name}</h3>;

  const Child = extendComponent(BaseComponent);
  Child.stubs.display = ({ name }) => <span>Child{name}</span>;
  const component = testMount(BaseComponent, { name: "beaver" });
  expect(component).toRender(`<div><h3>Parent <span>beaver</span></h3></div>`);
});

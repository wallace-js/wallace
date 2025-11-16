import { testMount } from "../utils";
import { extendPrototype } from "wallace";

test("Can define stub and implement it on same component", () => {
  const BaseComponent = ({}, _component) => (
    <div>
      hello
      <stub:display />
    </div>
  );
  BaseComponent.prototype.display = ({ name }) => <span>{name}</span>;
  const component = testMount(BaseComponent, { name: "swan" });
  expect(component).toRender(`<div>hello <span>swan</span></div>`);
});

test("Can define stub and only implement it on sub component", () => {
  const BaseComponent = () => (
    <div>
      hello
      <stub:display />
    </div>
  );
  const SubComponent = extendPrototype(BaseComponent);
  SubComponent.prototype.display = ({ name }) => <span>{name}</span>;
  const component = testMount(SubComponent, { name: "beaver" });
  expect(component).toRender(`<div>hello <span>beaver</span></div>`);
});

test("Can inherit stubs from base", () => {
  const BaseComponent = () => <div></div>;
  BaseComponent.prototype.display = ({ name }) => <span>{name}</span>;

  const SubComponent = () => (
    <div base={BaseComponent}>
      goodbye
      <stub:display />
    </div>
  );

  const component = testMount(SubComponent, { name: "goat" });
  expect(component).toRender(`<div>goodbye <span>goat</span></div>`);
});

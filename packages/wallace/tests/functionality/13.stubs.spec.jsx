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

  test("is allowed on prototype", () => {
    const Foo = ({}) => (
      <div>
        hello
        <stub:display />
      </div>
    );
    Foo.prototype.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Foo, { name: "beaver" });
    expect(component).toRender(`<div>hello <span>beaver</span></div>`);
  });

  test("is allowed on object", () => {
    const Foo = ({}) => (
      <div>
        hello
        <stub:display />
      </div>
    );
    Foo.methods({
      display: ({ name }) => <span>{name}</span>,
    });
    const component = testMount(Foo, { name: "beaver" });
    expect(component).toRender(`<div>hello <span>beaver</span></div>`);
  });

  test("is allowed in methods()", () => {
    const Foo = ({}) => (
      <div>
        hello
        <stub:display />
      </div>
    );
    Foo.methods({
      display({ name }) {
        return <span>{name}</span>;
      },
    });
    const component = testMount(Foo, { name: "beaver" });
    expect(component).toRender(`<div>hello <span>beaver</span></div>`);
  });
});

test("Can define stub and implement it on same component", () => {
  const Foo = ({}) => (
    <div>
      hello
      <stub:display />
    </div>
  );
  Foo.methods({
    display({ name }) {
      return <span>{name}</span>;
    },
  });
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
  Child.prototype.display = ({ name }) => <span>{name}</span>;
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
  BaseComponent.prototype.display = ({ name }) => <span>{name}</span>;
  const Child = extendComponent(BaseComponent);
  const component = testMount(Child, { name: "beaver" });
  expect(component).toRender(`<div>hello <span>beaver</span></div>`);
});

test("Child can use stub implementations from parent", () => {
  const BaseComponent = () => <div></div>;
  BaseComponent.prototype.display = ({ name }) => <span>{name}</span>;

  const Child = extendComponent(BaseComponent, () => (
    <div>
      goodbye
      <stub:display />
    </div>
  ));

  const component = testMount(Child, { name: "goat" });
  expect(component).toRender(`<div>goodbye <span>goat</span></div>`);
});

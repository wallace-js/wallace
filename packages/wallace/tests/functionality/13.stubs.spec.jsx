import { testMount } from "../utils";
import { extendComponent } from "wallace";

if (wallaceConfig.flags.allowStubs) {
  describe("Defining stubs", () => {
    test("is not allowed on root ", () => {
      const code = `
        const Foo = () => (
          <stub.display />
        );
        `;
      expect(code).toCompileWithError("Nested components not allowed as root element.");
    });
  });

  test("Can define stub and implement it on same component", () => {
    const Foo = ({}, { model }) => (
      <div>
        hello
        <stub.display model={model} />
      </div>
    );
    Foo.stub.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Foo, { name: "swan" });
    expect(component).toRender(`<div>hello <span>swan</span></div>`);
  });

  test("Can define stub and only implement it on child", () => {
    const BaseComponent = (_, { model }) => (
      <div>
        hello
        <stub.display model={model} />
      </div>
    );
    const Child = extendComponent(BaseComponent);
    Child.stub.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Child, { name: "beaver" });
    expect(component).toRender(`<div>hello <span>beaver</span></div>`);
  });

  test("Can define stub and not implement it on child", () => {
    const BaseComponent = (_, { model }) => (
      <div>
        hello
        <stub.display model={model} />
      </div>
    );
    BaseComponent.stub.display = ({ name }) => <span>{name}</span>;
    const Child = extendComponent(BaseComponent);
    const component = testMount(Child, { name: "beaver" });
    expect(component).toRender(`<div>hello <span>beaver</span></div>`);
  });

  test("Child can use stub implementations from parent", () => {
    const BaseComponent = () => <div></div>;
    BaseComponent.stub.display = ({ name }) => <span>{name}</span>;

    const Child = extendComponent(BaseComponent, (_, { model }) => (
      <div>
        goodbye
        <stub.display model={model} />
      </div>
    ));

    const component = testMount(Child, { name: "goat" });
    expect(component).toRender(`<div>goodbye <span>goat</span></div>`);
  });

  test("Stubs is sepearate object from parent", () => {
    const BaseComponent = (_, { model }) => (
      <div>
        <stub.display model={model} />
      </div>
    );
    BaseComponent.stub.display = ({ name }) => <h3>Parent {name}</h3>;

    const Child = extendComponent(BaseComponent);
    Child.stub.display = ({ name }) => <span>Child{name}</span>;
    const component = testMount(BaseComponent, { name: "beaver" });
    expect(component).toRender(`<div><h3>Parent <span>beaver</span></h3></div>`);
  });

  test("Can specify model", () => {
    const myModel = { name: "Fox" };
    const BaseComponent = () => (
      <div>
        hello
        <stub.display model={myModel} />
      </div>
    );
    const Child = extendComponent(BaseComponent);
    Child.stub.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Child);
    expect(component).toRender(`<div>hello <span>Fox</span></div>`);
  });

  if (wallaceConfig.flags.allowHubs) {
    test("Can specify hub", () => {
      const myHub = { name: "Fox" };
      const BaseComponent = () => (
        <div>
          hello
          <stub.display hub={myHub} />
        </div>
      );
      const Child = extendComponent(BaseComponent);
      Child.stub.display = (_, { hub }) => <span>{hub.name}</span>;
      const component = testMount(Child);
      expect(component).toRender(`<div>hello <span>Fox</span></div>`);
    });
  }

  // keyed mode is tested along with repeater keyed tests.
  test("Can repeat", () => {
    const myModel = [{ name: "Fox" }, { name: "Badger" }];
    const BaseComponent = () => (
      <div>
        <stub.display.repeat model={myModel} />
      </div>
    );
    const Child = extendComponent(BaseComponent);
    Child.stub.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Child);
    expect(component).toRender(`
      <div>
        <span>Fox</span>
        <span>Badger</span>
      </div>
    `);
  });
} else {
  test("is not allowed without flag", () => {
    const code = `
    const Foo = () => (
      <div>
        <stub.display />
      </div>
      );
      `;
    expect(code).toCompileWithError(
      "Flag `allowStubs` must be set to true in the config for this feature."
    );
  });
}

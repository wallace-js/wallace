import { testMount } from "../utils";
import { extendComponent } from "wallace";

if (wallaceConfig.flags.allowStubs) {
  describe("Defining stubs", () => {
    test("is not allowed on root ", () => {
      const code = `
        const Foo = () => (
          <stub:display />
        );
        `;
      expect(code).toCompileWithError("Nested components not allowed as root element.");
    });
  });

  test("Can define stub and implement it on same component", () => {
    const Foo = ({}, { props }) => (
      <div>
        hello
        <stub:display props={props} />
      </div>
    );
    Foo.stubs.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Foo, { name: "swan" });
    expect(component).toRender(`<div>hello <span>swan</span></div>`);
  });

  test("Can define stub and only implement it on child", () => {
    const BaseComponent = (_, { props }) => (
      <div>
        hello
        <stub:display props={props} />
      </div>
    );
    const Child = extendComponent(BaseComponent);
    Child.stubs.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Child, { name: "beaver" });
    expect(component).toRender(`<div>hello <span>beaver</span></div>`);
  });

  test("Can define stub and not implement it on child", () => {
    const BaseComponent = (_, { props }) => (
      <div>
        hello
        <stub:display props={props} />
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

    const Child = extendComponent(BaseComponent, (_, { props }) => (
      <div>
        goodbye
        <stub:display props={props} />
      </div>
    ));

    const component = testMount(Child, { name: "goat" });
    expect(component).toRender(`<div>goodbye <span>goat</span></div>`);
  });

  test("Stubs is sepearate object from parent", () => {
    const BaseComponent = (_, { props }) => (
      <div>
        <stub:display props={props} />
      </div>
    );
    BaseComponent.stubs.display = ({ name }) => <h3>Parent {name}</h3>;

    const Child = extendComponent(BaseComponent);
    Child.stubs.display = ({ name }) => <span>Child{name}</span>;
    const component = testMount(BaseComponent, { name: "beaver" });
    expect(component).toRender(`<div><h3>Parent <span>beaver</span></h3></div>`);
  });

  test("Can specify props", () => {
    const myProps = { name: "Fox" };
    const BaseComponent = () => (
      <div>
        hello
        <stub:display props={myProps} />
      </div>
    );
    const Child = extendComponent(BaseComponent);
    Child.stubs.display = ({ name }) => <span>{name}</span>;
    const component = testMount(Child);
    expect(component).toRender(`<div>hello <span>Fox</span></div>`);
  });

  if (wallaceConfig.flags.allowControllers) {
    test("Can specify ctrl", () => {
      const myCtrl = { name: "Fox" };
      const BaseComponent = () => (
        <div>
          hello
          <stub:display ctrl={myCtrl} />
        </div>
      );
      const Child = extendComponent(BaseComponent);
      Child.stubs.display = (_, { ctrl }) => <span>{ctrl.name}</span>;
      const component = testMount(Child);
      expect(component).toRender(`<div>hello <span>Fox</span></div>`);
    });
  }
} else {
  test("is not allowed without flag", () => {
    const code = `
    const Foo = () => (
      <div>
        <stub:display />
      </div>
      );
      `;
    expect(code).toCompileWithError(
      'Flag "allowStubs" must be set to true in the config for this feature.'
    );
  });
}

import { testMount } from "../utils";

describe("Model", () => {
  test("allows no model if none specified", () => {
    expect(`
    import { mount, Uses } from "wallace";

    const Foo: Uses = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo />
      </div>
    );
  `).toHaveNoTypeErrors();
  });

  // TODO: make this work.

  // test("disallows model if none specified", () => {
  //   expect(`
  //     import { mount, Uses } from "wallace";

  //     const Foo: Uses = () => (<div></div>);

  //     const Bar: Uses = () => (
  //       <div>
  //         <Foo model={4} />
  //       </div>
  //     );
  //   `).toHaveTypeErrors([]);
  // });

  test("diallows no model if model are specified", () => {
    expect(`
    import { mount, Uses } from "wallace";

    interface Model {
      clicks: number;
    }

    const Foo: Uses<Model> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo />
      </div>
    );
  `).toHaveTypeErrors([
      "Type '{}' is not assignable to type 'IntrinsicAttributes & Wrapper<Model>'."
    ]);
  });

  test("diallows invalid model if they are specified", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface Model {
        clicks: number;
      }

      const Foo: Uses<Model> = () => (<div></div>);

      const Bar: Uses = () => (
        <div>
          <Foo model={5} />
        </div>
      );
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'Model'."]);
  });
});

describe("Other directives", () => {
  test("allows if directive as boolean", () => {
    expect(`
    import { mount, Uses } from "wallace";

    const Foo: Uses = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo if={true} />
      </div>
    );
  `).toHaveNoTypeErrors();
  });

  test("allows part directive as string", () => {
    expect(`
    import { mount, Uses } from "wallace";

    interface Model {
      clicks: number;
    }

    const Foo: Uses<Model> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo model={{clicks: 5}} part="foo"/>
      </div>
    );
    const bar = mount("main", Bar);
    bar.part.foo.update();
  `).toHaveNoTypeErrors();
  });

  test.each(["key", "id", "show", "hide"])("disallows %s directive", directive => {
    expect(`
    import { mount, Uses } from "wallace";

    interface Model {
      clicks: number;
    }

    const Foo: Uses<Model> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo model={{ clicks: 1 }} ${directive}="clicks" />
      </div>
    );
  `).toHaveTypeErrors([
      `
    Type '{ model: { clicks: number; }; ${directive}: string; }' is not assignable to
    type 'IntrinsicAttributes & Wrapper<Model>'. Property '${directive}' does not exist
    on type 'IntrinsicAttributes & Wrapper<Model>'.
    `
    ]);
  });
});

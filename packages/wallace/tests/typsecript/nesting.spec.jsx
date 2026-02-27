import { testMount } from "../utils";

describe("Props", () => {
  test("allows no props if none specified", () => {
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

  // test("disallows props if none specified", () => {
  //   expect(`
  //     import { mount, Uses } from "wallace";

  //     const Foo: Uses = () => (<div></div>);

  //     const Bar: Uses = () => (
  //       <div>
  //         <Foo props={4} />
  //       </div>
  //     );
  //   `).toHaveTypeErrors([]);
  // });

  test("diallows no props if props are specified", () => {
    expect(`
    import { mount, Uses } from "wallace";

    interface Props {
      clicks: number;
    }

    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo />
      </div>
    );
  `).toHaveTypeErrors([
      "Type '{}' is not assignable to type 'IntrinsicAttributes & Wrapper<Props>'."
    ]);
  });

  test("diallows invalid props if they are specified", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface Props {
        clicks: number;
      }

      const Foo: Uses<Props> = () => (<div></div>);

      const Bar: Uses = () => (
        <div>
          <Foo props={5} />
        </div>
      );
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'Props'."]);
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

    interface Props {
      clicks: number;
    }

    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo props={{clicks: 5}} part="foo"/>
      </div>
    );
    const bar = mount("main", Bar);
    bar.part.foo.update();
  `).toHaveNoTypeErrors();
  });

  test.each(["key", "id", "show", "hide"])("disallows %s directive", directive => {
    expect(`
    import { mount, Uses } from "wallace";

    interface Props {
      clicks: number;
    }

    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo props={{ clicks: 1 }} ${directive}="clicks" />
      </div>
    );
  `).toHaveTypeErrors([
      `
    Type '{ props: { clicks: number; }; ${directive}: string; }' is not assignable to
    type 'IntrinsicAttributes & Wrapper<Props>'. Property '${directive}' does not exist
    on type 'IntrinsicAttributes & Wrapper<Props>'.
    `
    ]);
  });
});

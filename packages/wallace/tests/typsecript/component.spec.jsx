import { testMount } from "../utils";
/*

  component definition
      (for each, check that it exists on component, via mount)
      can specify no props
      can specify null props
      can specify ctrl
      can specify methods

*/

describe("Component definition with Uses", () => {
  test("can specify no props", () => {
    expect(`
      import { mount, Uses } from "wallace";

      const Foo: Uses = () => (<div></div>);
      const foo = mount("main", Foo);
    `).toHaveNoTypeErrors();
  });

  test("can specify props", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface FooProps {
        clicks: number;
      }

      const Foo: Uses<FooProps> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.props.clicks = 1;
      foo.props.clicks = 'a';
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("can specify controller", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface Controller {
        things: number;
      }

      const Foo: Uses<null, Controller> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.ctrl.things = 1;
      foo.ctrl.things = 'a';
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("can specify props and controller", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface FooProps {
        clicks: number;
      }

      interface Controller {
        things: number;
      }

      const Foo: Uses<FooProps, Controller> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.ctrl.things = 1;
      foo.props.clicks = 1;
      foo.props.clicks = 'a';
      foo.ctrl.things = 'a';
    `).toHaveTypeErrors([
      "Type 'string' is not assignable to type 'number'.",
      "Type 'string' is not assignable to type 'number'."
    ]);
  });
});

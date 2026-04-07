import { testMount } from "../utils";

describe("Component definition with Uses", () => {
  test("can specify no model", () => {
    expect(`
      import { mount, Uses } from "wallace";

      const Foo: Uses = () => (<div></div>);
      const foo = mount("main", Foo);
    `).toHaveNoTypeErrors();
  });

  test("can specify model", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface FooModel {
        clicks: number;
      }

      const Foo: Uses<FooModel> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.model.clicks = 1;
      foo.model.clicks = 'a';
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("can specify hub", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface Hub {
        things: number;
      }

      const Foo: Uses<{hub: Hub}> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.hub.things = 1;
      foo.hub.things = 'a';
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("can specify model and hub", () => {
    expect(`
      import { mount, Uses } from "wallace";

      interface FooModel {
        clicks: number;
      }

      interface Hub {
        things: number;
      }

      const Foo: Uses<{model: FooModel, hub: Hub}> = () => (<div></div>);
      const foo = mount("main", Foo);
      foo.hub.things = 1;
      foo.model.clicks = 1;
      foo.model.clicks = 'a';
      foo.hub.things = 'a';
    `).toHaveTypeErrors([
      "Type 'string' is not assignable to type 'number'.",
      "Type 'string' is not assignable to type 'number'."
    ]);
  });
});

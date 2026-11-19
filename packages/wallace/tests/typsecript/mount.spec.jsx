import "../utils";

describe("Mounting", () => {
  test("accepts a model which is also the hub", () => {
    expect(`
      import { mount, Takes } from "wallace";

      class Controller {
        mode: string = "view";
      }

      const Page: Takes<Controller, Controller> = (ctrl) => <ul></ul>;
      mount("main", Page, new Controller());
      mount("main", Page, new Controller(), new Controller());
    `).toHaveNoTypeErrors();
  });

  test("accepts a model when the hub is not typed", () => {
    expect(`
      import { mount, Takes } from "wallace";

      const Foo: Takes<{ clicks: number }> = () => <div></div>;
      mount("main", Foo, { clicks: 1 });
    `).toHaveNoTypeErrors();
  });

  test("checks the model when the hub is any", () => {
    expect(`
      import { mount, ComponentFunction } from "wallace";

      const Foo: ComponentFunction<{ clicks: number }, any> = () => <div></div>;
      mount("main", Foo, { clicks: 1 });
      mount("main", Foo, { clicks: 'a' });
    `).toHaveTypeErrors(["Type 'string' is not assignable to type 'number'."]);
  });

  test("rejects a model which is not the hub if hub is omitted", () => {
    expect(`
      import { mount, Takes } from "wallace";

      class Controller {
        mode: string = "view";
      }

      const Page: Takes<string[], Controller> = () => <div></div>;
      mount("main", Page, ["a"], new Controller());
      mount("main", Page, ["a"]);
    `).toHaveTypeErrors([
      "Argument of type 'string[]' is not assignable to parameter of type 'string[] & Controller'. Property 'mode' is missing in type 'string[]' but required in type 'Controller'."
    ]);
  });

  test("checks the hub when passed explicitly", () => {
    expect(`
      import { mount, Takes } from "wallace";

      class Controller {
        mode: string = "view";
      }

      const Page: Takes<null, Controller> = () => <div></div>;
      mount("main", Page, null, new Controller());
      mount("main", Page, null, { mode: 1 });
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'string'."]);
  });
});

import { testMount } from "../utils";

describe("Model", () => {
  test("force model to be specified", () => {
    expect(`
    import { mount, Takes } from "wallace";
    interface Model {
      clicks: number;
    }
    const Foo: Takes<Model> = () => (<div></div>);

    const Bar: Takes = () => (
      <div>
        <Foo.repeat />
      </div>
    );
  `).toHaveTypeErrors([
      `Type '{}' is not assignable to type 'IntrinsicAttributes & Wrapper<{ model:
      Model[]; hub?: any; part?: string; key?: "clicks" | ((item: Model) => any); }>'.`
    ]);
  });

  test("disallows invalid model", () => {
    expect(`
      import { mount, Takes } from "wallace"
      interface Model {
        clicks: number;
      }
      const Foo: Takes<Model> = () => (<div></div>);

      const Bar: Takes = () => (
        <div>
          <Foo.repeat models={[1]}/>
        </div>
      );
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'Model'."]);
  });

  test("allows valid model", () => {
    expect(`
      import { mount, Takes } from "wallace";
      interface Model {
        clicks: number;
      }
      const Foo: Takes<Model> = () => (<div></div>);

      const Bar: Takes = () => (
        <div>
          <Foo.repeat models={[{clicks: 1}]}/>
        </div>
      );
    `).toHaveNoTypeErrors();
  });

  test("model are passed through correctly", () => {
    expect(`
      import { mount, Takes } from "wallace";
      interface Model {
        clicks: number;
      }
      const Foo: Takes<Model> = () => (<div></div>);

      const Bar: Takes<Model[]> = (items) => (
        <div>
          <Foo.repeat models={items}/>
        </div>
      );
    `).toHaveNoTypeErrors();
  });

  test("Can repeat without model", () => {
    expect(`
      import { mount, Takes } from "wallace";
      const Child: Takes = () => <div>Hello</div>;
      const Parent: Takes = () => (
        <div>
          <Child.repeat models={Array(3)} />
        </div>
      );
    `).toHaveNoTypeErrors();
  });
});

describe("key directive", () => {
  test("allows valid key value", () => {
    expect(`
    import { mount, Takes } from "wallace";
    interface Model {
      clicks: number;
    }
    const Foo: Takes<Model> = () => (<div></div>);

    const Bar: Takes = () => (
      <div>
        <Foo.repeat models={[{clicks: 1}]} key="clicks"/>
      </div>
    );
  `).toHaveNoTypeErrors();
  });

  test("disallows invalid key value", () => {
    expect(`
    import { mount, Takes } from "wallace";
    interface Model {
      clicks: number;
    }
    const Foo: Takes<Model> = () => (<div></div>);

    const Bar: Takes = () => (
      <div>
        <Foo.repeat models={[{clicks: 1}]} key="x" />
      </div>
    );
  `).toHaveTypeErrors([
      `Type '"x"' is not assignable to type '"clicks" | ((item: Model) => any)'.`
    ]);
  });
});

describe("Other directives", () => {
  test("allows part directive as string", () => {
    expect(`
    import { mount, Takes } from "wallace";
    interface Model {
      clicks: number;
    }
    const Foo: Takes<Model> = () => (<div></div>);

    const Bar: Takes = () => (
      <div>
        <Foo.repeat part="foo" models={[{clicks: 1}]} />
      </div>
    );
    const bar = mount("main", Bar);
    bar.part.foo.update();
  `).toHaveNoTypeErrors();
  });

  test.each(["id", "show", "hide"])("disallows %s directive", directive => {
    expect(`
    import { mount, Takes } from "wallace";

    interface Model {
      clicks: number;
    }

    const Foo: Takes<Model> = () => (<div></div>);
    const clicks = true;
    const Bar: Takes = () => (
      <div>
        <Foo.repeat models={[{ clicks: 1 }]} ${directive}={clicks} />
      </div>
    );
  `).toHaveTypeErrors([
      `
    Type '{ model: { clicks: number; }[]; ${directive}: boolean; }' is not assignable to
    type 'IntrinsicAttributes & Wrapper<{ model: Model[]; hub?: any; part?: string;
    key?: "clicks" | ((item: Model) => any); }>'. Property '${directive}' does not exist
    on type 'IntrinsicAttributes & Wrapper<{ model: Model[]; hub?: any; part?: string;
    key?: "clicks" | ((item: Model) => any); }>'.
    `
    ]);
  });
});

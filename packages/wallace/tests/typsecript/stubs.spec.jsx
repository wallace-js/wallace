import { testMount } from "../utils";

describe("Definition", () => {
  test("diallows invalid key", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = (_, { stub }) => (
      <div>
        <stub.bar />
      </div>
    );
    `).toHaveTypeErrors([
      `Property 'bar' does not exist on type 'StubInterface<{ foo: 
      Takes<Model>; }>'.`
    ]);
  });

  test("key is recognised on component stub property", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = () => (
      <div>
      </div>
    );

    Bar.stub.foo = (model) => <div>Bar{model.clicks}</div>;
    Bar.stub.bar = (model) => <div>Bar{model.clicks}</div>;
    `).toHaveTypeErrors([
      `Property 'bar' does not exist on type '{ foo: Takes<Model>; }'.`
    ]);
  });

  test("model are recognised on component stub", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = () => (
      <div>
      </div>
    );

    Bar.stub.foo = (model) => <div>
      {model.clicks}
      {model.nope}
    </div>;
    `).toHaveTypeErrors([`Property 'nope' does not exist on type 'Model'.`]);
  });
});

describe("Model", () => {
  test("allows no model if none specified", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";

    const Bar: Uses<{stub: {foo: Takes}}> = (_, { stub }) => (
      <div>
        <stub.foo />
      </div>
    );
  `).toHaveNoTypeErrors();
  });

  test("diallows no model if model are specified", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = (_, { stub }) => (
      <div>
        <stub.foo />
      </div>
    );
  `).toHaveTypeErrors([
      "Type '{}' is not assignable to type 'IntrinsicAttributes & Wrapper<Model>'."
    ]);
  });

  test("diallows invalid model if they are specified", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = (_, { stub }) => (
      <div>
        <stub.foo model={5} />
      </div>
    );
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'Model'."]);
  });
});

describe("Other directives", () => {
  test("allows if directive as boolean", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = (_, { stub }) => (
      <div>
        <stub.foo model={{clicks: 5}} if={true} />
      </div>
    );
  `).toHaveNoTypeErrors();
  });

  test("allows part directive as string", () => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = (_, { stub }) => (
      <div>
        <stub.foo model={{clicks: 5}} part="p1" />
      </div>
    );
    const bar = mount("main", Bar);
    bar.part.p1.update();
  `).toHaveNoTypeErrors();
  });

  test.each(["key", "id", "show", "hide"])("disallows %s directive", directive => {
    expect(`
    import { mount, Takes, Uses } from "wallace";
    interface Model {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Takes<Model>}}> = (_, { stub }) => (
      <div>
        <stub.foo model={{ clicks: 1 }} ${directive}="clicks" />
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

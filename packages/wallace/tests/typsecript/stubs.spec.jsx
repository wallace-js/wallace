import { testMount } from "../utils";

describe("Definition", () => {
  test("diallows invalid key", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = (_, { stub }) => (
      <div>
        <stub.bar />
      </div>
    );
    `).toHaveTypeErrors([
      `Property 'bar' does not exist on type 'StubInterface<{ foo: 
      ComponentFunction<Props, any, {}, {}>; }>'.`
    ]);
  });

  test("key is recognised on component stub property", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = () => (
      <div>
      </div>
    );

    Bar.stub.foo = (props) => <div>Bar{props.clicks}</div>;
    Bar.stub.bar = (props) => <div>Bar{props.clicks}</div>;
    `).toHaveTypeErrors([
      `Property 'bar' does not exist on type '{ foo: 
      ComponentFunction<Props, any, {}, {}>; }'.`
    ]);
  });

  test("props are recognised on component stub", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = () => (
      <div>
      </div>
    );

    Bar.stub.foo = (props) => <div>
      {props.clicks}
      {props.nope}
    </div>;
    `).toHaveTypeErrors([`Property 'nope' does not exist on type 'Props'.`]);
  });
});

describe("Props", () => {
  test("allows no props if none specified", () => {
    expect(`
    import { mount, Uses } from "wallace";

    const Bar: Uses<{stub: {foo: Uses}}> = (_, { stub }) => (
      <div>
        <stub.foo />
      </div>
    );
  `).toHaveNoTypeErrors();
  });

  test("diallows no props if props are specified", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = (_, { stub }) => (
      <div>
        <stub.foo />
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

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = (_, { stub }) => (
      <div>
        <stub.foo props={5} />
      </div>
    );
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'Props'."]);
  });
});

describe("Other directives", () => {
  test("allows if directive as boolean", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = (_, { stub }) => (
      <div>
        <stub.foo props={{clicks: 5}} if={true} />
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

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = (_, { stub }) => (
      <div>
        <stub.foo props={{clicks: 5}} part="p1" />
      </div>
    );
    const bar = mount("main", Bar);
    bar.part.p1.update();
  `).toHaveNoTypeErrors();
  });

  test.each(["key", "id", "show", "hide"])("disallows %s directive", directive => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }

    const Bar: Uses<{stub: {foo: Uses<Props>}}> = (_, { stub }) => (
      <div>
        <stub.foo props={{ clicks: 1 }} ${directive}="clicks" />
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

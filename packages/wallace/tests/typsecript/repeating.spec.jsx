import { testMount } from "../utils";

describe("Props", () => {
  test("force props to be specified", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo.repeat />
      </div>
    );
  `).toHaveTypeErrors([
      `Type '{}' is not assignable to type 'IntrinsicAttributes & Wrapper<{ props:
      Props[]; ctrl?: any; part?: string; key?: "clicks" | ((item: Props) => any); }>'.`
    ]);
  });

  test("disallows invalid props", () => {
    expect(`
      import { mount, Uses } from "wallace"
      interface Props {
        clicks: number;
      }
      const Foo: Uses<Props> = () => (<div></div>);

      const Bar: Uses = () => (
        <div>
          <Foo.repeat props={[1]}/>
        </div>
      );
    `).toHaveTypeErrors(["Type 'number' is not assignable to type 'Props'."]);
  });

  test("allows valid props", () => {
    expect(`
      import { mount, Uses } from "wallace";
      interface Props {
        clicks: number;
      }
      const Foo: Uses<Props> = () => (<div></div>);

      const Bar: Uses = () => (
        <div>
          <Foo.repeat props={[{clicks: 1}]}/>
        </div>
      );
    `).toHaveNoTypeErrors();
  });

  test("props are passed through correctly", () => {
    expect(`
      import { mount, Uses } from "wallace";
      interface Props {
        clicks: number;
      }
      const Foo: Uses<Props> = () => (<div></div>);

      const Bar: Uses<Props[]> = (items) => (
        <div>
          <Foo.repeat props={items}/>
        </div>
      );
    `).toHaveNoTypeErrors();
  });

  test("Can repeat without props", () => {
    expect(`
      import { mount, Uses } from "wallace";
      const Child: Uses = () => <div>Hello</div>;
      const Parent: Uses = () => (
        <div>
          <Child.repeat props={Array(3)} />
        </div>
      );
    `).toHaveNoTypeErrors();
  });
});

describe("key directive", () => {
  test("allows valid key value", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo.repeat props={[{clicks: 1}]} key="clicks"/>
      </div>
    );
  `).toHaveNoTypeErrors();
  });

  test("disallows invalid key value", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo.repeat props={[{clicks: 1}]} key="x" />
      </div>
    );
  `).toHaveTypeErrors([
      `Type '"x"' is not assignable to type '"clicks" | ((item: Props) => any)'.`
    ]);
  });
});

describe("Other directives", () => {
  test("allows part directive as string", () => {
    expect(`
    import { mount, Uses } from "wallace";
    interface Props {
      clicks: number;
    }
    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo.repeat part="foo" props={[{clicks: 1}]} />
      </div>
    );
    const bar = mount("main", Bar);
    bar.part.foo.update();
  `).toHaveNoTypeErrors();
  });

  test.each(["id", "show", "hide"])("disallows %s directive", directive => {
    expect(`
    import { mount, Uses } from "wallace";

    interface Props {
      clicks: number;
    }

    const Foo: Uses<Props> = () => (<div></div>);
    const clicks = true;
    const Bar: Uses = () => (
      <div>
        <Foo.repeat props={[{ clicks: 1 }]} ${directive}={clicks} />
      </div>
    );
  `).toHaveTypeErrors([
      `
    Type '{ props: { clicks: number; }[]; ${directive}: boolean; }' is not assignable to
    type 'IntrinsicAttributes & Wrapper<{ props: Props[]; ctrl?: any; part?: string;
    key?: "clicks" | ((item: Props) => any); }>'. Property '${directive}' does not exist
    on type 'IntrinsicAttributes & Wrapper<{ props: Props[]; ctrl?: any; part?: string;
    key?: "clicks" | ((item: Props) => any); }>'.
    `
    ]);
  });
});

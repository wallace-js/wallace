import { testMount } from "../utils";

describe("Props", () => {
  // How should we repeat a compoennt which accepts no props?

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
      `Type '{}' is not assignable to type 'IntrinsicAttributes
       & { props: Props[]; ctrl?: any; part?: string; key?: "clicks"
      | ((item: Props) => any); }'. Property 'props' is missing in type
      '{}' but required in type '{ props: Props[]; ctrl?: any; part?: string; key?: 
      "clicks" | ((item: Props) => any); }'.`
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
  `).toHaveNoTypeErrors();
  });

  test.each(["id", "if", "show", "hide"])("disallows %s directive", directive => {
    expect(`
    import { mount, Uses } from "wallace";

    interface Props {
      clicks: number;
    }

    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses = () => (
      <div>
        <Foo.repeat props={[{ clicks: 1 }]} ${directive}="clicks" />
      </div>
    );
  `).toHaveTypeErrors([
      `
    Type '{ props: { clicks: number; }[]; ${directive}: string; }' is not assignable 
    to type 'IntrinsicAttributes & { props: Props[]; ctrl?: any; part?: string; key?:
    "clicks" | ((item: Props) => any); }'. Property '${directive}' does not exist on
    type 'IntrinsicAttributes & { props: Props[]; ctrl?: any; part?: string; key?:
    "clicks" | ((item: Props) => any); }'.
    `
    ]);
  });
});

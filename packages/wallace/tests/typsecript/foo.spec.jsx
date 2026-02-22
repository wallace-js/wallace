import { testMount } from "../utils";

test("foo", () => {
  expect(`
    const a = {};
    const d = a.foo;

  `).toHaveTypeErrors("Property 'foo' does not exist on type '{}'.");
});

test("bar", () => {
  expect(`
    import { mount, Uses } from "wallace";

    interface Props {
      clicks: number;
    }

    const FunctionWithoutProps: Uses<null> = () => (
      <div>
        <p>Whatever</p>
      </div>
    );

    const FunctionWithProps: Uses<Props> = ({ clicks }) => (
      <div>
        <p>Clicked {1 + clicks} times</p>
      </div>
    );

    mount("a", FunctionWithoutProps);
    mount("b", FunctionWithProps);
  `).toHaveNoTypeErrors();
});

/*
Nested component 
  can be empty
  accepts props
  accepts if
  accepts ctrl
  disallows regulage attributes
  disallows show
  disallows hide

Same for stubs and repeat

prototype
methods
stubs

helpers
*/
test("Ca", () => {
  expect(`
    import { Uses } from "wallace";

    interface Props {
      clicks: number;
    }

    const Foo: Uses<Props> = () => (<div></div>);

    const Bar: Uses<Props> = ({ clicks }) => (
      <div>
        <Foo props={{ clicks }} />
      </div>
    );
  `).toHaveNoTypeErrors();
});

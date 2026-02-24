import { testMount } from "../utils";
/*

allows valid props
disallows invalid props
disallows props if null
accepts if
accepts ctrl
disallows regulage attributes
disallows show
disallows hide

*/

test("allows no props if null", () => {
  expect(`
    import { mount, Uses } from "wallace";

    const Foo: Uses<null> = () => (<div></div>);

    const Bar: Uses<Props> = ({ clicks }) => (
      <div>
        <Foo />
      </div>
    );
  `).toHaveNoTypeErrors();
});

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

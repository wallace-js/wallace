import { testMount } from "../utils";

describe("Extra arguments", () => {
  test("are allowed if recognised", () => {
    const src = `
    const A = ({}, {self, ctrl, ev, el, element, event}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithoutError();
  });

  test("must be a destructured object", () => {
    const src = `
    const A = ({}, ctrl) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError("Extra args must be a destructured object.");
  });

  test("are not allowed if not recognised", () => {
    const src = `
    const A = ({}, {x}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError(
      'Illegal parameter in extra args: "x". You are only allowed "ctrl", "self", "event", "element", "ev", "el".'
    );
  });

  test("are not renamed if not in args", () => {
    const ctrl = 9;
    const Foo = ({}, { self }) => <div>Test {ctrl}</div>;

    const component = testMount(Foo);
    expect(component).toRender(`<div>Test <span>9</span></div>`);
  });
});

import { testMount } from "../utils";
import { watch } from "wallace";

const mimicValueChange = (input, value) => {
  input.value = value;
  input.dispatchEvent(new Event("change"));
};

describe("Bind specification", () => {
  test("allows expression", () => {
    const code = `
      const Foo = (user) => (
        <input bind={user.name} />
      )
    `;
    expect(code).toCompileWithoutError();
  });

  test("disallows null", () => {
    const code = `
      const Bar = () => (
        <input bind />
      )
    `;
    expect(code).toCompileWithError(
      'The "bind" directive value must be of type expression. Found: null.'
    );
  });

  test("disallows string", () => {
    const code = `
      const Bar = () => (
        <input bind="Foo" />
      )
    `;
    expect(code).toCompileWithError(
      'The "bind" directive value must be of type expression. Found: string.'
    );
  });

  test.each(["notavalidevent", "onClick", "KeyUp"])(
    "disallows invalid event name: %s",
    name => {
      const code = `
      const Bar = (user) => (
        <input bind:onClick={user.name} />
      )
    `;
      expect(code).toCompileWithError(
        '"onClick" is not a valid event name. Must be lowercase without "on" prefix. E.g. bind:keyup.'
      );
    }
  );

  test("allows valid event names", () => {
    const code = `
      const Bar = (user) => (
        <input bind:keyup={user.name} />
      )
    `;
    expect(code).toCompileWithoutError();
  });
});

test("Change event updates data", () => {
  const MyComponent = ({ text }) => <input ref:tbx type="text" bind={text} />;
  MyComponent.prototype.render = function (props) {
    this.props = watch(props, () => this.update());
    this.update();
  };
  const props = { text: "foo" };
  const component = testMount(MyComponent, props);
  const input = component.ref.tbx;
  expect(input.value).toBe("foo");

  mimicValueChange(input, "bar");

  expect(props.text).toBe("bar");
});

test("Value updates to match data", () => {
  const data = { text: "foo" };
  const MyComponent = (_, { self }) => (
    <div>
      <input ref:tbx type="text" bind={data.text} />
      <button ref:btn onClick={self.btnClick()}>
        Clear
      </button>
    </div>
  );
  MyComponent.methods = {
    btnClick() {
      data.text = "";
      this.update();
    }
  };
  const component = testMount(MyComponent);
  const input = component.ref.tbx;
  // previous value is "foo" as that was the first value.

  mimicValueChange(input, "bar");
  expect(data.text).toBe("bar");
  expect(input.value).toBe("bar");
  // previous value is still "foo" as there was no update.

  component.ref.btn.click();
  expect(data.text).toBe("");
  expect(input.value).toBe("");
  // previous value is now "" as that was stored in last update.

  mimicValueChange(input, "foo");
  expect(data.text).toBe("foo");
  expect(input.value).toBe("foo");
  // previous value is still "" as there was no update.

  // Clicking the button a second time fails if bind is not implemented as noLookup
  // because the previous value and new value are "", so the same, so the input element
  // is not updated, and its value therefore remains "foo", which is a really annoying
  // bug to track, so this test is absolutely vital.
  component.ref.btn.click();
  expect(data.text).toBe("");
  expect(input.value).toBe("");
});

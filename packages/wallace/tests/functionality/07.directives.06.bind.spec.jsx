import { testMount } from "../utils";
import { watch } from "wallace";

const mimicUserInput = (input, value, property = "value", event = "change") => {
  input[property] = value;
  input.dispatchEvent(new Event(event));
};

describe("Bind directive", () => {
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

  test("allows raw", () => {
    const code = `
      const Bar = (user) => (
        <input bind={user.name} />
      )
    `;
    expect(code).toCompileWithoutError();
  });

  test("allows alternative property", () => {
    const code = `
      const Bar = (user) => (
        <input bind:checked={user.name} />
      )
    `;
    expect(code).toCompileWithoutError();
  });
});

describe("Event specification", () => {
  test("not allowed without bind", () => {
    const code = `
      const Foo = (user) => (
        <input event:keyup />
      )
    `;
    expect(code).toCompileWithError(
      "The `event` directive must be used with the `bind` directive."
    );
  });

  // TODO: add more once we have fixed validation
  test("disallows expression", () => {
    const code = `
      const Foo = (user) => (
        <input event:keyup={user.name} />
      )
    `;
    expect(code).toCompileWithError(
      'The "event" directive value must be of type null. Found: expression.'
    );
  });

  test.each(["notavalidevent", "onClick", "KeyUp"])(
    "disallows invalid event name: %s",
    name => {
      const code = `
        const Bar = (user) => (
          <input bind={user.name} event:${name} />
        )
      `;
      expect(code).toCompileWithError(
        `"${name}" is not a valid event. Must be lowercase without "on" prefix. E.g. event:keyup.`
      );
    }
  );

  test("allows valid event name as qualifier", () => {
    const code = `
      const Bar = (user) => (
        <input bind={user.name} event:keyup />
      )
    `;
    expect(code).toCompileWithoutError();
  });

  // test("allows valid event name as string", () => {
  //   const code = `
  //     const Bar = (user) => (
  //       <input bind={user.name} event="keyup" />
  //     )
  //   `;
  //   expect(code).toCompileWithoutError();
  // });
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

  mimicUserInput(input, "bar");

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
  MyComponent.prototype.btnClick = function () {
    data.text = "";
    this.update();
  };
  const component = testMount(MyComponent);
  const input = component.ref.tbx;
  // previous value is "foo" as that was the first value.

  mimicUserInput(input, "bar");
  expect(data.text).toBe("bar");
  expect(input.value).toBe("bar");
  // previous value is still "foo" as there was no update.

  component.ref.btn.click();
  expect(data.text).toBe("");
  expect(input.value).toBe("");
  // previous value is now "" as that was stored in last update.

  mimicUserInput(input, "foo");
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

describe("Alternative event", () => {
  const MyComponent = ({ text }) => (
    <div>
      <input ref:tbx type="text" bind={text} event:keyup />;
    </div>
  );
  MyComponent.prototype.render = function (props) {
    this.props = watch(props, () => this.update());
    this.update();
  };

  test("Triggering event updates data", () => {
    const props = { text: "foo" };
    const component = testMount(MyComponent, props);
    const input = component.ref.tbx;
    expect(input.value).toBe("foo");

    mimicUserInput(input, "bar", "value", "keyup");

    expect(props.text).toBe("bar");
  });

  test("Triggering wrong event doesn't update data", () => {
    const props = { text: "foo" };
    const component = testMount(MyComponent, props);
    const input = component.ref.tbx;
    expect(input.value).toBe("foo");

    mimicUserInput(input, "bar", "value", "change");

    expect(props.text).toBe("foo");
  });
});

describe("Alternative property", () => {
  const MyComponent = ({ age }) => (
    <div>
      <input ref:tbx type="number" bind:valueAsNumber={age} />;
    </div>
  );
  MyComponent.prototype.render = function (props) {
    this.props = watch(props, () => this.update());
    this.update();
  };

  test("Triggering event updates data", () => {
    const props = { age: 42 };
    const component = testMount(MyComponent, props);
    const input = component.ref.tbx;
    expect(input.value).toBe("42");

    mimicUserInput(input, 100);

    expect(props.age).toBe(100);
  });
});

/**
 * Special case as `watch` returns a Proxy or Date which isn't accepted as valueAsDate
 * so we run a hack in the compiler.
 */
describe("valueAsDate", () => {
  const MyComponent = ({ date }) => (
    <div>
      <input ref:tbx type="date" bind:valueAsDate={date} />;
    </div>
  );

  MyComponent.prototype.render = function (props) {
    this.props = watch(props, () => this.update());
    this.update();
  };

  test("Triggering event updates data", () => {
    const oldDate = new Date("2000-06-05");
    const newDate = new Date("2020-06-05");

    const props = { date: oldDate };
    const component = testMount(MyComponent, props);
    const input = component.ref.tbx;
    expect(input.value).toBe(oldDate.toISOString().slice(0, 10));

    mimicUserInput(input, newDate.toISOString().slice(0, 10));

    expect(props.date.getDate()).toBe(newDate.getDate());
    expect(props.date.getMonth()).toBe(newDate.getMonth());
    expect(props.date.getFullYear()).toBe(newDate.getFullYear());
  });
});

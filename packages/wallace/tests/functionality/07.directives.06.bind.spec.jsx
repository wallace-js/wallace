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
      "The `bind` directive requires a value of type `expression`."
    );
  });

  test("disallows string", () => {
    const code = `
      const Bar = () => (
        <input bind="Foo" />
        )
        `;
    expect(code).toCompileWithError(
      "The `bind` directive requires a value of type `expression`."
    );
  });

  test("allows qualifier", () => {
    const code = `
      const Bar = (user) => (
        <input bind:checked={user.name} />
      )
    `;
    expect(code).toCompileWithoutError();
  });
});

describe("bind-on directive", () => {
  test("not allowed without bind", () => {
    const code = `
      const Foo = (user) => (
        <input bind-on:keyup />
      )
    `;
    expect(code).toCompileWithError(
      "The `bind-on` directive must be used with the `bind` directive."
    );
  });

  test("disallows value and qualifier", () => {
    const code = `
      const Foo = (user) => (
        <input bind-on:keyup="keyup" />
      )
    `;
    expect(code).toCompileWithError(
      "The `bind-on` directive requires a qualifier or value, not both."
    );
  });

  test("allows event name as qualifier", () => {
    const code = `
      const Bar = (user) => (
        <input bind={user.name} bind-on:keyup />
      )
    `;
    expect(code).toCompileWithoutError();
  });

  test("allows event name as string", () => {
    const code = `
      const Bar = (user) => (
        <input bind={user.name} bind-on="keyup" />
      )
    `;
    expect(code).toCompileWithoutError();
  });

  test("deprecated event directive still works, with a warning", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const code = `
        const Bar = (user) => (
          <input bind={user.name} event:keyup />
        )
      `;
      expect(code).toCompileWithoutError();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain(
        "The `event` directive is deprecated and will be removed. Use `bind-on:keyup` instead."
      );
    } finally {
      warn.mockRestore();
    }
  });
});

test("Change event updates data", () => {
  const MyComponent = ({ text }) => <input ref:tbx type="text" bind={text} />;
  MyComponent.prototype.render = function (model) {
    this.model = watch(model, () => this.update());
    this.update();
  };
  const model = { text: "foo" };
  const component = testMount(MyComponent, model);
  const input = component.ref.tbx;
  expect(input.value).toBe("foo");

  mimicUserInput(input, "bar");

  expect(model.text).toBe("bar");
});

test("Data is updated before other listeners for the same event run", () => {
  const seen = [];
  const MyComponent = model => (
    <input
      ref:tbx
      type="text"
      on:change={seen.push(model.text)}
      bind={model.text}
      on:change={seen.push(model.text)}
    />
  );
  const model = { text: "foo" };
  const component = testMount(MyComponent, model);
  mimicUserInput(component.ref.tbx, "bar");
  expect(seen).toEqual(["bar", "bar"]);
});

test("Value updates to match data", () => {
  const data = { text: "foo" };
  const MyComponent = (_, { self }) => (
    <div>
      <input ref:tbx type="text" bind={data.text} />
      <button ref:btn on:click={self.btnClick()}>
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
      <input ref:tbx type="text" bind={text} bind-on:keyup />;
    </div>
  );
  MyComponent.prototype.render = function (model) {
    this.model = watch(model, () => this.update());
    this.update();
  };

  test("Triggering event updates data", () => {
    const model = { text: "foo" };
    const component = testMount(MyComponent, model);
    const input = component.ref.tbx;
    expect(input.value).toBe("foo");

    mimicUserInput(input, "bar", "value", "keyup");

    expect(model.text).toBe("bar");
  });

  test("Triggering wrong event doesn't update data", () => {
    const model = { text: "foo" };
    const component = testMount(MyComponent, model);
    const input = component.ref.tbx;
    expect(input.value).toBe("foo");

    mimicUserInput(input, "bar", "value", "change");

    expect(model.text).toBe("foo");
  });
});

describe("Alternative property", () => {
  const MyComponent = ({ age }) => (
    <div>
      <input ref:tbx type="number" bind:valueAsNumber={age} />;
    </div>
  );
  MyComponent.prototype.render = function (model) {
    this.model = watch(model, () => this.update());
    this.update();
  };

  test("Triggering event updates data", () => {
    const model = { age: 42 };
    const component = testMount(MyComponent, model);
    const input = component.ref.tbx;
    expect(input.value).toBe("42");

    mimicUserInput(input, 100);

    expect(model.age).toBe(100);
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

  MyComponent.prototype.render = function (model) {
    this.model = watch(model, () => this.update());
    this.update();
  };

  test("Triggering event updates data", () => {
    const oldDate = new Date("2000-06-05");
    const newDate = new Date("2020-06-05");

    const model = { date: oldDate };
    const component = testMount(MyComponent, model);
    const input = component.ref.tbx;
    expect(input.value).toBe(oldDate.toISOString().slice(0, 10));

    mimicUserInput(input, newDate.toISOString().slice(0, 10));

    expect(model.date.getDate()).toBe(newDate.getDate());
    expect(model.date.getMonth()).toBe(newDate.getMonth());
    expect(model.date.getFullYear()).toBe(newDate.getFullYear());
  });
});

/**
 * A place to test outcomes that aren't detectable through behaviour alone.
 */
import { testMount } from "../utils";

test("Can watch the same variable multiple time in component", () => {
  const css = "danger";
  const Animal = () => (
    <div>
      <span id={css} class={css}>
        I am a {css}
      </span>
    </div>
  );
  const component = testMount(Animal, { name: "sheep" });
  expect(component).toRender(`
    <div>
      <span id="danger" class="danger">
        I am a <span>danger</span>
      </span>
    </div>
  `);
});

describe("Watches", () => {
  test("are not created for refs", () => {
    const Dog = () => (
      <div>
        <span ref:target>woof</span>
      </div>
    );
    expect(Dog.prototype._w.length).toBe(0);
  });
  test(" are not created for events", () => {
    const Dog = () => (
      <div>
        <span onClick={foo}>woof</span>
      </div>
    );
    expect(Dog.prototype._w.length).toBe(0);
  });
});

describe("Lookups", () => {
  test("are not created for duplicate mentions in component", () => {
    const Dog = () => (
      <div>
        <span class={css}>woof</span>
        <span>woof {css}</span>
      </div>
    );
    expect(Object.keys(Dog.prototype._q).length).toBe(1);
  });

  test("are not created for duplicate mentions in same element", () => {
    const Dog = () => (
      <div>
        <span class={css} id={css}>
          woof
        </span>
      </div>
    );
    expect(Object.keys(Dog.prototype._q).length).toBe(1);
  });
});

test.only("No accidental string coercion", () => {
  /**
   * Watches, lookups and previous can easily get muddled between objects
   * and Maps and strings and numbers, which can cause 11 > 2 bugs which
   * you only detected once you go over 10.
   */
  let v1 = "v1",
    v2 = "v2",
    v3 = "v3",
    v4 = "v4",
    v5 = "v5",
    v6 = "v6",
    v7 = "v7",
    v8 = "v8",
    v9 = "v9",
    v10 = "v10",
    v11 = "v11",
    v12 = "v12";

  const Foo = (_, { self }) => (
    <div>
      <div
        ref:div
        v1={v1}
        v2={v2}
        v3={v3}
        v4={v4}
        v5={v5}
        v6={v6}
        v7={v7}
        v8={v8}
        v9={v9}
        v10={v10}
        v11={v11}
        v12={v12}
      >
        OK
      </div>
    </div>
  );
  const component = testMount(Foo);
  const div = component.ref.div;
  expect(div["v1"]).toBe("v1");
  expect(div["v9"]).toBe("v9");
  v1 = "x";
  v9 = "y";
  component.update();
  expect(div["v1"]).toBe("x");
  expect(div["v9"]).toBe("y");
});

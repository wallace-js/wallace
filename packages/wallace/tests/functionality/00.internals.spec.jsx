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
    expect(Object.keys(Dog.prototype._l.callbacks).length).toBe(1);
  });

  test("are not created for duplicate mentions in same element", () => {
    const Dog = () => (
      <div>
        <span class={css} id={css}>
          woof
        </span>
      </div>
    );
    expect(Object.keys(Dog.prototype._l.callbacks).length).toBe(1);
  });
});

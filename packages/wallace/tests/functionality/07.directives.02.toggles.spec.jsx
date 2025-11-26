import { testMount } from "../utils";

describe("Toggle without target", () => {
  test("Can toggle a class on and off", () => {
    let spotted = false;
    const Leopard = () => (
      <div ref:target toggle:spotty={spotted}>
        leopard
      </div>
    );
    const component = testMount(Leopard);
    expect(component).toRender(`
      <div>leopard</div>
    `);
    expect(component.ref.target.classList.contains("spotty")).toBe(false);
    spotted = true;
    component.update();
    expect(component.ref.target.classList.contains("spotty")).toBe(true);
    spotted = false;
    component.update();
    expect(component.ref.target.classList.contains("spotty")).toBe(false);
  });

  test("Toggle leaves existing classes alone", () => {
    let spotted = false;
    const Leopard = () => (
      <div class="foo" ref:target toggle:spotty={spotted}>
        leopard
      </div>
    );
    const component = testMount(Leopard);
    expect(component).toRender(`
      <div class="foo">leopard</div>
    `);
    expect(component.ref.target.classList.contains("spotty")).toBe(false);
    expect(component.ref.target.classList.contains("foo")).toBe(true);
    spotted = true;
    component.update();
    expect(component.ref.target.classList.contains("spotty")).toBe(true);
    expect(component.ref.target.classList.contains("foo")).toBe(true);
    spotted = false;
    component.update();
    expect(component.ref.target.classList.contains("spotty")).toBe(false);
    expect(component.ref.target.classList.contains("foo")).toBe(true);
  });
});

describe("Toggle with target", () => {
  /*
  spaces before/after
  const & func - returns array/string (error)
  throws errors if toggle targets don't have matching triggers.
  class directive on its own still works
  */

  test("Toggles set on and off, leaving existing classes alone", () => {
    let spotted = false;
    const Leopard = () => (
      <div class="foo" ref:target class:spotty="spotty" toggle:spotty={spotted}>
        leopard
      </div>
    );
    const component = testMount(Leopard);
    expect(component).toRender(`
      <div class="foo">leopard</div>
    `);
    expect(component.ref.target.classList.contains("spotty")).toBe(false);
    expect(component.ref.target.classList.contains("foo")).toBe(true);
    spotted = true;
    component.update();
    expect(component.ref.target.classList.contains("spotty")).toBe(true);
    expect(component.ref.target.classList.contains("foo")).toBe(true);
    spotted = false;
    component.update();
    expect(component.ref.target.classList.contains("spotty")).toBe(false);
    expect(component.ref.target.classList.contains("foo")).toBe(true);
  });
});

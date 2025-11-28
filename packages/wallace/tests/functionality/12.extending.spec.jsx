import { testMount } from "../utils";
import { extendComponent } from "wallace";

const BaseComponent = ({}, { self }) => (
  <div>
    <div>{self.getName()}</div>
    <div>{self.getAge()}</div>
  </div>
);
BaseComponent.methods({
  getName() {
    return "wallace";
  },
  getAge() {
    return 9;
  },
});

test("Base can acccess its own method", () => {
  const component = testMount(BaseComponent);
  expect(component).toRender(`
  <div>
    <div>wallace</div>
    <div>9</div>
  </div>`);
});

describe("child component with same dom", () => {
  test("Can access method on parent", () => {
    const ChildComponent = extendComponent(BaseComponent);
    const component = testMount(ChildComponent);
    expect(component).toRender(`
  <div>
    <div>wallace</div>
    <div>9</div>
  </div>`);
  });

  test("Can override method on parent", () => {
    const ChildComponent = extendComponent(BaseComponent);
    ChildComponent.methods({
      getName() {
        return "robert";
      },
    });
    const component = testMount(ChildComponent);
    expect(component).toRender(`
  <div>
    <div>robert</div>
    <div>9</div>
  </div>`);
  });
});

describe("child component with new dom", () => {
  test("Can access method on parent", () => {
    const ChildComponent = extendComponent(BaseComponent, ({}, { self }) => (
      <div>
        <h3>{self.getName()}</h3>
        <span>{self.getAge()}</span>
      </div>
    ));
    const component = testMount(ChildComponent);
    expect(component).toRender(`
  <div>
    <h3>wallace</h3>
    <span>9</span>
  </div>`);
  });

  test("Can override method on parent", () => {
    const ChildComponent = extendComponent(BaseComponent, ({}, { self }) => (
      <div>
        <h3>{self.getName()}</h3>
        <span>{self.getAge()}</span>
      </div>
    ));
    ChildComponent.methods({
      getName() {
        return "robert";
      },
    });
    const component = testMount(ChildComponent);
    expect(component).toRender(`
  <div>
    <h3>robert</h3>
    <span>9</span>
  </div>`);
  });

  test("Can access overridden methods", () => {
    const ChildComponent = extendComponent(BaseComponent, ({}, { self }) => (
      <div>
        <h3>{self.getName()}</h3>
        <span>{self.getWeapon()}</span>
      </div>
    ));
    ChildComponent.methods({
      getWeapon() {
        return "axe";
      },
    });
    const component = testMount(ChildComponent);
    expect(component).toRender(`
  <div>
    <h3>wallace</h3>  
    <span>axe</span>
  </div>`);
  });
});

import { testMount } from "../utils";
import { extendComponent } from "wallace";

class Controller {
  constructor(multiplier) {
    this.multiplier = multiplier;
  }
  multiply(value) {
    return value * this.multiplier;
  }
}

describe("Nested components", () => {
  const Foo = () => <div></div>;
  const Bar = () => (
    <div>
      <Foo.nest ref:foo />
    </div>
  );
  Bar.prototype.render = function () {
    this.ctrl = 8;
    this.update();
  };
  const component = testMount(Bar);
  test("has its controller set initially", () => {
    expect(component.ref.foo.ctrl).toBe(8);
  });

  test("has its controller updated", () => {
    component.ctrl = 10;
    component.update();
    expect(component.ref.foo.ctrl).toBe(10);
  });
});

describe("Repeated components", () => {
  const Foo = (i, { ctrl }) => <div>{ctrl.multiply(i)}</div>;
  const Bar = () => (
    <div>
      <Foo.repeat props={[1, 2, 3]} />
    </div>
  );
  Bar.prototype.render = function () {
    this.ctrl = new Controller(2);
    this.update();
  };
  const component = testMount(Bar);
  test("have their controller set initially", () => {
    expect(component).toRender(`
      <div>
        <div>2</div>
        <div>4</div>
        <div>6</div>
      </div>
    `);
  });

  test("have their controller updated", () => {
    component.ctrl = new Controller(3);
    component.update();
    expect(component).toRender(`
      <div>
        <div>3</div>
        <div>6</div>
        <div>9</div>
      </div>
    `);
  });
});

describe("Inherited component", () => {
  const BaseComponent = ({}, { ctrl }) => (
    <div>
      <span>{ctrl.multiply(1)}</span>
      <stub:display />
    </div>
  );
  const SubComponent = extendComponent(BaseComponent);
  SubComponent.stubs.display = (_, { ctrl }) => <span>{ctrl.multiply(2)}</span>;
  SubComponent.prototype.render = function () {
    this.ctrl = new Controller(2);
    this.update();
  };
  const component = testMount(SubComponent);

  test("has its controller set initially", () => {
    expect(component).toRender(`
      <div>
        <span>2</span>
        <span>4</span>
      </div>
    `);
  });

  test("has its controller updated", () => {
    component.ctrl = new Controller(3);
    component.update();
    expect(component).toRender(`
      <div>
        <span>3</span>
        <span>6</span>
      </div>
    `);
  });
});

test("Can pass controller in mount", () => {
  const Foo = (i, { ctrl }) => <div>{ctrl.multiply(i)}</div>;
  const component = testMount(Foo, 2, new Controller(2));
  expect(component).toRender("<div>4</div>");
});

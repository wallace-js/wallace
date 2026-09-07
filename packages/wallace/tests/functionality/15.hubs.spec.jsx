import { testMount } from "../utils";
import { extendComponent } from "wallace";

if (wallaceConfig.flags.allowHub) {
  class Hub {
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
        <Foo ref:foo />
      </div>
    );
    Bar.prototype.render = function () {
      this.hub = 8;
      this.update();
    };
    const component = testMount(Bar);
    test("has its hub set initially", () => {
      expect(component.ref.foo.get().hub).toBe(8);
    });

    test("has its hub updated", () => {
      component.hub = 10;
      component.update();
      expect(component.ref.foo.get().hub).toBe(10);
    });
  });

  describe("Repeated components", () => {
    const Foo = (i, { hub }) => <div>{hub.multiply(i)}</div>;
    const Bar = () => (
      <div>
        <Foo.repeat models={[1, 2, 3]} />
      </div>
    );
    Bar.prototype.render = function () {
      this.hub = new Hub(2);
      this.update();
    };
    const component = testMount(Bar);
    test("have their hub set initially", () => {
      expect(component).toRender(`
      <div>
        <div>2</div>
        <div>4</div>
        <div>6</div>
      </div>
    `);
    });

    test("have their hub updated", () => {
      component.hub = new Hub(3);
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

  if (wallaceConfig.flags.allowStubs) {
    describe("Inherited component", () => {
      const BaseComponent = ({}, { hub }) => (
        <div>
          <span>{hub.multiply(1)}</span>
          <stub.display />
        </div>
      );
      const SubComponent = extendComponent(BaseComponent);
      SubComponent.stub.display = (_, { hub }) => <span>{hub.multiply(2)}</span>;
      SubComponent.prototype.render = function () {
        this.hub = new Hub(2);
        this.update();
      };
      const component = testMount(SubComponent);

      test("has its hub set initially", () => {
        expect(component).toRender(`
      <div>
        <span>2</span>
        <span>4</span>
      </div>
    `);
      });

      test("has its hub updated", () => {
        component.hub = new Hub(3);
        component.update();
        expect(component).toRender(`
      <div>
        <span>3</span>
        <span>6</span>
      </div>
    `);
      });
    });
  }

  test("Can pass hub in mount", () => {
    const Foo = (i, { hub }) => <div>{hub.multiply(i)}</div>;
    const component = testMount(Foo, 2, new Hub(2));
    expect(component).toRender("<div>4</div>");
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}

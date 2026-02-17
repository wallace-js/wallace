import { testMount } from "../utils";

if (wallaceConfig.flags.allowMethods) {
  describe("The methods property", () => {
    test("allows us to override an existing method by name", () => {
      const Foo = (_, { self }) => <div>{self.name}</div>;
      Foo.methods.render = function () {
        this.name = "wallace";
        this.update();
      };
      const component = testMount(Foo);
      expect(component).toRender(`<div>wallace</div>`);
    });

    test("allows us add a method by name", () => {
      const Foo = (_, { self }) => <div>{self.getName()}</div>;
      Foo.methods.getName = function () {
        return "wallace";
      };
      const component = testMount(Foo);
      expect(component).toRender(`<div>wallace</div>`);
    });

    test("doesn't overwrite other prototype properties", () => {
      const Foo = (_, { self }) => <div>{self.getName()}</div>;
      Foo.methods = {
        render() {
          this.name = this.getName();
          this.update();
        },
        getName() {
          return "wallace";
        }
      };

      const component = testMount(Foo);
      expect(component).toRender(`<div>wallace</div>`);
    });
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}

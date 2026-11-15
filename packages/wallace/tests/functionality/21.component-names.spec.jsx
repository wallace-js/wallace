/*
In development the plugin passes component names to defineComponent, for use in
messages.
*/
import { transform } from "@babel/core";
import wallacePlugin from "babel-plugin-wallace";
import { extendComponent } from "wallace";
import { componentName } from "../../lib/utils";
import { testMount } from "../utils";

describe("Component names", () => {
  test("come from variables", () => {
    const Foo = () => <div></div>;
    expect(Foo.name).toBe("Foo");
  });

  test("come from assignments", () => {
    const foo = {};
    foo.bar = () => <div></div>;
    expect(foo.bar.name).toBe("foo.bar");
  });

  test("come from object properties and methods", () => {
    const foo = {
      Bar: () => <div></div>,
      Baz() {
        return <div></div>;
      }
    };
    expect(foo.Bar.name).toBe("Bar");
    expect(foo.Baz.name).toBe("Baz");
  });

  test("come from extendComponent", () => {
    const Base = () => <div></div>;
    const Child = extendComponent(Base, () => <span></span>);
    expect(Child.name).toBe("Child");
  });

  if (wallaceConfig.flags.allowStubs) {
    test("come from stub assignments", () => {
      const Parent = () => (
        <div>
          <stub.text />
        </div>
      );
      Parent.stub.text = () => <span></span>;
      expect(Parent.stub.text.name).toBe("Parent.stub.text");
    });
  }

  test("are available on instances", () => {
    const Foo = () => <div></div>;
    expect(componentName(testMount(Foo))).toBe("Foo");
  });
});

describe("Component names in production", () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = original;
  });

  test("are not compiled", () => {
    process.env.NODE_ENV = "production";
    const output = transform(`const Foo = () => <div></div>;`, {
      filename: "/app/src/index.jsx",
      configFile: false,
      babelrc: false,
      plugins: [wallacePlugin, "@babel/plugin-syntax-jsx"]
    }).code;
    expect(output).toContain("defineComponent(");
    expect(output).not.toContain(`"Foo"`);
  });
});

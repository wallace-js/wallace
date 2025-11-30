import { testMount } from "../utils";
import { Component } from "wallace";

describe("Class components", () => {
  test("render without props", () => {
    class MyComponent extends Component {
      jsx = () => <div>hello</div>;
    }
    const component = testMount(MyComponent);
    expect(component).toRender(`<div>hello</div>`);
  });

  test("render with props", () => {
    class MyComponent extends Component {
      jsx = ({ name }) => <div>hello {name}</div>;
    }
    const component = testMount(MyComponent, { name: "walrus" });
    expect(component).toRender(`<div>hello <span>walrus</span></div>`);
  });

  test("can use own methods", () => {
    class MyComponent extends Component {
      jsx = ({ name }, { self }) => <div>hello {self.format(name)}</div>;
      format(name) {
        return name.toUpperCase();
      }
    }

    const component = testMount(MyComponent, { name: "walrus" });
    expect(component).toRender(`<div>hello <span>WALRUS</span></div>`);
  });

  test("with jsx method", () => {
    class MyComponent extends Component {
      jsx() {
        return <div>hello</div>;
      }
    }
    const component = testMount(MyComponent);
    expect(component).toRender(`<div>hello</div>`);
  });
});

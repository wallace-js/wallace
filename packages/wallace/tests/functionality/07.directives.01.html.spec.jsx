import { testMount } from "../utils";

test("HTML directive works", () => {
  const MyComponent = ({ name }, { self }) => (
    <div>
      <div class="title" html={self.getHtml()}></div>
    </div>
  );
  MyComponent.methods = {
    getHtml() {
      return `<h3>${this.props.name}</h3>`;
    }
  };
  const component = testMount(MyComponent, { name: "Wallace" });
  expect(component).toRender(`
    <div>
      <div class="title">
      <h3>Wallace</h3>
      </div>
    </div>
  `);
});

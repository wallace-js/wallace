import { testMount } from "../utils";

test("Component with nested elements renders correctly", () => {
  const Example = () => (
    <div>
      These are some cool <b>animals</b>:
      <div>
        <br />
        <ul>
          <li>Walrus</li>
          <li>Aardvark</li>
          <li>Capybara</li>
        </ul>
      </div>
    </div>
  );

  const component = testMount(Example);
  expect(component).toRender(`
    <div>
      These are some cool <b>animals</b>:
      <div>
        <br>
        <ul>
          <li>Walrus</li>
          <li>Aardvark</li>
          <li>Capybara</li>
        </ul>
      </div>
    </div>
  `);
});

test("Hiphenated attributes can be set", () => {
  const MyComponent = ({ text }) => (
    <div ref:div foo-bar={2}>
      {text}
    </div>
  );
  const component = testMount(MyComponent, { text: "walrus" });
  expect(component).toRender(`<div foo-bar="2">walrus</div>`);
});

test("Skipping a read doesn't break render", () => {
  const MyComponent = ({ text, show }) => (
    <div>
      <div>{text}</div>
      <div if={show}>{text}</div>
    </div>
  );

  const component = testMount(MyComponent, { text: "walrus", show: true });
  expect(component).toRender(`
    <div>
      <div>walrus</div>
      <div>walrus</div>
    </div>
  `);

  component.render({ text: "aardvark", show: false });
  expect(component).toRender(`
    <div>
      <div>aardvark</div>
    </div>
  `);

  component.render({ text: "aardvark", show: true });
  expect(component).toRender(`
    <div>
      <div>aardvark</div>
      <div>aardvark</div>
    </div>
  `);
});

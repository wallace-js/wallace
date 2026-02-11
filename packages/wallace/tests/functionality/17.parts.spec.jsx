import { testMount } from "../utils";

test("Parts update the right elements", () => {
  let color = "red",
    age = 10,
    animal = "Otter";
  const Foo = ({ count }, { element }) => (
    <div>
      <div part:a style:color={color}>
        <span>{animal}</span>
      </div>
      <div part:b style:color={color}>
        <span>{animal}</span>
      </div>
    </div>
  );

  const component = testMount(Foo);
  expect(component).toRender(`
    <div>
      <div style="color: red;">
        <span>Otter</span>
      </div>
      <div style="color: red;">
        <span>Otter</span>
      </div>
    </div>
  `);

  color = "green";
  animal = "Frog";
  component.part.a.update();

  expect(component).toRender(`
    <div>
      <div style="color: green;">
        <span>Frog</span>
      </div>
      <div style="color: red;">
        <span>Otter</span>
      </div>
    </div>
  `);

  color = "orange";
  animal = "Baboon";
  component.part.b.update();

  expect(component).toRender(`
    <div>
      <div style="color: green;">
        <span>Frog</span>
      </div>
      <div style="color: orange;">
        <span>Baboon</span>
      </div>
    </div>
  `);

  component.part.a.update();

  expect(component).toRender(`
    <div>
      <div style="color: orange;">
        <span>Baboon</span>
      </div>
      <div style="color: orange;">
        <span>Baboon</span>
      </div>
    </div>
  `);
});

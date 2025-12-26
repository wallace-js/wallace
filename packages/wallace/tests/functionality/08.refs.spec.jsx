import { testMount } from "../utils";

// test("Ref on element points to element", () => {
//   const A = () => (
//     <div>
//       <span class="danger" ref:a>
//         hello
//       </span>
//     </div>
//   );
//   const component = testMount(A);
//   expect(component.refs.a).toBeInstanceOf(HTMLSpanElement);
//   expect(component.refs.a.className).toBe("danger");
// });

// test("Ref on nested component points to component", () => {
//   const A = () => <span class="danger">hello</span>;
//   const B = () => (
//     <div>
//       <A.nest ref:a />
//     </div>
//   );
//   const component = testMount(B);
//   expect(component.refs.a.element).not.toBeInstanceOf(HTMLSpanElement);
//   expect(component.refs.a.element.el.className).toBe("danger");
// });

// test("Multiple refs allowed", () => {
//   const A = () => (
//     <div>
//       <span class="danger" ref:a>
//         hello
//       </span>
//       <span class="warning" ref:b>
//         hello
//       </span>
//     </div>
//   );
//   const component = testMount(A);
//   expect(component.refs.a).toBeInstanceOf(HTMLSpanElement);
//   expect(component.refs.b).toBeInstanceOf(HTMLSpanElement);
//   expect(component.refs.a.className).toBe("danger");
//   expect(component.refs.b.className).toBe("warning");
// });

test("Multiple refs with same name compiles with error", () => {
  const src = `
    const A = () => (
    <div>
      <span ref:a>Otter</span>
      <span ref:a>Swan</span>
    </div>
  );
  `;
  expect(src).toCompileWithError("Refs must be unique within each component.");
});

// TODO: ensure ref syntax used correctly, and not allowed on repeat.

test("Refs update the right elements", () => {
  let color = "red",
    age = 10,
    animal = "Otter";
  const Foo = ({ count }, { element }) => (
    <div>
      <div ref:a style:color={color}>
        <span>{animal}</span>
      </div>
      <div ref:b style:color={color}>
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
  component.refs.a.update();

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
  component.refs.b.update();

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

  component.refs.a.update();

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

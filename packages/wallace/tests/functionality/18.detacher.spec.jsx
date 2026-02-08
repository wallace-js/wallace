import { testMount } from "../utils";

test("Conditional nodes after repeat", () => {
  let show = "ab";
  const Bar = i => <div>{i}</div>;
  const Foo = () => (
    <div>
      <Bar.repeat items={[]} />
      <div if={show.includes("a")}>a</div>
      <div if={show.includes("b")}>b</div>
    </div>
  );

  const component = testMount(Foo);
  expect(component).toRender(`
    <div>
      <div>a</div>
      <div>b</div>
    </div>
  `);

  show = "b";
  component.update();
  expect(component).toRender(`
    <div>
      <div>b</div>
    </div>
    `);

  show = "ab";
  component.update();
  expect(component).toRender(`
    <div>
      <div>a</div>
      <div>b</div>
    </div>
    `);
});

// const food = ["pizza", "bananas", "peaches"];
// const show = "abcd";
// const Bar = i => <div>{i}</div>;
// const Foo = () => (
//   <div>
//     <div>
//       <Bar.repeat items={food} />
//       <div if={show.includes("a")}>a</div>
//       <div if={show.includes("b")}>b</div>
//       <hr />
//       <div if={show.includes("c")}>c</div>
//       <div if={show.includes("d")}>d</div>
//     </div>
//   </div>
// );

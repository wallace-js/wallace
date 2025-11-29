import { testMount } from "../utils";

describe("Style directive", () => {
  test("changes style", () => {
    let color = "red";
    const Leopard = () => (
      <div ref:target style:color={color}>
        leopard
      </div>
    );
    const component = testMount(Leopard);
    expect(component).toRender(`
      <div style="color: red;">leopard</div>
    `);
    expect(component.ref.target.style.color).toBe("red");
    color = "green";
    component.update();
    expect(component.ref.target.style.color).toBe("green");
  });

  test("leaves existing styles alone", () => {
    let color = "red";
    const Leopard = () => (
      <div style="width: 100px" ref:target style:color={color}>
        leopard
      </div>
    );
    const component = testMount(Leopard);
    expect(component).toRender(`
      <div style="width: 100px; color: red;">leopard</div>
    `);
    expect(component.ref.target.style.color).toBe("red");
    expect(component.ref.target.style.width).toBe("100px");
    color = "green";
    component.update();
    expect(component.ref.target.style.width).toBe("100px");
  });

  // TODO: allow this?
  // test("Can use style without qualifier", () => {
  //   const getStyle = () => ({ color: "red" });
  //   const Leopard = () => (
  //     <div ref:target style={getStyle()}>
  //       leopard
  //     </div>
  //   );
  //   const component = testMount(Leopard);
  //   expect(component.ref.target.style.color).toBe("red");
  // });
});

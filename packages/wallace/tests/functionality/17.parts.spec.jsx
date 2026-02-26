import { testMount } from "../utils";

if (wallaceConfig.flags.allowParts) {
  test("Parts update the right elements", () => {
    let color = "red",
      animal = "Otter";
    const Foo = () => (
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

  test("Parts work on repeated components", () => {
    const Foo = n => <span>{n}</span>;
    const Bar = () => (
      <div>
        <span>total: {items.reduce((a, b) => a + b, 0)}</span>
        <div>
          <Foo.repeat part:foo props={items} />
        </div>
      </div>
    );
    const items = [1, 2, 3];
    const component = testMount(Bar);

    expect(component).toRender(`
      <div> 
        <span>total: <span>6</span></span>
        <div>
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </div>
      </div>
    `);
    items.push(4);
    component.part.foo.update();
    expect(component).toRender(`
      <div> 
        <span>total: <span>6</span></span>
        <div>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>
    `);

    component.update();
    expect(component).toRender(`
      <div> 
        <span>total: <span>10</span></span>
        <div>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>
    `);
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}

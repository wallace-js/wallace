import { testMount } from "../utils";

// We test pooling for repeaters elsewhere.
if (wallaceConfig.flags.allowDismount) {
  describe("Dismounting", () => {
    const Field = value => <div>{value}</div>;
    const Animal = animal => (
      <div>
        <Field.nest props={animal.name} />
        <Field.nest props={animal.type} />
      </div>
    );
    const AnimalList = () => (
      <div>
        <Animal.repeat items={animals} />
      </div>
    );
    const animals = [
      { type: "bird", name: "crow" },
      { type: "fish", name: "tuna" },
      { type: "fish", name: "salmon" }
    ];
    const takeout = [];
    test("nested components adds them to pool", () => {
      const component = testMount(AnimalList);
      expect(component).toRender(`
        <div>
          <div>
            <div>crow</div>
            <div>bird</div>
          </div>
          <div>
            <div>tuna</div>
            <div>fish</div>
          </div>
          <div>
            <div>salmon</div>
            <div>fish</div>
          </div>
        </div>
      `);
      expect(Animal.pool.length).toBe(0);
      expect(Field.pool.length).toBe(0);

      takeout.push(animals.pop());
      takeout.push(animals.pop());
      component.update();
      expect(component).toRender(`
        <div>
          <div>
            <div>crow</div>
            <div>bird</div>
          </div>
        </div>
      `);
      expect(Animal.pool.length).toBe(2);
      expect(Field.pool.length).toBe(4);
    });
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}

import { testMount } from "../utils";

// We test pooling for repeaters elsewhere.
if (wallaceConfig.flags.allowDismount) {
  describe("Dismounting", () => {
    const Field = value => <div>{value}</div>;
    const Animal = animal => (
      <div>
        <Field model={animal.name} />
        <Field model={animal.type} />
      </div>
    );
    const AnimalList = () => (
      <div>
        <Animal.repeat models={animals} />
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

  describe("Updating a dismounted component", () => {
    class Item {
      component;
      constructor(name) {
        this.name = name;
      }
    }
    const Row = item => <div assign:component>{item.name}</div>;
    const List = items => (
      <div>
        <Row.repeat models={items} />
      </div>
    );
    let warn;
    beforeEach(() => {
      warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
      warn.mockRestore();
    });

    test("warns once", () => {
      const a = new Item("a"),
        b = new Item("b");
      const component = testMount(List, [a, b]);
      component.model.pop();
      component.update();
      b.component.update();
      b.component.update();
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain(
        "Row: update was called after the component was dismounted."
      );
    });

    test("doesn't warn once reused", () => {
      const a = new Item("a"),
        b = new Item("b");
      const component = testMount(List, [a, b]);
      component.model.pop();
      component.update();
      const c = new Item("c");
      component.model.push(c);
      component.update();
      c.component.update();
      a.component.update();
      expect(warn).not.toHaveBeenCalled();
    });
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}

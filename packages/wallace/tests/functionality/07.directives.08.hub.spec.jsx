import { testMount } from "../utils";

if (wallaceConfig.flags.allowHub) {
  test("Can use with nested component", () => {
    const Fox = (_, { hub }) => <div>Fox {hub}</div>;
    const AnimalList = (_, { self }) => (
      <div>
        <Fox hub={self.foxHub} />
      </div>
    );
    AnimalList.prototype.render = function (model) {
      this.model = model;
      this.foxHub = 6;
      this.update();
    };
    const component = testMount(AnimalList);
    expect(component).toRender(`
    <div>
      <div>Fox <span>6</span></div>
    </div>
  `);
  });

  test("Can use with repeated component", () => {
    const animals = ["cat", "dog", "fox"];
    const Animal = (name, { hub }) => <div>{name + " " + hub}</div>;
    const AnimalList = (_, { self }) => (
      <div>
        <Animal.repeat models={animals} hub={self.tmpHub} />
      </div>
    );
    AnimalList.prototype.render = function (model) {
      this.model = model;
      this.tmpHub = 6;
      this.update();
    };
    const component = testMount(AnimalList);
    expect(component).toRender(`
    <div>
      <div>cat 6</div>
      <div>dog 6</div>
      <div>fox 6</div>
    </div>
  `);
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}

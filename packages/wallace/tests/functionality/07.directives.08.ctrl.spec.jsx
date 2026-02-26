import { testMount } from "../utils";

if (wallaceConfig.flags.allowCtrl) {
  test("Can use with nested component", () => {
    const Fox = (_, { ctrl }) => <div>Fox {ctrl}</div>;
    const AnimalList = (_, { self }) => (
      <div>
        <Fox ctrl={self.foxCtrl} />
      </div>
    );
    AnimalList.prototype.render = function (props) {
      this.props = props;
      this.foxCtrl = 6;
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
    const Animal = (name, { ctrl }) => <div>{name + " " + ctrl}</div>;
    const AnimalList = (_, { self }) => (
      <div>
        <Animal.repeat props={animals} ctrl={self.tmpCtrl} />
      </div>
    );
    AnimalList.prototype.render = function (props) {
      this.props = props;
      this.tmpCtrl = 6;
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

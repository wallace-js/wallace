import { testMount } from "../utils";

const Child = ({ i }) => <div>{i}</div>;
const NonKeyed = data => (
  <div>
    <Child.repeat items={data} />
  </div>
);

const Keyed = data => (
  <div>
    <Child.repeat items={data} key="i" />
  </div>
);

describe.each([
  ["NonKeyed", NonKeyed],
  ["Keyed", Keyed]
])("%s", (_, Container) => {
  test("on initial testMount", () => {
    const component = testMount(Container, [{ i: 1 }, { i: 5 }, { i: 2 }, { i: 6 }]);
    expect(component).toRender(`
      <div>
        <div>1</div>
        <div>5</div>
        <div>2</div>
        <div>6</div>
      </div>
    `);
  });

  test("Adding items works", () => {
    const component = testMount(Container, [{ i: 5 }, { i: 2 }]);
    expect(component).toRender(`
      <div>
        <div>5</div>
        <div>2</div>
      </div>
    `);
    component.render([{ i: 5 }, { i: 2 }, { i: 6 }]);
    expect(component).toRender(`
      <div>
        <div>5</div>
        <div>2</div>
        <div>6</div>
      </div>
    `);
  });

  test("Removing items works", () => {
    const component = testMount(Container, [{ i: 5 }, { i: 2 }, { i: 3 }, { i: 8 }]);
    component.render([{ i: 2 }, { i: 8 }]);
    expect(component).toRender(`
      <div>
        <div>2</div>
        <div>8</div>
      </div>
    `);
  });

  test("Complete replacement", () => {
    const component = testMount(Container, [{ i: 5 }, { i: 2 }, { i: 3 }, { i: 8 }]);
    component.render([{ i: 22 }, { i: 18 }]);
    expect(component).toRender(`
      <div>
        <div>22</div>
        <div>18</div>
      </div>
    `);
  });

  test("Reshuffle", () => {
    const component = testMount(Container, [{ i: 7 }, { i: 5 }, { i: 6 }, { i: 2 }]);
    component.render([{ i: 5 }, { i: 2 }, { i: 6 }, { i: 7 }]);
    expect(component).toRender(`
      <div>
        <div>5</div>
        <div>2</div>
        <div>6</div>
        <div>7</div>
      </div>
    `);
  });

  test("Multiple add and remove shorter", () => {
    const component = testMount(Container, [
      { i: 7 },
      { i: 5 },
      { i: 44 },
      { i: 6 },
      { i: 2 },
      { i: 8 },
      { i: 5 },
      { i: 6 }
    ]);
    component.render([{ i: 2 }, { i: 7 }, { i: 11 }, { i: 8 }, { i: 23 }]);
    expect(component).toRender(`
      <div>
        <div>2</div>
        <div>7</div>
        <div>11</div>
        <div>8</div>
        <div>23</div>
      </div>
    `);
  });

  test("Multiple add and remove longer", () => {
    const component = testMount(Container, [{ i: 7 }, { i: 5 }, { i: 8 }]);
    component.render([{ i: 2 }, { i: 7 }, { i: 11 }, { i: 8 }, { i: 5 }, { i: 23 }]);
    expect(component).toRender(`
      <div>
        <div>2</div>
        <div>7</div>
        <div>11</div>
        <div>8</div>
        <div>5</div>
        <div>23</div>
      </div>
    `);
  });

  test("Clear", () => {
    const component = testMount(Container, [{ i: 2 }, { i: 5 }, { i: 8 }]);
    component.render([]);
    expect(component).toRender(`
      <div>
      </div>
    `);
  });
});

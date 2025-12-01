import { testMount } from "../utils";

describe("Repeat reordering", () => {
  const Container = data => (
    <div>
      <Child.repeat props={data} />
    </div>
  );
  const Child = data => <div>{data}</div>;

  test("on initial testMount", () => {
    const component = testMount(Container, [1, 5, 2, 6]);
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
    const component = testMount(Container, [5, 2]);
    expect(component).toRender(`
      <div>
        <div>5</div>
        <div>2</div>
      </div>
    `);
    component.render([5, 2, 6]);
    expect(component).toRender(`
      <div>
        <div>5</div>
        <div>2</div>
        <div>6</div>
      </div>
    `);
  });

  test("Removing items works", () => {
    const component = testMount(Container, [5, 2, 3, 8]);
    component.render([2, 8]);
    expect(component).toRender(`
      <div>
        <div>2</div>
        <div>8</div>
      </div>
    `);
  });

  test("Complete replacement", () => {
    const component = testMount(Container, [5, 2, 3, 8]);
    component.render([22, 18]);
    expect(component).toRender(`
      <div>
        <div>22</div>
        <div>18</div>
      </div>
    `);
  });

  test("Reshuffle", () => {
    const component = testMount(Container, [7, 5, 6, 2]);
    component.render([5, 2, 6, 7]);
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
    const component = testMount(Container, [7, 5, 44, 6, 2, 8, 5, 6]);
    component.render([2, 7, 11, 8, 23]);
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
    const component = testMount(Container, [7, 5, 8]);
    component.render([2, 7, 11, 8, 5, 23]);
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
    const component = testMount(Container, [5, 2, 3, 8]);
    component.render([]);
    expect(component).toRender(`
      <div>
      </div>
    `);
  });
});

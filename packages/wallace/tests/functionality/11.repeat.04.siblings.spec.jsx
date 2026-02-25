/**
 * Mixing repeaters and conditional elements under the same node changes how repeaters
 * work, and needs extensive testing, as certain bugs only appear after a number of
 * operations.
 */
import { testMount } from "../utils";

const Child = ({ i }) => <div>{i}</div>;
const permutations = [
  ["Sequential", 0],
  ["Keyed", 1]
];

if (wallaceConfig.flags.allowRepeaterSiblings) {
  describe.each(permutations)("Normal element as sibling (%s)", (_, keyed) => {
    let items;
    const Container = keyed
      ? () => (
          <div>
            <div>hello</div>
            <Child.repeat items={items} key="i" />
          </div>
        )
      : () => (
          <div>
            <div>hello</div>
            <Child.repeat items={items} />
          </div>
        );

    test("start empty", () => {
      items = [];
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <div>hello</div>
      </div>
    `);
      items = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
      </div>
    `);
      items = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      items = [{ i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>2</div>
      </div>
    `);

      items = [{ i: 1 }, { i: 2 }, { i: 3 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    `);

      items = [{ i: 3 }, { i: 1 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>3</div>
        <div>1</div>
      </div>
    `);
    });

    test("start with contents", () => {
      items = [{ i: 1 }, { i: 2 }, { i: 3 }];
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    `);

      items = [{ i: 3 }, { i: 1 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>3</div>
        <div>1</div>
      </div>
    `);

      items = [];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
      </div>
    `);

      items = [{ i: 4 }, { i: 3 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>4</div>
        <div>3</div>
      </div>
    `);
    });
  });

  describe.each(permutations)("Conditional element as sibling (%s)", (_, keyed) => {
    let items, showElement;

    const Container = keyed
      ? () => (
          <div>
            <div if={showElement}>hello</div>
            <Child.repeat items={items} key="i" />
          </div>
        )
      : () => (
          <div>
            <div if={showElement}>hello</div>
            <Child.repeat items={items} />
          </div>
        );

    test("start visible, no items", () => {
      items = [];
      showElement = true;
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <div>hello</div>
      </div>
    `);

      items = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      showElement = false;
      component.update();
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      items = [{ i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>2</div>
      </div>
    `);

      showElement = true;
      items = [{ i: 1 }, { i: 2 }, { i: 3 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
    `);

      showElement = false;
      items = [{ i: 3 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>3</div>
      </div>
    `);
    });

    test("start visible, with items", () => {
      items = [{ i: 3 }];
      showElement = true;
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>3</div>
      </div>
    `);

      items = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      showElement = false;
      component.update();
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      showElement = true;
      items = [{ i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>2</div>
      </div>
    `);
    });

    test("start hidden, no items", () => {
      items = [];
      showElement = false;
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
      </div>
    `);

      items = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      showElement = true;
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      items = [{ i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>2</div>
      </div>
    `);

      showElement = false;
      items = [{ i: 1 }, { i: 3 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>3</div>
      </div>
    `);
    });

    test("start hidden, with items", () => {
      items = [{ i: 1 }, { i: 3 }];
      showElement = false;
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>3</div>
      </div>
    `);

      showElement = true;
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>3</div>
      </div>
    `);

      showElement = false;
      items = [{ i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>2</div>
      </div>
    `);
    });
  });

  describe.each(permutations)("Repeater as sibling (%s)", (_, keyed) => {
    let items1, items2;
    const Container = keyed
      ? () => (
          <div>
            <Child.repeat items={items1} />
            <Child.repeat items={items2} key="i" />
          </div>
        )
      : () => (
          <div>
            <Child.repeat items={items1} />
            <Child.repeat items={items2} />
          </div>
        );

    test("start both emtpy ", () => {
      items1 = [];
      items2 = [];
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
      </div>
    `);

      items2 = [{ i: 3 }, { i: 4 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>3</div>
        <div>4</div>
      </div>
    `);

      items1 = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div>4</div>
      </div>
    `);

      items1 = [{ i: 2 }];
      items2 = [{ i: 5 }, { i: 6 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>2</div>
        <div>5</div>
        <div>6</div>
      </div>
    `);
    });

    test("start one emtpy ", () => {
      items1 = [];
      items2 = [{ i: 3 }, { i: 4 }];
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <div>3</div>
        <div>4</div>
      </div>
    `);

      items2 = [{ i: 4 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>4</div>
      </div>
    `);

      items1 = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>2</div>
        <div>4</div>
      </div>
    `);

      items1 = [];
      items2 = [];
      component.update();
      expect(component).toRender(`
      <div>
      </div>
    `);

      items1 = [{ i: 1 }, { i: 2 }];
      items2 = [{ i: 5 }, { i: 3 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>1</div>
        <div>2</div>
        <div>5</div>
        <div>3</div>
      </div>
    `);
    });
  });

  describe.each(permutations)("Mix repeaters and conditional (%s)", (_, keyed) => {
    let items1, items2, showA, showB, showC, showD;
    const Container = keyed
      ? () => (
          <div>
            <span if={showA}>A</span>
            <span if={showB}>B</span>
            <Child.repeat items={items1} key="i" />
            <span if={showC}>C</span>
            <Child.repeat items={items2} key="i" />
            <span if={showD}>D</span>
          </div>
        )
      : () => (
          <div>
            <span if={showA}>A</span>
            <span if={showB}>B</span>
            <Child.repeat items={items1} />
            <span if={showC}>C</span>
            <Child.repeat items={items2} />
            <span if={showD}>D</span>
          </div>
        );

    test("miscellaneous A", () => {
      items1 = [{ i: 1 }, { i: 2 }];
      items2 = [];
      showA = false;
      showB = true;
      showC = true;
      showD = true;
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <span>B</span>
        <div>1</div>
        <div>2</div>
        <span>C</span>
        <span>D</span>
      </div>
    `);

      items1 = [];
      items2 = [{ i: 4 }];
      showA = true;
      showB = true;
      showC = false;
      showD = false;
      component.update();
      expect(component).toRender(`
      <div>
        <span>A</span>
        <span>B</span>
        <div>4</div>
      </div>
    `);

      showA = false;
      showB = true;
      showC = true;
      showD = false;
      items1 = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <span>B</span>
        <div>1</div>
        <div>2</div>
        <span>C</span>
        <div>4</div>
      </div>
    `);

      showD = true;
      items1 = [];
      items2 = [{ i: 6 }, { i: 5 }];
      component.update();
      expect(component).toRender(`
      <div>
        <span>B</span>
        <span>C</span>
        <div>6</div>
        <div>5</div>
        <span>D</span>
      </div>
    `);
    });
  });

  describe.each(permutations)("Nested element as sibling (%s)", (_, keyed) => {
    let items;
    const Other = () => <div>hello</div>;
    const Container = keyed
      ? () => (
          <div>
            <Other />
            <Child.repeat items={items} key="i" />
          </div>
        )
      : () => (
          <div>
            <Other />
            <Child.repeat items={items} />
          </div>
        );

    test("start no items", () => {
      items = [];
      const component = testMount(Container);
      expect(component).toRender(`
      <div>
        <div>hello</div>
      </div>
    `);

      items = [{ i: 1 }, { i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      items = [{ i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>2</div>
      </div>
    `);
    });

    test("start with items", () => {
      items = [{ i: 1 }, { i: 2 }];
      const component = testMount(Container);
      expect(component).toRender(`
      <div>     
        <div>hello</div>
        <div>1</div>
        <div>2</div>
      </div>
    `);

      items = [];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
      </div>
      `);

      items = [{ i: 2 }];
      component.update();
      expect(component).toRender(`
      <div>
        <div>hello</div>
        <div>2</div>
      </div>
    `);
    });
  });
} else {
  test("at least one test", () => {
    expect(true).toBe(true);
  });
}

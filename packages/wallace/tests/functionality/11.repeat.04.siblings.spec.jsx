import { testMount } from "../utils";

/*

10+ because of keys
  each type of repeater:
    handles other repeaters before it
    handles conditional displays before it


    repeater is unaffected by conditionals before it
    repeater is unaffected by repeater before it

    Start visible / empty


  normal element before


*/

const Child = ({ i }) => <div>{i}</div>;
const permutations = [
  ["NonKeyed", 0],
  ["Keyed", 1]
];

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

///////////////////////////////

// const NonKeyed = ({ odds, evens, spanA, spanB, spanC, spanD }) => (
//   <div>
//     <span if={spanA}>A</span>
//     <span if={spanB}>B</span>
//     <Child.repeat items={odds} />
//     <span if={spanC}>C</span>
//     <span if={spanD}>D</span>
//     <Child.repeat items={evens} />
//   </div>
// );

// const Keyed = ({ odds, evens, spanA, spanB, spanC, spanD }) => (
//   <div>
//     <span if={spanA}>A</span>
//     <span if={spanB}>B</span>
//     <Child.repeat items={odds} key="i" />
//     <span if={spanC}>C</span>
//     <span if={spanD}>D</span>
//     <Child.repeat items={evens} key="i" />
//   </div>
// );

// const modifications = [
//   p => {
//     p.spanA = false;
//     p.spanB = false;
//   },
//   p => {
//     p.spanA = false;
//     p.spanB = false;
//   }
// ];

// describe.each([
//   ["NonKeyed", NonKeyed, [1, 2, 3]],
//   ["Keyed", Keyed, [4, 5, 6]]
// ])("%s", (_, Container, mods) => {
//   const initialProps = () => ({
//     odds: [{ i: 1 }, { i: 5 }],
//     evens: [{ i: 2 }, { i: 6 }],
//     spanA: true,
//     spanB: true,
//     spanC: true,
//     spanD: true
//   });

//   test("Repeater is unaffected by conditionals before it which start attached", () => {
//     expect(mods).toEqual([1, 22, 3]);
//     const props = initialProps();
//     const component = testMount(Container, props);
//     expect(component).toRender(`
//       <div>
//         <span>A</span>
//         <span>B</span>
//         <div>1</div>
//         <div>5</div>
//         <span>C</span>
//         <span>D</span>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);

//     props.spanA = false;
//     component.update();
//     expect(component).toRender(`
//       <div>
//         <span>B</span>
//         <div>1</div>
//         <div>5</div>
//         <span>C</span>
//         <span>D</span>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);

//     props.spanA = true;
//     props.spanB = true;
//     props.spanC = false;
//     props.spanD = false;
//     component.update();
//     expect(component).toRender(`
//       <div>
//         <span>A</span>
//         <span>B</span>
//         <div>1</div>
//         <div>5</div>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);

//     props.spanA = false;
//     props.spanB = true;
//     props.spanC = true;
//     props.spanD = false;
//     component.update();
//     expect(component).toRender(`
//       <div>
//         <span>B</span>
//         <div>1</div>
//         <div>5</div>
//         <span>C</span>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);
//   });

//   test("Repeater is unaffected by conditionals before it which start dettached", () => {
//     const props = initialProps();
//     props.spanA = false;
//     props.spanB = false;
//     props.spanC = true;
//     props.spanD = false;
//     const component = testMount(Container, props);
//     expect(component).toRender(`
//       <div>
//         <div>1</div>
//         <div>5</div>
//         <span>C</span>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);

//     props.spanA = false;
//     component.update();
//     expect(component).toRender(`
//       <div>
//         <span>B</span>
//         <div>1</div>
//         <div>5</div>
//         <span>C</span>
//         <span>D</span>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);

//     props.spanA = true;
//     props.spanB = true;
//     props.spanC = false;
//     props.spanD = false;
//     component.update();
//     expect(component).toRender(`
//       <div>
//         <span>A</span>
//         <span>B</span>
//         <div>1</div>
//         <div>5</div>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);

//     props.spanA = false;
//     props.spanB = true;
//     props.spanC = true;
//     props.spanD = false;
//     component.update();
//     expect(component).toRender(`
//       <div>
//         <span>B</span>
//         <div>1</div>
//         <div>5</div>
//         <span>C</span>
//         <div>2</div>
//         <div>6</div>
//       </div>
//     `);
//   });

// test("Repeater is unaffected by repeater before it", () => {
//   props.odds = [{ i: 2 }, { i: 6 }, { i: 8 }];
//   props.spanC = false;
//   component.update();
//   expect(component).toRender(`
//     <div>
//       <span>B</span>
//       <div>1</div>
//       <div>5</div>
//       <div>2</div>
//       <div>6</div>
//       <div>8</div>
//     </div>
// `);

//   props.evens = [{ i: 3 }];
//   props.spanA = true;
//   expect(component).toRender(`
//     <div>
//       <span>A</span>
//       <span>B</span>
//       <div>3</div>
//       <div>2</div>
//       <div>6</div>
//       <div>8</div>
//     </div>
// `);
// });

// -----------------------------------------------------------------

// test("Adding items works", () => {
//   const component = testMount(Container, [{ i: 5 }, { i: 2 }]);
//   expect(component).toRender(`
//     <div>
//       <div>5</div>
//       <div>2</div>
//     </div>
//   `);
//   component.render([{ i: 5 }, { i: 2 }, { i: 6 }]);
//   expect(component).toRender(`
//     <div>
//       <div>5</div>
//       <div>2</div>
//       <div>6</div>
//     </div>
//   `);
// });

// test("Removing items from start works", () => {
//   const component = testMount(Container, [{ i: 5 }, { i: 2 }, { i: 3 }, { i: 8 }]);
//   component.render([{ i: 2 }, { i: 8 }]);
//   expect(component).toRender(`
//     <div>
//       <div>2</div>
//       <div>8</div>
//     </div>
//   `);
// });

// test("Removing items inside works", () => {
//   const component = testMount(Container, [{ i: 5 }, { i: 2 }, { i: 3 }, { i: 8 }]);
//   component.render([{ i: 5 }, { i: 3 }, { i: 8 }]);
//   expect(component).toRender(`
//     <div>
//       <div>5</div>
//       <div>3</div>
//       <div>8</div>
//     </div>
//   `);
// });

// test("Complete replacement", () => {
//   const component = testMount(Container, [{ i: 5 }, { i: 2 }, { i: 3 }, { i: 8 }]);
//   component.render([{ i: 22 }, { i: 18 }]);
//   expect(component).toRender(`
//     <div>
//       <div>22</div>
//       <div>18</div>
//     </div>
//   `);
// });

// test("Reshuffle", () => {
//   const component = testMount(Container, [{ i: 7 }, { i: 5 }, { i: 6 }, { i: 2 }]);
//   component.render([{ i: 5 }, { i: 2 }, { i: 6 }, { i: 7 }]);
//   expect(component).toRender(`
//     <div>
//       <div>5</div>
//       <div>2</div>
//       <div>6</div>
//       <div>7</div>
//     </div>
//   `);
// });

// test("Multiple add and remove shorter", () => {
//   const component = testMount(Container, [
//     { i: 7 },
//     { i: 5 },
//     { i: 44 },
//     { i: 6 },
//     { i: 2 },
//     { i: 18 },
//     { i: 83 },
//     { i: 48 }
//   ]);
//   component.render([{ i: 2 }, { i: 7 }, { i: 11 }, { i: 8 }, { i: 23 }]);
//   expect(component).toRender(`
//     <div>
//       <div>2</div>
//       <div>7</div>
//       <div>11</div>
//       <div>8</div>
//       <div>23</div>
//     </div>
//   `);
// });

// test("Multiple add and remove longer", () => {
//   const component = testMount(Container, [{ i: 7 }, { i: 5 }, { i: 8 }]);
//   component.render([{ i: 2 }, { i: 7 }, { i: 11 }, { i: 8 }, { i: 5 }, { i: 23 }]);
//   expect(component).toRender(`
//     <div>
//       <div>2</div>
//       <div>7</div>
//       <div>11</div>
//       <div>8</div>
//       <div>5</div>
//       <div>23</div>
//     </div>
//   `);
// });

// test("Clear", () => {
//   const component = testMount(Container, [{ i: 2 }, { i: 5 }, { i: 8 }]);
//   component.render([]);
//   expect(component).toRender(`
//     <div>
//     </div>
//   `);
// });
// });

import { testMount } from "../utils";

describe("Conditional directive not allowed", () => {
  test("on root element", () => {
    const code = `
      const Foo = () => (
        <div if={showElement}>
          <span>Hello</span>
        </div>
      );
    `;
    expect(code).toCompileWithError("Cannot use 'if' on root element.");
  });

  test("on repeated element", () => {
    const code = `
      const Bar = () => (
        <span>Hello</span>
      )
      const Foo = () => (
        <div>
          <Bar.repeat if={true} />
        </div>
      );
    `;
    expect(code).toCompileWithError(
      'The "if" directive may not be used on repeated elements.'
    );
  });
});

describe("Conditional directive on element", () => {
  test.each([true, false])("when initalValue = %s", showElement => {
    const Foo = () => (
      <div>
        <span if={showElement}>Hello</span>
      </div>
    );
    const component = testMount(Foo);
    if (showElement) {
      expect(component).toRender(`
        <div>
          <span>Hello</span>
        </div>
      `);
    } else {
      expect(component).toRender(`
        <div></div>
      `);
    }
    showElement = !showElement;
    component.update();
    if (showElement) {
      expect(component).toRender(`
        <div>
          <span>Hello</span>
        </div>
      `);
    } else {
      expect(component).toRender(`
        <div></div>
      `);
    }
  });
});

describe.each([1, 2, 3, 4, 5])(
  "Multiple conditional elements under same element (%s)",
  permutation => {
    let Foo,
      showA = true,
      showB = false,
      showC = true,
      showD = true;

    const Span = text => <span>{text}</span>;

    if (wallaceConfig.flags.allowStubs) {
    } else {
      if (permutation > 3) return;
    }

    switch (permutation) {
      case 1:
        Foo = () => (
          <div>
            <span if={showA}>A</span>
            <span if={showB}>B</span>
            <hr />
            <Span.nest if={showC} props={"C"} />
            <span if={showD}>D</span>
          </div>
        );
        break;
      case 2:
        Foo = () => (
          <div>
            <Span.nest if={showA} props={"A"} />
            <Span.nest if={showB} props={"B"} />
            <hr />
            <span if={showC}>C</span>
            <span if={showD}>D</span>
          </div>
        );
        break;
      case 3:
        Foo = () => (
          <div>
            <Span.nest if={showA} props={"A"} />
            <Span.nest if={showB} props={"B"} />
            <hr />
            <span if={showC}>C</span>
            <Span.nest if={showD} props={"D"} />
          </div>
        );
        break;
      case 4:
        Foo = () => (
          <div>
            <stub.span if={showA} props={"A"} />
            <stub.span if={showB} props={"B"} />
            <hr />
            <span if={showC}>C</span>
            <stub.span if={showD} props={"D"} />
          </div>
        );
        break;
      case 5:
        Foo = () => (
          <div>
            <stub.span if={showA} props={"A"} />
            <stub.span if={showB} props={"B"} />
            <hr />
            <span if={showC}>C</span>
            <span if={showD}>D</span>
          </div>
        );
        break;
    }

    if (wallaceConfig.flags.allowStubs) {
      Foo.stubs.span = text => <span>{text}</span>;
    }
    const component = testMount(Foo);

    test("have correct initial positions", () => {
      expect(component).toRender(`
      <div>
        <span>A</span>
        <hr>
        <span>C</span>
        <span>D</span>
      </div>
    `);
    });

    test("inserts at correct position", () => {
      showB = true;
      component.update();
      expect(component).toRender(`
      <div>
        <span>A</span>
        <span>B</span>
        <hr>
        <span>C</span>
        <span>D</span>
      </div>
    `);
    });

    test("adjusts insertion position based on removed elements", () => {
      showA = false;
      showB = true;
      showC = false;
      showD = true;
      component.update();
      expect(component).toRender(`
      <div>
        <span>B</span>
        <hr>
        <span>D</span>
      </div>
    `);
      showC = true;
      component.update();
      expect(component).toRender(`
      <div>
        <span>B</span>
        <hr>
        <span>C</span>
        <span>D</span>
      </div>
    `);
      showA = true;
      component.update();
      expect(component).toRender(`
      <div>
        <span>A</span>
        <span>B</span>
        <hr>
        <span>C</span>
        <span>D</span>
      </div>
    `);
    });

    test("can remove and add all", () => {
      showA = false;
      showB = false;
      showC = false;
      showD = false;
      component.update();
      expect(component).toRender(`
      <div>
        <hr>
      </div>
    `);
      showA = true;
      showB = true;
      showC = true;
      showD = true;
      component.update();
      expect(component).toRender(`
      <div>
        <span>A</span>
        <span>B</span>
        <hr>
        <span>C</span>
        <span>D</span>
      </div>
    `);
    });
  }
);

describe("Multiple conditional elements under different elements", () => {
  let showA = true;
  let showB = false;
  let showC = true;
  let showD = true;
  const Foo = () => (
    <div>
      <div>
        <span if={showA}>A</span>
        <span if={showB}>B</span>
      </div>
      <div>
        <span if={showC}>C</span>
        <span if={showD}>D</span>
      </div>
    </div>
  );
  const component = testMount(Foo);

  test("do not interfere with one another", () => {
    component.update();
    expect(component).toRender(`
      <div>
        <div>
          <span>A</span>
        </div>
        <div>
          <span>C</span>
          <span>D</span>
        </div>
      </div>
    `);

    showB = true;
    showC = false;
    component.update();
    expect(component).toRender(`
      <div>
        <div>
          <span>A</span>
          <span>B</span>
        </div>
        <div>
          <span>D</span>
        </div>
      </div>
    `);
  });
});

if (wallaceConfig.flags.allowRepeaterSiblings) {
  test("Conditional nodes after repeat", () => {
    let show = "ab";
    const Bar = i => <div>{i}</div>;
    let items = [];
    const Foo = () => (
      <div>
        <Bar.repeat items={items} />
        <div if={show.includes("a")}>a</div>
        <div if={show.includes("b")}>b</div>
      </div>
    );

    const component = testMount(Foo);
    expect(component).toRender(`
    <div>
      <div>a</div>
      <div>b</div>
    </div>
  `);

    show = "b";
    component.update();
    expect(component).toRender(`
    <div>
      <div>b</div>
    </div>
    `);

    show = "ab";
    component.update();
    expect(component).toRender(`
    <div>
      <div>a</div>
      <div>b</div>
    </div>
    `);

    items.push("fish", "chips");
    component.update();

    expect(component).toRender(`
    <div>
      <div>fish</div>
      <div>chips</div>
      <div>a</div>
      <div>b</div>
    </div>
    `);

    items.pop();
    component.update();

    expect(component).toRender(`
    <div>
      <div>fish</div>
      <div>a</div>
      <div>b</div>
    </div>
    `);

    show = "b";
    component.update();

    expect(component).toRender(`
    <div>
      <div>fish</div>
      <div>b</div>
    </div>
    `);

    show = "ab";
    items.push("salad");
    component.update();

    expect(component).toRender(`
    <div>
      <div>fish</div>
      <div>salad</div>
      <div>a</div>
      <div>b</div>
    </div>
    `);
  });

  test("Keys are not strings", () => {
    /**
     * Check for issue using integers as object keys, which are converted to strings.
     */
    let show = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const Foo = () => (
      <div>
        <div if={show.includes(1)}>1</div>
        <div if={show.includes(2)}>2</div>
        <div if={show.includes(3)}>3</div>
        <div if={show.includes(4)}>4</div>
        <div if={show.includes(5)}>5</div>
        <div if={show.includes(6)}>6</div>
        <div if={show.includes(7)}>7</div>
        <div if={show.includes(8)}>8</div>
        <div if={show.includes(9)}>9</div>
        <div if={show.includes(10)}>10</div>
        <div if={show.includes(11)}>11</div>
        <div if={show.includes(12)}>12</div>
      </div>
    );

    const component = testMount(Foo);
    expect(component).toRender(`
    <div>
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <div>4</div>
      <div>5</div>
      <div>6</div>
      <div>7</div>
      <div>8</div>
      <div>9</div>
      <div>10</div>
      <div>11</div>
      <div>12</div>
    </div>
  `);

    show = [1, 2, 3, 4];
    component.update();
    expect(component).toRender(`
    <div>
      <div>1</div>
      <div>2</div>
      <div>3</div>
      <div>4</div>
    </div>
  `);

    show = [4, 5, 6, 7, 8, 9, 10, 11, 12];
    component.update();
    expect(component).toRender(`
    <div>
      <div>4</div>
      <div>5</div>
      <div>6</div>
      <div>7</div>
      <div>8</div>
      <div>9</div>
      <div>10</div>
      <div>11</div>
      <div>12</div>
    </div>
  `);
  });
}

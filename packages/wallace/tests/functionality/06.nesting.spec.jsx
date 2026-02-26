import { testMount } from "../utils";

describe("Specifying", () => {
  test("Disallow passing a litteral object as props", () => {
    const code = `
    const Animal = (animal) => <div>{animal.name}</div>;
    const AnimalList = () => (
      <div>
        <Animal props={{ name: "Fox" }} />
      </div>
    );
  `;
    expect(code).toCompileWithError(
      "Literal objects in placeholders not allowed as they will become constants."
    );
  });

  test("Disallow child nodes under nested component", () => {
    const code = `
    const Parent = () => (
      <div>
        <Child>
          <div>other stuff</div>
        </Child>
      </div>
    );
  `;
    expect(code).toCompileWithError("Nested components may not have child nodes.");
  });

  test("Disallow nesting on root", () => {
    const code = `
    const Parent = () => (
      <Child />
    );
  `;
    expect(code).toCompileWithError("Nested components not allowed as root element.");
  });

  test("Disallow regular attributes", () => {
    const code = `
    const Parent = () => (
      <div>
        <Child id="foo"/>
      </div>
    );
  `;
    expect(code).toCompileWithError("Nested components do not allow regular attributes.");
  });
});

describe("Basic use", () => {
  test("Can nest component without props", () => {
    const Fox = () => <div>Fox</div>;
    const AnimalList = () => (
      <div>
        <Fox />
      </div>
    );
    const component = testMount(AnimalList);
    expect(component).toRender(`
    <div>
      <div>Fox</div>
    </div>
  `);
  });

  test("Can specify props", () => {
    const myProps = { name: "Fox" };
    const Animal = animal => <div class="animal">{animal.name}</div>;
    const AnimalList = () => (
      <div>
        <Animal props={myProps} />
      </div>
    );
    const component = testMount(AnimalList);
    expect(component).toRender(`
    <div>
      <div class="animal">
        Fox
      </div>
    </div>
  `);
  });

  if (wallaceConfig.flags.allowCtrl) {
    test("Can specify ctrl", () => {
      const Fox = (_, { ctrl }) => <div>Fox {ctrl}</div>;
      const AnimalList = () => (
        <div>
          <Fox ctrl={foxCtrl} />
        </div>
      );
      const foxCtrl = 6;
      const component = testMount(AnimalList);
      expect(component).toRender(`
        <div>
          <div>Fox <span>6</span></div>
        </div>
      `);
    });
  }
});

describe("Conditional display", () => {
  test("starting visible", () => {
    let show = true;
    const Fox = () => <div>Fox</div>;
    const AnimalList = () => (
      <div>
        <Fox if={show} />
      </div>
    );
    const component = testMount(AnimalList);
    expect(component).toRender(`
      <div>
        <div>Fox</div>
      </div>
    `);

    show = false;
    component.update();
    expect(component).toRender(`
      <div>
      </div>
    `);
  });

  test("starting hidden", () => {
    let show = false;
    const Fox = () => <div>Fox</div>;
    const AnimalList = () => (
      <div>
        <Fox if={show} />
      </div>
    );
    const component = testMount(AnimalList);
    expect(component).toRender(`
      <div>
      </div>
    `);
    show = true;
    component.update();
    expect(component).toRender(`
      <div>
        <div>Fox</div>
      </div>
    `);
  });
});

describe("Component", () => {
  test("is not created when initial state is hidden", () => {
    let show = false,
      created = 0;
    const Fox = () => <div>Fox</div>;
    Fox.prototype.render = function (props, ctrl) {
      created += 1;
    };
    const AnimalList = () => (
      <div>
        <Fox if={show} />
      </div>
    );
    const component = testMount(AnimalList);
    expect(component).toRender(`
      <div>
      </div>
    `);
    expect(created).toBe(0);
    show = true;
    component.update();
    expect(component).toRender(`
      <div>
        <div>Fox</div>
      </div>
    `);
    expect(created).toBe(1);
  });

  test("is reused", () => {
    let show = false,
      created = new Set();
    const Fox = () => <div>Fox</div>;
    Fox.prototype.render = function (props, ctrl) {
      created.add(this);
    };
    const AnimalList = () => (
      <div>
        <Fox if={show} />
      </div>
    );
    const component = testMount(AnimalList);
    expect(component).toRender(`
      <div>
      </div>
    `);
    expect(created.size).toBe(0);
    show = true;
    component.update();
    expect(component).toRender(`
      <div>
        <div>Fox</div>
      </div>
    `);
    expect(created.size).toBe(1);
    show = false;
    component.update();
    show = true;
    component.update();
    expect(component).toRender(`
      <div>
        <div>Fox</div>
      </div>
    `);

    expect(created.size).toBe(1);
  });

  if (wallaceConfig.flags.allowDismount) {
    test("is fetched from pool if available", () => {
      let show = false,
        created = new Set();

      const Fox = () => <div>Fox</div>;
      Fox.prototype.render = function () {
        created.add(this);
      };
      const AnimalList = () => (
        <div>
          <Fox if={show} />
        </div>
      );

      const fox = new Fox();
      fox.render();
      Fox.pool.push(fox);
      const component = testMount(AnimalList);
      expect(component).toRender(`
      <div>
      </div>
    `);
      expect(created.size).toBe(1);
      show = true;
      component.update();
      expect(component).toRender(`
      <div>
        <div>Fox</div>
      </div>
    `);
      expect(created.size).toBe(1);
      show = false;
      component.update();
      show = true;
      component.update();
      expect(component).toRender(`
      <div>
        <div>Fox</div>
      </div>
    `);

      expect(created.size).toBe(1);
    });
  }
});

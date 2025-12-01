import { testMount } from "../utils";

test("Can nest component without props", () => {
  const Fox = () => <div>Fox</div>;
  const AnimalList = () => (
    <div>
      <Fox.nest />
    </div>
  );
  const component = testMount(AnimalList);
  expect(component).toRender(`
    <div>
      <div>Fox</div>
    </div>
  `);
});

test("Disallow React style nesting", () => {
  const fox = { name: "Fox" };
  const code = `
    const Animal = (animal) => <div>{animal.name}</div>;
    const AnimalList = () => (
      <div>
        <Animal props={fox} />
      </div>
    );
  `;
  expect(code).toCompileWithError(
    "Nest components using <Name.nest /> or <Name.repeat />."
  );
});

test("Disallow passing a litteral object as props", () => {
  const code = `
    const Animal = (animal) => <div>{animal.name}</div>;
    const AnimalList = () => (
      <div>
        <Animal.nest props={{ name: "Fox" }} />
      </div>
    );
  `;
  expect(code).toCompileWithError(
    "Literal objects in placeholders not allowed as they will become constants."
  );
});

test("Can nest component with props variable", () => {
  const fox = { name: "Fox" };
  const Animal = animal => <div>{animal.name}</div>;
  const AnimalList = () => (
    <div>
      <Animal.nest props={fox} />
    </div>
  );
  const component = testMount(AnimalList);
  expect(component).toRender(`
    <div>
      <div>
        Fox
      </div>
    </div>
  `);
});

test("Disallow child nodes under nested component", () => {
  const code = `
    const Parent = () => (
      <div>
        <Child.nest>
          <div>other stuff</div>
        </Child.nest>
      </div>
    );
  `;
  expect(code).toCompileWithError("Nested component may not have child nodes.");
});

test("Disallow nesting on root", () => {
  const code = `
    const Parent = () => (
      <Child.nest />
    );
  `;
  expect(code).toCompileWithError("Nested component not allowed on root element.");
});

import { testMount } from "../utils";

describe("Specification", () => {
  test("refs doesn' allow expression", () => {
    const src = `
    const A = () => (
    <div>
      <span ref={foo}>Otter</span>
    </div>
  );
  `;
    expect(src).toCompileWithError(
      "The `ref` directive value must be of type null. Found: expression."
    );
  });

  test("refs not allowed on repeat", () => {
    const src = `
    const A = () => (
    <div>
      <Foo.repeat ref:a props={[]}/>
    </div>
  );
  `;
    expect(src).toCompileWithError(
      "The `ref` directive may not be used on repeated elements."
    );
  });

  // TODO: ensure ref syntax used correctly, and not allowed on repeat.

  test("Multiple refs with same name not allowed", () => {
    const src = `
    const A = () => (
    <div>
      <span ref:a>Otter</span>
      <span ref:a>Swan</span>
    </div>
  );
  `;
    expect(src).toCompileWithError("Refs must be unique within each component.");
  });
});

test("Ref on element points to element", () => {
  const A = () => (
    <div>
      <span class="danger" ref:a>
        hello
      </span>
    </div>
  );
  const component = testMount(A);
  expect(component.ref.a).toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.a.className).toBe("danger");
});

test("Ref on nested component points to nester", () => {
  const A = () => <span class="danger">hello</span>;
  const B = () => (
    <div>
      <A ref:a />
    </div>
  );
  const component = testMount(B);
  expect(component.ref.a).not.toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.a.get().el.className).toBe("danger");
});

test("Multiple refs allowed", () => {
  const A = () => (
    <div>
      <span class="danger" ref:a>
        hello
      </span>
      <span class="warning" ref:b>
        hello
      </span>
    </div>
  );
  const component = testMount(A);
  expect(component.ref.a).toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.b).toBeInstanceOf(HTMLSpanElement);
  expect(component.ref.a.className).toBe("danger");
  expect(component.ref.b.className).toBe("warning");
});

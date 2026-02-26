import { testMount } from "../utils";

describe("key directive", () => {
  test("not allowed on non-repeated component", () => {
    const code = `
      const Bar = () => (
        <div>
          <Foo key="foo" />
        </div>
      )
    `;
    expect(code).toCompileWithError(
      "The `key` directive may not be used on nested elements."
    );
  });
});

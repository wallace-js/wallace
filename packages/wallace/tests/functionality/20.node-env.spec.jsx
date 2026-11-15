/*
The plugin replaces process.env.NODE_ENV in wallace's lib files with its value at
compile time, and removes branches which that decides.
*/
import { transform } from "@babel/core";
import wallacePlugin from "babel-plugin-wallace";

const compileLib = code =>
  transform(code, {
    filename: "/app/node_modules/wallace/lib/test.js",
    configFile: false,
    babelrc: false,
    plugins: [wallacePlugin]
  }).code;

const code = `
  if (process.env.NODE_ENV !== "production") {
    devOnly();
  } else {
    prodOnly();
  }
  const env = process.env.NODE_ENV;
`;

describe("NODE_ENV in lib files", () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    if (original === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = original;
    }
  });

  test("keeps development code when not production", () => {
    process.env.NODE_ENV = "development";
    const output = compileLib(code);
    expect(output).toContain("devOnly()");
    expect(output).not.toContain("prodOnly()");
    expect(output).toContain(`const env = "development"`);
  });

  test("removes development code in production", () => {
    process.env.NODE_ENV = "production";
    const output = compileLib(code);
    expect(output).not.toContain("devOnly()");
    expect(output).toContain("prodOnly()");
    expect(output).toContain(`const env = "production"`);
  });

  test("is left for the bundler when not set", () => {
    delete process.env.NODE_ENV;
    const output = compileLib(code);
    expect(output).toContain(`process.env.NODE_ENV !== "production"`);
    expect(output).toContain("const env = process.env.NODE_ENV");
  });

  test("is not replaced outside lib files", () => {
    process.env.NODE_ENV = "production";
    const output = transform(code, {
      filename: "/app/src/index.js",
      configFile: false,
      babelrc: false,
      plugins: [wallacePlugin]
    }).code;
    expect(output).toContain(`process.env.NODE_ENV !== "production"`);
  });
});

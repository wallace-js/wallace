const { flags } = require("../packages/wallace/flags.cjs");
const { directives } = require("./src/config.js");

module.exports = {
  plugins: [["babel-plugin-wallace", { flags, directives }], "@babel/plugin-syntax-jsx"],
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        modules: false,
        targets: {
          browsers: ["last 1 chrome versions"]
        }
      }
    ]
  ]
};

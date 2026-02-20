const { flags } = require("../packages/wallace/flags.cjs");
const { directives } = require("./src/config.js");

module.exports = {
  plugins: [["babel-plugin-wallace", { flags, directives }], "@babel/plugin-syntax-jsx"]
};

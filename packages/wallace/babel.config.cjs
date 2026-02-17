/**
 * Mainly used for running files through babel directly to see output.
 */

const { flags } = require("./flags.cjs");

module.exports = {
  plugins: [["babel-plugin-wallace", { flags }], "@babel/plugin-syntax-jsx"]
};

/**
 * Mainly used for running files through babel directly to see output.
 */

const { flags } = require("./flags.cjs");
const options = { flags };

module.exports = {
  plugins: [["babel-plugin-wallace", options], "@babel/plugin-syntax-jsx"]
};

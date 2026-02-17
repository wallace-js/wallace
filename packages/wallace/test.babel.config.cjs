const { Directive } = require("babel-plugin-wallace");
const { flags } = require("./flags.cjs");

/**
 * Custom directive that we can use for testing.
 *
 * This code is executed during compilation of test files, so inspecting console calls
 * in tests or accessing globals won't work. Instead we set attributes.
 */
class TestDirectiveInConfig extends Directive {
  static attributeName = "test-directive";
  static allowNull = true;
  static allowString = true;
  static allowQualifier = true;
  apply(node, value, qualifier, base) {
    node.addFixedAttribute("value-value", value.value);
    node.addFixedAttribute("value-expression", value.expression);
    node.addFixedAttribute("qualifier", qualifier);
    node.addFixedAttribute("base", base);
  }
}

/**
 * Jest requires modern JS to be translated with "@babel/preset-env".
 */
module.exports = {
  presets: ["@babel/preset-env"],
  plugins: [
    [
      "babel-plugin-wallace",
      {
        directives: [TestDirectiveInConfig],
        flags
      }
    ],
    "@babel/plugin-syntax-jsx"
  ]
};

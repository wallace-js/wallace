const { Directive } = require("babel-plugin-wallace");

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

function cmdToggle(name) {
  const value = process.env[name];
  switch (String(value).toLowerCase()) {
    case "true":
    case "1":
    case "yes":
    case "y":
      return true;
    default:
      return false;
  }
}

const options = {
  directives: [TestDirectiveInConfig]
};

if (cmdToggle("ALL_FLAGS_OFF")) {
  console.log("RUNNING WITHOUT FLAGS");
  options.flags = {};
} else {
  console.log("RUNNING WITH FLAGS");
}

/**
 * Jest requires modern JS to be translated with "@babel/preset-env".
 */
module.exports = {
  presets: ["@babel/preset-env"],
  plugins: [["babel-plugin-wallace", options], "@babel/plugin-syntax-jsx"]
};

/**
 * This file sets babel plugins and presets.
 *
 * You can disable presets by setting environment variables to a truthy value:
 *   NO_PRESET_ENV=1
 *   NO_PRESET_TYPESCRIPT=true
 *
 * See `playground/package.json` and `babel-plugin-wallace/README.md`.
 */

const { directives, flags } = require("./src/config.js");

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

const toggles = {
  NO_PRESET_ENV: [
    "@babel/preset-env",
    {
      targets: {
        // browsers: ["last 1 chrome versions"]
      },
      modules: false
    }
  ],
  NO_PRESET_TYPESCRIPT: "@babel/preset-typescript"
};
const presets = [];

for (const [key, value] of Object.entries(toggles)) {
  if (!cmdToggle(key)) {
    presets.push(value);
  }
}

console.log("Active presets (to disable, see babel.config.cjs):", presets);

module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        directives,
        flags
      }
    ],
    "@babel/plugin-syntax-jsx"
  ],
  presets: presets
};

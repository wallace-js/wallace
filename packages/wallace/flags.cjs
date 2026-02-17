/**
 * This picks up environment variables to toggle flags on and off.
 *
 * By default all flags are toggled on, but you can use the following vars:
 *
 *   ALL_FLAGS_OFF=1
 *   ONE_FLAG_ON=allowStubs      # All flags disabled except supplied
 *   ONE_FLAG_OFF=allowStubs     # All flags enabled except supplied
 */
const { wallaceConfig } = require("babel-plugin-wallace");
let flags, oneFlag;

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

if (cmdToggle("ALL_FLAGS_OFF")) {
  console.log("RUNNING WITHOUT FLAGS");
  flags = {};
} else if ((oneFlag = process.env["ONE_FLAG_ON"])) {
  flags = { [oneFlag]: true };
} else if ((oneFlag = process.env["ONE_FLAG_OFF"])) {
  flags = wallaceConfig
    .allFLags()
    .reduce((acc, flagName) => ({ ...acc, [flagName]: true }), {});
  flags[oneFlag] = false;
} else {
  console.log("RUNNING WITH FLAGS");
}

a = 4 / 0;
module.exports = {
  flags
};

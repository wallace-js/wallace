let flags;

if (cmdToggle("ALL_FLAGS_OFF")) {
  console.log("RUNNING WITHOUT FLAGS");
  flags = {};
} else {
  console.log("RUNNING WITH FLAGS");
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

module.exports = {
  flags
};

/*
Releases a new version of the packages:

  npm run publish

1. Checks you're logged in to npm, and on an up to date, clean master.
2. Runs `lerna version`, which prompts for the version, then bumps it, commits, tags
   and pushes. It doesn't contact npm, so can't fail on authentication.
3. Runs publish-packages.js, which publishes each package with `npm publish`. If that
   fails, run `npm run publish:packages` to retry. There is nothing to undo.
*/
const { execSync, spawnSync } = require("child_process");
const path = require("path");

const repoDir = path.resolve(__dirname, "..");

const capture = cmd =>
  execSync(cmd, {
    cwd: repoDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();

const run = (cmd, args) =>
  spawnSync(cmd, args, { cwd: repoDir, stdio: "inherit" }).status;

const fail = message => {
  console.error(`\n${message}\n`);
  process.exit(1);
};

// 1. Checks, before anything is changed.

let user;
try {
  user = capture("npm whoami");
} catch (e) {
  fail("You aren't logged in to npm. Run `npm login`, then try again.");
}

if (capture("git branch --show-current") !== "master") {
  fail("Releases are made from master. Check it out, then try again.");
}

if (capture("git status --porcelain --untracked-files=no")) {
  fail("You have uncommitted changes. Commit or stash them, then try again.");
}

try {
  capture("git fetch origin master");
} catch (e) {
  fail("Couldn't fetch from origin to check master is up to date.");
}
if (capture("git rev-list --count HEAD..origin/master") !== "0") {
  fail("master is behind origin/master. Pull, then try again.");
}

console.log(`
Logged in to npm as ${user}. This will:

  1. Prompt for the new version, then commit, tag and push it (lerna version).
  2. Publish babel-plugin-wallace then wallace with npm publish. npm may open your
     browser to confirm 2FA for each.

If step 2 fails, nothing needs to be undone. Run \`npm run publish:packages\` to retry.
`);

// 2. Version, commit, tag and push.

const before = capture("git rev-parse HEAD");
if (run("npx", ["lerna", "version", "--no-private"]) !== 0) {
  fail("lerna version didn't complete, so nothing was published.");
}
// Lerna exits normally if you decline its confirmation prompt.
if (capture("git rev-parse HEAD") === before) {
  fail("No new version was made, so nothing was published.");
}

// 3. Publish.

process.exit(run("node", [path.join(__dirname, "publish-packages.js")]));

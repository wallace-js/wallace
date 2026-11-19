/*
Publishes the packages at the current commit to npm, skipping any versions which are
already published, so it is safe to run again if it fails part way.

This is the second step of `npm run publish`, and can be run on its own with:

  npm run publish:packages

It uses `npm publish` rather than Lerna, as npm handles 2FA by opening the browser
(e.g. for a passkey), whereas Lerna can only prompt for a one-time password. Unlike
`lerna publish`, it also doesn't modify any files, so a failure leaves nothing to undo.

Pass --dry-run to check what would happen without publishing.
*/
const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// The plugin goes first, as wallace depends on it.
const PACKAGES = ["babel-plugin-wallace", "wallace"];
const repoDir = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const capture = cmd =>
  execSync(cmd, {
    cwd: repoDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();

const fail = message => {
  console.error(`\n${message}\n`);
  process.exit(1);
};

const isPublished = (name, version) => {
  try {
    return capture(`npm view ${name}@${version} version`) === version;
  } catch (e) {
    return false;
  }
};

const versions = PACKAGES.map(
  name =>
    JSON.parse(fs.readFileSync(path.join(repoDir, "packages", name, "package.json")))
      .version
);
const tags = capture("git tag --points-at HEAD").split("\n");
if (!tags.includes(`v${versions[0]}`)) {
  fail(
    `The current commit isn't tagged v${versions[0]}, so it isn't a release.\n` +
      "Check out the release tag, or run `npm run publish` to make a new release."
  );
}

PACKAGES.forEach((name, i) => {
  const version = versions[i];
  if (isPublished(name, version)) {
    console.log(`${name}@${version} is already published, skipping.`);
    return;
  }
  console.log(
    `\nPublishing ${name}@${version}. npm may open your browser to confirm 2FA.`
  );
  const args = ["publish", "-w", name, ...(dryRun ? ["--dry-run"] : [])];
  const result = spawnSync("npm", args, { cwd: repoDir, stdio: "inherit" });
  if (result.status !== 0) {
    fail(
      `Publishing ${name}@${version} failed. Nothing needs to be undone:\n` +
        "the release is committed and tagged, and no files were changed.\n" +
        "Fix the problem (e.g. run `npm login`), then run `npm run publish:packages` to retry."
    );
  }
});

console.log(dryRun ? "\nDry run complete." : "\nAll packages are published.");

/*
Checks that Wallace can be installed and used as a user would, by packing wallace and
babel-plugin-wallace as they would be published, and installing them into a copy of
this app outside the repo. A copy is needed as Node would otherwise find the packages
in the repo's node_modules, which would hide missing files or dependencies.
*/
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const canaryDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(canaryDir, "..");
const appFiles = [
  "src",
  "babel.config.cjs",
  "index.html",
  "package.json",
  "tsconfig.json",
  "webpack.config.js"
];

const run = (cmd, cwd) => {
  console.log(`\n$ ${cmd}`);
  return execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" });
};

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wallace-canary-"));
const appDir = path.join(tmpDir, "app");
try {
  const packed = JSON.parse(
    run(
      `npm pack -w wallace -w babel-plugin-wallace --json --pack-destination "${tmpDir}"`,
      repoDir
    )
  );
  const tarballs = packed.map(p => `"${path.join(tmpDir, p.filename)}"`).join(" ");

  fs.mkdirSync(appDir);
  for (const file of appFiles) {
    fs.cpSync(path.join(canaryDir, file), path.join(appDir, file), { recursive: true });
  }

  run(`npm install --no-audit --no-fund ${tarballs}`, appDir);
  run("npx tsc --noEmit", appDir);
  run("NODE_ENV=production npx webpack --fail-on-warnings", appDir);
  run("NODE_ENV=development npx webpack --fail-on-warnings", appDir);
  console.log("\nCanary passed.");
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

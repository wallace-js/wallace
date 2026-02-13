/*

This script extracts data from the js-framework-benchmark results that you must have
run locally first in that repo:

```
cd webdriver-ts
npm run bench non-keyed/lit non-keyed/wallace ...
npm run results
```

Then call this script:

```
node scripts/benchmarks.js /code/js-framework-benchmark/webdriver-ts/results non-keyed/wallace
```

Then run the demo to see the charts:

```
cd examples/charts
npm start
```

*/
const path = require("path");
const fs = require("fs");

/*
Files look like:
  results/wallace-v0.3.0-non-keyed_02_replace1k.json

Extracts and returns this part:
  wallace-v0.3.0
*/
function extractFrameworkString(filename) {
  const splitOn = filename.includes("non-keyed") ? "non-keyed" : "keyed";
  return splitOn + "/" + filename.split(splitOn)[0].slice(0, -1);
}

function extractValue(json, test) {
  switch (test) {
    case "run1k":
      return json.values.total.median;
    case "size-compressed":
      return json.values.DEFAULT.median;
  }
}

/*
Returns:

  { 
    'non-keyed/wallace-v0.0.7': { run1k: 62, 'size-compressed': 2.5},
    ...
  }
 */
function collectData() {
  const collectedData = {};
  const results_dir = path.resolve(RESULTS_DIR);
  const files = fs.readdirSync(results_dir);
  tests.forEach(test => {
    const filenameEnd = `${test}.json`;
    const filesForTest = files.filter(file => file.endsWith(filenameEnd));
    filesForTest.forEach(filename => {
      const frameworkInfo = extractFrameworkString(filename);
      const filepath = path.join(results_dir, filename);
      const data = fs.readFileSync(filepath, "utf8");
      const json = JSON.parse(data);
      if (!collectedData.hasOwnProperty(frameworkInfo)) {
        collectedData[frameworkInfo] = {};
      }
      collectedData[frameworkInfo][test] = extractValue(json, test);
    });
  });
  return collectedData;
}

/*
Returns:

  {
    "non-keyed/wallace": {
      '0.3.0': { run1k: 59.9, 'size-compressed': 2.4 }
    }
    ...
  }
*/
function groupData(collectedData) {
  const regex = /-v[0-9]/;
  const groupedData = {};
  for (const [key, value] of Object.entries(collectedData)) {
    const index = key.search(regex);
    const frameworkName = index === -1 ? key : key.slice(0, index);
    const frameworkVersion = index === -1 ? "N/A" : key.slice(index + 2);
    if (!groupedData.hasOwnProperty(frameworkName)) {
      groupedData[frameworkName] = {};
    }
    groupedData[frameworkName][frameworkVersion] = value;
  }
  return groupedData;
}

/*
Flattens, filters and renames it to this:
{
  wallace: {version: '0.3.0', 'run1k: 59.9, 'size-compressed': 2.4}}
  ...
}
*/
function flattenAndFilter(groupedData) {
  const newData = {};
  for (const [key, value] of Object.entries(groupedData)) {
    if (frameworksToUse.hasOwnProperty(key)) {
      const framework = frameworksToUse[key];
      const versions = Object.keys(value).sort();
      const latest = versions[versions.length - 1];
      newData[framework] = {
        version: latest,
        ...value[latest]
      };
    }
  }
  return newData;
}

function dumpData(data) {
  const filename = path.join(__dirname, "../examples/charts/benchmark-data.json");
  fs.writeFile(filename, JSON.stringify(data, null, 2), err => {
    if (err) throw err;
    console.log(`SUCCESS. File saved to ${filename}`);
  });
}

function main() {
  const collectedData = collectData();
  const groupedData = groupData(collectedData);
  const flattenedData = flattenAndFilter(groupedData);
  for (const [target, framework] of Object.entries(frameworksToUse)) {
    if (!flattenedData.hasOwnProperty(framework)) {
      console.log(`ERROR. No data found for ${target}`);
      process.exit(1);
    }
  }
  dumpData(flattenedData);
}

const RESULTS_DIR = process.argv[2];
const WALLACE_IMPLEMENTATION = process.argv[3]; // e.g. "wallace_xyz"
const tests = ["run1k", "size-compressed"];

const frameworksToUse = {
  "keyed/angular-ngfor": "angular",
  "keyed/solid": "solid",
  "keyed/react-hooks": "react",
  "non-keyed/inferno": "inferno",
  "non-keyed/lit": "lit",
  "non-keyed/riot": "riot",
  "non-keyed/svelte-classic": "svelte",
  "non-keyed/vue": "vue"
};
frameworksToUse[WALLACE_IMPLEMENTATION] = "wallace";

main();

/*
This tests typescript integration by compiling the .tsx files in this directory and
expecting an error or not.
Files which expect an error state so with a line in the following format at the start
of the file:

//@<line_no> <typescript_error_message>

For example:

//@25 TS2741: Property 'clicks' is missing in type 'Props[]' but required in type 'Props'.

Files which do not specify such a line are expected to pass. Additionally they may not
have inline comments, to avoid the risk of a badly formatted line.
*/
import { splitOnce } from "../utils";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const isTsx = (file) => file.endsWith(".tsx");
const tsxFiles = fs.readdirSync(__dirname).filter(isTsx);
const tsxFilesWithErrors = [];
const tsxFilesWithoutErrors = [];

tsxFiles.forEach((fileName) => {
  const content = fs.readFileSync(path.resolve(__dirname, fileName), "utf8");
  let errorCommentLine;
  content.split(/\r?\n/).forEach((line) => {
    if (line.startsWith("//@")) {
      if (errorCommentLine) {
        throw new Error(`Only allowed one comment in ${fileName}`);
      }
      errorCommentLine = line;
    }
  });
  if (errorCommentLine) {
    const [errorChunk, errorMessage] = splitOnce(errorCommentLine, " ");
    const lineNo = parseInt(errorChunk.substring(3));
    if (isNaN(lineNo)) {
      throw new Error(
        `Invalid format number in ${errorChunk} must be like "//@25"`
      );
    }
    tsxFilesWithErrors.push({ fileName, lineNo, errorMessage });
  } else {
    tsxFilesWithoutErrors.push({ fileName });
  }
});

const tscCmd = (name) => {
  const file = path.resolve(__dirname, name);
  return `tsc --jsx preserve ${file} --noEmit`;
};

test.each(tsxFilesWithoutErrors)(
  "Expect no error in $fileName",
  ({ fileName }, done) => {
    exec(tscCmd(fileName), (err, stdout) => {
      if (err) {
        done(stdout);
      } else {
        done();
      }
    });
  }
);

test.each(tsxFilesWithErrors)(
  "Expect error in $fileName",
  ({ fileName, lineNo, errorMessage }, done) => {
    exec(tscCmd(fileName), (err, stdout) => {
      if (err) {
        const [path, rest] = splitOnce(stdout, ":");
        const foundLine = splitOnce(splitOnce(path, "(")[1], ",")[0];
        const foundMessage = splitOnce(rest, "\n")[0].trim();
        if (errorMessage != foundMessage) {
          done(
            `Expected error:\n    ${errorMessage}\nbut found:\n    ${foundMessage}`
          );
        } else if (foundLine != lineNo) {
          done(
            `Expected error on line ${lineNo} but it appeared on line ${foundLine}.`
          );
        } else {
          done();
        }
      } else {
        done(`Expected error on line ${lineNo}: ${errorMessage}`);
      }
    });
  }
);

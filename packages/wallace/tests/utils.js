// Don't import from "../../babel-plugin-wallace/dist" unless you want a ~20x slowdown!
import { transform } from "@babel/core";
import { JSDOM } from "jsdom";
import { prettyPrint } from "html";
import { diff } from "jest-diff";
import { Component, mount } from "../lib/index";
import * as ts from "typescript";

/**
 * Run the source code through tsc to find type errors.
 *
 * @param source a sample of source code
 * @param options compiler options
 * @returns an array of error messages
 */
function tsCompile(source, options) {
  const fileName = "module.tsx";

  const finalOptions = {
    ...options,
    jsx: ts.JsxEmit.Preserve,
    // noResolve: true, // do not load node_modules or follow imports
    skipLibCheck: true, // don't validate lib files
    types: [], // avoid @types auto-inclusion
    lib: [
      "lib.es2020.d.ts",
      // Must point to packages, not node_modules!
      "../../../packages/wallace/lib/types.d.ts"
    ]
  };

  const host = ts.createCompilerHost(finalOptions, true);

  const originalReadFile = host.readFile;
  const originalFileExists = host.fileExists;
  const originalGetSourceFile = host.getSourceFile;

  host.readFile = f => (f === fileName ? source : originalReadFile.call(host, f));
  host.fileExists = f => (f === fileName ? true : originalFileExists.call(host, f));

  host.getSourceFile = (f, langVersion, ...rest) => {
    if (f === fileName) {
      return ts.createSourceFile(f, source, langVersion, true);
    }
    return originalGetSourceFile.call(host, f, langVersion, ...rest);
  };

  const program = ts.createProgram([fileName], finalOptions, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  return diagnostics.map(d => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    if (d.file && typeof d.start === "number") {
      const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
      return `${d.file.fileName} (${line + 1},${character + 1}): ${message}`;
    }
    return message;
  });
}

const dom = new JSDOM();
dom.window.top === dom.window;
dom.reconfigure({ pretendToBeVisual: true });

/**
 * Returns a new div appended to the document body.
 */
function createDiv(id) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  if (id) {
    div.id = id;
  }
  return div;
}

/**
 * Mounts a component to the JSDOM.
 */
function testMount(cls, props, ctrl) {
  return mount(createDiv(), cls, props, ctrl);
}

/**
 * Strips extraneous whitespace from HTML.
 */
function stripHTML(htmlString) {
  return htmlString
    .replace(/\n/g, "")
    .replace(/[\t ]+\</g, " <")
    .replace(/\>[\t ]+$/g, "> ")
    .replace(/\>[\t ]+\</g, "><")
    .trim();
}

/**
 * Return tidy HTML so it can be meaningfully compared and prettily diffed.
 */
function tidyHTML(html) {
  return prettyPrint(stripHTML(html), { indent_size: 2 });
}

function splitOnce(s, on) {
  const [first, ...rest] = s.split(on);
  return [first, rest.length > 0 ? rest.join(on) : null];
}

function passMessage() {
  return "OK";
}

expect.extend({
  /**
   * Checks that a component's HTML is as expected.
   *
   * @param {Component} component A mounted Component.
   * @param {string} expectedHtml The expected HTML.
   *
   */
  toRender(component, expectedHtml) {
    const received = tidyHTML(component.el.outerHTML);
    const expected = tidyHTML(expectedHtml);
    const pass = received === expected;
    const failMessage = () => {
      const diffString = diff(expected, received, {
        expand: this.expand
      });
      return (
        this.utils.matcherHint(".toBe") +
        (diffString ? `\n\nDifference:\n\n${diffString}` : "")
      );
    };
    const message = pass ? passMessage : failMessage;
    return { actual: received, message, pass };
  },
  /**
   * Checks that the code compiles with specified error message.
   *
   * @param {string | object} codeOrConfig Either source code string, or object with code
   *  and options.
   *
   */
  toCompileWithoutError(code) {
    let errorMessage = null;
    try {
      transform(code);
    } catch (e) {
      console.debug(e.message);
      errorMessage = e.message.split("\n", 1)[0].substring("unknown file: ".length);
    }
    const pass = !errorMessage;
    const failMessage = () => {
      return `Compiled with error: ${errorMessage}`;
    };
    const message = pass ? passMessage : failMessage;
    return { actual: errorMessage, message, pass };
  },
  /**
   * Checks that the code compiles with specified error message.
   *
   * @param {string | object} codeOrConfig Either source code string, or object with code
   *  and options.
   * @param {string} errorMessage The first line of the expected error message.
   *
   */
  toCompileWithError(code, errorMessage) {
    let received = "NO ERROR - COMPILED OK";
    try {
      transform(code);
    } catch (e) {
      received = e.message.split("\n", 1)[0].substring("unknown file: ".length);
      if (received !== errorMessage) {
        console.debug(e);
      }
    }
    const pass = received === errorMessage;
    const failMessage = () => {
      const diffString = diff(errorMessage, received, {
        expand: this.expand
      });
      return (
        this.utils.matcherHint(".toBe") +
        (diffString ? `\n\nDifference:\n\n${diffString}` : "")
      );
    };
    const message = pass ? passMessage : failMessage;
    return { actual: received, message, pass };
  },
  toHaveTypeErrors(src, err1, err2, err3) {
    const errors = tsCompile(src);
    const expected = [err1, err2, err3].filter(Boolean);
    if (errors.length === 0) {
      return {
        pass: false,
        message: () => `Expected error "${errorMessage}" but no errors were thrown`
      };
    }
    console.log(expected);

    return {
      pass: false,
      message: () => `Expected error "${expected}" but no errors were thrown`
    };
  },
  toHaveNoTypeErrors(src) {
    const errors = tsCompile(src);
    if (errors.length === 0) {
      return { pass: true };
    } else {
      return {
        pass: false,
        message: () =>
          `Expected no errors but got ${errors.length}:\n\n` + errors.join("\n")
      };
    }
  }
});

module.exports = {
  createDiv,
  splitOnce,
  testMount,
  tidyHTML,
  transform
};

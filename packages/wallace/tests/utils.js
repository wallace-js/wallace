// Don't import from "../../babel-plugin-wallace/dist" unless you want a ~20x slowdown!
import { transform } from "@babel/core";
import { JSDOM } from "jsdom";
import { prettyPrint } from "html";
import { diff } from "jest-diff";
import { Component, mount } from "../lib/index";

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
        expand: this.expand,
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
      errorMessage = e.message
        .split("\n", 1)[0]
        .substring("unknown file: ".length);
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
  toCompileWithError(codeOrConfig, errorMessage) {
    const isConfig = typeof codeOrConfig === "object";
    const code = isConfig ? codeOrConfig.code : codeOrConfig;
    const options = isConfig ? codeOrConfig.options : {};
    const expected = errorMessage;
    let received = "NO ERROR - COMPILED OK";
    const transformOptions = {
      plugins: [["babel-plugin-wallace", options], "@babel/plugin-syntax-jsx"],
    };
    try {
      transform(code, transformOptions);
    } catch (e) {
      received = e.message.split("\n", 1)[0].substring("unknown file: ".length);
      if (received !== expected) {
        console.debug(e);
      }
    }
    const pass = received === expected;
    const failMessage = () => {
      const diffString = diff(expected, received, {
        expand: this.expand,
      });
      return (
        this.utils.matcherHint(".toBe") +
        (diffString ? `\n\nDifference:\n\n${diffString}` : "")
      );
    };
    const message = pass ? passMessage : failMessage;
    return { actual: received, message, pass };
  },
});

module.exports = {
  createDiv,
  splitOnce,
  testMount,
  tidyHTML,
  transform,
};

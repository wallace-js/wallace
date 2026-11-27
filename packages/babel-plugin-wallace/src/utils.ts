import { JSDOM } from "jsdom";

import * as t from "@babel/types";
import * as babel from "@babel/core";
import type { Expression, Statement } from "@babel/types";
import { WATCH_CALLBACK_ARGS } from "./constants";

const document = new JSDOM("<!DOCTYPE html>").window.document;

export function createElement(tagName: string): HTMLElement {
  return document.createElement(tagName);
}

export function createTextNode(text: string): Text {
  return document.createTextNode(text);
}

function isValidPropertyName(str) {
  return /^(?!\d)[\w$]+$/.test(str);
}

/**
 * HTML attributes whose DOM property has a different name. Users may write either in
 * JSX, and must get the same result whether the value is static or dynamic:
 *
 *   - Static values go into the template, so need the attribute name.
 *   - Dynamic values set a property, so need the property name.
 *
 * Without this, `<label htmlFor="x">` produces an `htmlfor` attribute and
 * `<label for={x}>` sets `element.for`, both of which silently do nothing.
 */
const ATTRIBUTE_TO_PROPERTY: Record<string, string> = {
  accesskey: "accessKey",
  class: "className",
  colspan: "colSpan",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  datetime: "dateTime",
  enterkeyhint: "enterKeyHint",
  for: "htmlFor",
  formaction: "formAction",
  formenctype: "formEnctype",
  formmethod: "formMethod",
  formnovalidate: "formNoValidate",
  formtarget: "formTarget",
  inputmode: "inputMode",
  ismap: "isMap",
  maxlength: "maxLength",
  minlength: "minLength",
  novalidate: "noValidate",
  readonly: "readOnly",
  referrerpolicy: "referrerPolicy",
  rowspan: "rowSpan",
  tabindex: "tabIndex",
  usemap: "useMap"
};

const PROPERTY_TO_ATTRIBUTE: Record<string, string> = Object.fromEntries(
  Object.entries(ATTRIBUTE_TO_PROPERTY).map(([att, prop]) => [prop, att])
);

/**
 * Returns the DOM property name for an attribute, e.g. `for` -> `htmlFor`.
 */
export function toPropertyName(attName: string): string {
  return ATTRIBUTE_TO_PROPERTY[attName.toLowerCase()] || attName;
}

/**
 * Returns the HTML attribute name for a property, e.g. `htmlFor` -> `for`.
 */
export function toAttributeName(name: string): string {
  return PROPERTY_TO_ATTRIBUTE[name] || name;
}

export function setAttributeCallback(attName: string): string {
  attName = toPropertyName(attName);
  return isValidPropertyName(attName)
    ? `${WATCH_CALLBACK_ARGS.element}.${attName} = ${WATCH_CALLBACK_ARGS.newValue}`
    : `${WATCH_CALLBACK_ARGS.element}.setAttribute('${attName}', ${WATCH_CALLBACK_ARGS.newValue})`;
}

const REGEX_CAPITALIZED = new RegExp(/^[A-Z].*/);

export function isCapitalized(s: string) {
  return REGEX_CAPITALIZED.test(s);
}

export function escapeSingleQuotes(text: string): string {
  return text.replace(/'/g, "\\'");
}

export function escapeDoubleQuotes(text: string): string {
  return text.replace(/"/g, '\\"');
}

/**
 * Strips extraneous whitespace from HTML
 */
export function stripHtml(htmlString: string): string {
  return htmlString
    .replace(/\n/g, "")
    .replace(/[\t ]+\</g, " <")
    .replace(/\>[\t ]+$/g, "> ")
    .replace(/\>[\t ]+\</g, "><")
    .trim();
}

export function arrayStartsWith(origin: Array<any>, test: Array<any>): boolean {
  if (origin.length >= test.length) {
    return false;
  }
  for (const [i, v] of origin.entries()) {
    if (test[i] !== v) {
      return false;
    }
  }
  return true;
}

export function codeToNode(code: string | Expression): Statement[] {
  const statement =
    typeof code === "string" ? babel.template.ast(code) : t.expressionStatement(code);
  if (statement instanceof Array) {
    return statement;
  }
  return [statement];
}

import { JSDOM } from "jsdom";

import * as t from "@babel/types";
import * as babel from "@babel/core";
import type { Expression, Statement } from "@babel/types";
import { IMPORTABLES, WATCH_CALLBACK_ARGS } from "./constants";

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
 * HTML attributes whose DOM property has a different name. Users must write the HTML
 * name in JSX (`for`, not `htmlFor`). Static values go into the template as is, and
 * dynamic values set the property, so `for={x}` becomes `element.htmlFor = x`.
 *
 * Any other spelling (`htmlFor`, `className`, `readOnly`, `Tabindex` etc.) is a compile
 * error, as it would otherwise fail silently in one of the two cases.
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
 * If `name` is a wrong spelling of an attribute in `ATTRIBUTE_TO_PROPERTY`, returns the
 * HTML name to use instead, e.g. `htmlFor` -> `for`, `readOnly` -> `readonly`.
 */
export function getHtmlAttributeName(name: string): string | undefined {
  if (PROPERTY_TO_ATTRIBUTE[name]) {
    return PROPERTY_TO_ATTRIBUTE[name];
  }
  const lower = name.toLowerCase();
  if (name !== lower && ATTRIBUTE_TO_PROPERTY[lower]) {
    return lower;
  }
}

/**
 * Returns the watch callback for a dynamic attribute, which calls `setAttr` from the
 * runtime. It sets the DOM property if the name allows it, otherwise the attribute, and
 * removes the attribute if the value is null or undefined.
 */
export function setAttributeCallback(attName: string): string {
  const { element, newValue } = WATCH_CALLBACK_ARGS;
  const propName = ATTRIBUTE_TO_PROPERTY[attName] || attName;
  const args = [element, `'${attName}'`, newValue];
  if (isValidPropertyName(propName)) {
    args.push(`'${propName}'`);
  }
  return `${IMPORTABLES.setAttr}(${args.join(", ")})`;
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

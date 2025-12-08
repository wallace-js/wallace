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

export function setAttributeCallback(attName: string): string {
  attName = attName === "class" ? "className" : attName;
  return `${WATCH_CALLBACK_ARGS.element}.${attName} = ${WATCH_CALLBACK_ARGS.newValue}`;
  // TODO: determine if non-standart att and use setAttribute() instead?
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

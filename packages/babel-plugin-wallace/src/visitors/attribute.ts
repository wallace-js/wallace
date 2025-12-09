import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { JSXAttribute } from "@babel/types";
import { wallaceConfig } from "../config";
import { DOM_EVENT_HANDLERS } from "../constants";
import { TagNode, NodeValue } from "../models";
import { ERROR_MESSAGES, error } from "../errors";
import { getPlaceholderExpression } from "../ast-helpers";

interface State {
  extractedNode: TagNode;
}

/**
 * Name could be:
 *  foo
 *  foo:bar
 */
function extractName(path: NodePath<JSXAttribute>): {
  base: string;
  qualifier: string | undefined;
} {
  const { name } = path.node;
  let base: string, qualifier: string | undefined;
  if (t.isJSXNamespacedName(name)) {
    base = name.namespace.name;
    qualifier = name.name.name;
  } else {
    base = name.name;
  }
  return { base, qualifier };
}

/**
 * Value could be:
 *
 *   foo
 *   foo="bar"
 *   foo={bar}
 */
function extractValue(path: NodePath<JSXAttribute>): NodeValue | undefined {
  const { value } = path.node;
  if (t.isStringLiteral(value)) {
    return { type: "string", value: value.value };
  } else if (t.isJSXExpressionContainer(value)) {
    const expression = getPlaceholderExpression(path, value.expression);
    if (expression) {
      return { type: "expression", expression: expression };
    }
  } else if (value === null) {
    return { type: "null" };
  } else {
    error(path, ERROR_MESSAGES.JSX_ELEMENTS_NOT_ALLOWED_IN_EXPRESSIONS);
  }
}

export const attributeVisitors = {
  JSXAttribute(path: NodePath<JSXAttribute>, { extractedNode }: State) {
    if (extractedNode.path.node !== path.parentPath.parentPath.node) {
      // We exit here as otherwise we'd traverse attributes of nested JSXElements too.
      return;
    }
    const { base, qualifier } = extractName(path);
    const extractedValue = extractValue(path);
    if (!extractedValue) {
      return;
    }

    const isEventHandler = DOM_EVENT_HANDLERS.includes(base.toLowerCase());
    const directiveClass = isEventHandler
      ? wallaceConfig.directives["on*"]
      : wallaceConfig.directives[base];
    if (directiveClass) {
      const handler = new directiveClass();
      handler.validate(extractedNode, extractedValue, qualifier, base);
      handler.apply(extractedNode, extractedValue, qualifier, base);
    } else {
      const attName = qualifier ? `${base}:${qualifier}` : base;
      switch (extractedValue.type) {
        case "expression":
          extractedNode.watchAttribute(attName, extractedValue.expression);
          break;
        case "string":
          extractedNode.addFixedAttribute(attName, extractedValue.value);
          break;
        case "null":
          extractedNode.addFixedAttribute(attName);
          break;
      }
    }
    path.remove();
  }
};

import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { Expression, JSXElement, JSXEmptyExpression } from "@babel/types";
import { ERROR_MESSAGES, error } from "./errors";

export function getJSXElementName(
  path: NodePath<JSXElement>
): string | { name: string; namespace: string } {
  const openingElementName = path.node.openingElement.name;
  if (t.isJSXIdentifier(openingElementName)) {
    return openingElementName.name;
  } else if (t.isJSXNamespacedName(openingElementName)) {
    const { namespace, name } = openingElementName;
    return { namespace: namespace.name, name: name.name };
  } else if (t.isJSXMemberExpression(openingElementName)) {
    const { object, property } = openingElementName;
    if (t.isJSXIdentifier(object)) {
      return { namespace: object.name, name: property.name };
    } else {
      error(path, ERROR_MESSAGES.ARROW_FUNCTION_NOT_ASSIGNED);
    }
  } else {
    console.debug(path.node);
    throw Error(`Can't read name from ${openingElementName}`);
  }
}

/**
 * An Expression can be one of dozens of types, most of which are not usable.
 */
export function getPlaceholderExpression(
  path: NodePath,
  expression: Expression | JSXEmptyExpression
): Expression | undefined {
  if (t.isJSXEmptyExpression(expression)) {
    // This is really to handle comments
    return undefined;
  } else if (t.isObjectExpression(expression)) {
    // The code is copied, so the object would be created afresh each time.
    error(path, ERROR_MESSAGES.PLACEHOLDER_MAY_NOT_BE_LITERAL_OBJECT);
  }
  return expression as Expression;
}

import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type {
  Expression,
  JSXElement,
  JSXAttribute,
  JSXEmptyExpression
} from "@babel/types";
import { NodeValue } from "./models";
import { ERROR_MESSAGES, error } from "./errors";
import { isCapitalized } from "./utils";

interface JSXElementData {
  type: "normal" | "nested" | "stub";
  repeat?: true;
  name: string;
}

/**
 * A JSXElement's openingElement can be several things:
 *
 *  <div                // A normal element
 *  <Foo                // A nested component
 *  <Foo.repeat         // A repeated component
 *  <stub.foo          // A nested stub
 *  <stub.foo.repeat   // A repeated stub
 *
 */
export function getJSXElementData(path: NodePath<JSXElement>): JSXElementData {
  const openingElementName = path.node.openingElement.name;
  if (t.isJSXNamespacedName(openingElementName)) {
    const { namespace, name } = openingElementName;
    return { type: "normal", name: `${namespace.name}:${name.name}` };
  } else if (t.isJSXIdentifier(openingElementName)) {
    const name = openingElementName.name;
    return { name, type: isCapitalized(name) ? "nested" : "normal" };
  } else if (t.isJSXMemberExpression(openingElementName)) {
    const { object, property } = openingElementName;
    if (t.isJSXIdentifier(object)) {
      // Means we have aaa.bbb
      if (isCapitalized(object.name)) {
        if (property.name === "repeat") {
          return { name: object.name, type: "nested", repeat: true };
        }
      } else {
        if (object.name === "stub") {
          return { name: property.name, type: "stub" };
        }
      }
    } else if (t.isJSXMemberExpression(object)) {
      // Means we have aaa.bbb.ccc
      const { object: subObject, property: subProperty } = object;
      if (
        t.isJSXIdentifier(subObject) &&
        subObject.name === "stub" &&
        property.name === "repeat"
      ) {
        return { name: subProperty.name, type: "stub", repeat: true };
      }
    }
  }
  error(path, ERROR_MESSAGES.INVALID_TAG_FORMAT);
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

/**
 * Builds a string concat Expression.
 */
export function buildConcat(parts: Expression[]): Expression {
  return parts.reduce(
    (left, right) => (left ? t.binaryExpression("+", left, right) : right),
    null
  );
}

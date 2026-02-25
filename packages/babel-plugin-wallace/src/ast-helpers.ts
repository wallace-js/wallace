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
 *  <stubs.foo          // A nested stub
 *  <stubs.foo.repeat   // A repeated stub
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
        if (object.name === "stubs") {
          return { name: property.name, type: "stub" };
        }
      }
    } else if (t.isJSXMemberExpression(object)) {
      // Means we have aaa.bbb.ccc
      const { object: subObject, property: subProperty } = object;
      if (
        t.isJSXIdentifier(subObject) &&
        subObject.name === "stubs" &&
        property.name === "repeat"
      ) {
        return { name: subProperty.name, type: "stub", repeat: true };
      }
    }
  }
  error(path, ERROR_MESSAGES.INVALID_TAG_FORMAT);
}

// export function getJSXElementName(
//   path: NodePath<JSXElement>
// ): string | { name: string; namespace: string } {
//   const openingElementName = path.node.openingElement.name;
//   console.log(path.node.openingElement);

//   if (t.isJSXIdentifier(openingElementName)) {
//     return openingElementName.name;
//   } else if (t.isJSXNamespacedName(openingElementName)) {
//     const { namespace, name } = openingElementName;
//     return { namespace: namespace.name, name: name.name };
//   } else if (t.isJSXMemberExpression(openingElementName)) {
//     const { object, property } = openingElementName;
//     if (t.isJSXIdentifier(object)) {
//       return { namespace: object.name, name: property.name };
//     } else {
//       error(path, ERROR_MESSAGES.ARROW_FUNCTION_NOT_ASSIGNED);
//     }
//   } else {
//     console.debug(path.node);
//     throw Error(`Can't read name from ${openingElementName}`);
//   }
// }

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

/**
 * Name could be:
 *  foo
 *  foo:bar
 */
export function extractAttributeName(path: NodePath<JSXAttribute>): {
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
export function extractAttributeValue(
  path: NodePath<JSXAttribute>
): NodeValue | undefined {
  const { value } = path.node;
  if (t.isStringLiteral(value)) {
    return { type: "string", value: value.value };
  } else if (t.isJSXExpressionContainer(value)) {
    const expression = getPlaceholderExpression(path, value.expression);
    if (expression) {
      return { type: "expression", expression: expression, path };
    }
  } else if (value === null) {
    return { type: "null" };
  } else {
    error(path, ERROR_MESSAGES.JSX_ELEMENTS_NOT_ALLOWED_IN_EXPRESSIONS);
  }
}

import type { NodePath } from "@babel/core";
import type { Function, BlockStatement, Expression } from "@babel/types";
import * as t from "@babel/types";

/**
 * Determines wether a function only returns the expected expression, either because its
 * explicitly returned, or because its an arrow function's only statement.
 */
function functionOnlyReturns(
  path: NodePath<Function>,
  test: (expr: Expression | BlockStatement) => boolean
): Expression | BlockStatement | undefined {
  const body = path.node.body;
  if (test(body)) {
    return body;
  }
  if (
    t.isBlockStatement(body) &&
    body.body.length === 1 &&
    t.isReturnStatement(body.body[0]) &&
    test(body.body[0].argument)
  ) {
    return body.body[0].argument;
  }
}

export function functionReturnsOnlyJSX(
  path: NodePath<Function>
): Expression | BlockStatement | undefined {
  return functionOnlyReturns(path, t.isJSXElement);
}

export function functionReturnsObjectWithJSX(
  path: NodePath<Function>
): Expression | BlockStatement | undefined {
  return functionOnlyReturns(path, (expr: Expression | BlockStatement) => {
    if (t.isObjectExpression(expr)) {
      expr as t.ObjectExpression;
      return (
        expr.properties.length > 0 &&
        expr.properties.every(
          (prop: t.ObjectProperty) =>
            t.isIdentifier(prop.key) && t.isJSXElement(prop.value)
        )
      );
    }
    return false;
  });
}

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

/**
 * Whether to include development-only code, such as component names. If NODE_ENV isn't
 * set we include it, as we can't leave the decision to the bundler.
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== "production";
}

const nameFromExpression = (node: t.Node): string | undefined => {
  if (t.isIdentifier(node)) {
    return node.name;
  }
  if (t.isMemberExpression(node) && !node.computed) {
    const object = nameFromExpression(node.object);
    if (object && t.isIdentifier(node.property)) {
      return `${object}.${node.property.name}`;
    }
  }
};

/**
 * Gets the name a component will be known by, from where its function is defined:
 *
 *   const Foo = () => ...          // Foo
 *   Foo.stub.bar = () => ...       // Foo.stub.bar
 *   { Foo: () => ... }             // Foo
 *   function Foo() { return ... }  // Foo
 */
export function getComponentName(path: NodePath): string | undefined {
  if (path.isFunctionDeclaration() && path.node.id) {
    return path.node.id.name;
  }
  let child = path;
  let parent = path.parentPath;
  while (
    parent &&
    (parent.isTSAsExpression() ||
      parent.isTSSatisfiesExpression() ||
      parent.isParenthesizedExpression())
  ) {
    child = parent;
    parent = parent.parentPath;
  }
  if (!parent) return;
  if (parent.isVariableDeclarator()) {
    return nameFromExpression(parent.node.id);
  }
  if (parent.isAssignmentExpression() && parent.node.right === child.node) {
    return nameFromExpression(parent.node.left);
  }
  if (parent.isObjectProperty() && parent.node.value === child.node) {
    const key = parent.node.key;
    if (t.isIdentifier(key)) return key.name;
    if (t.isStringLiteral(key)) return key.value;
  }
}

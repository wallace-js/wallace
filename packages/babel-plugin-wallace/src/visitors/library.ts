/* These visitors should only run on the wallace/lib source files. */
import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type {
  AssignmentExpression,
  FunctionExpression,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  MemberExpression,
  ObjectProperty,
  VariableDeclarator,
  VariableDeclaration
} from "@babel/types";
import { wallaceConfig } from "../config";
import { COMPONENT_PROPERTIES } from "../constants";

/**
 * Very simple visitor which replaces the entire if statement with its consequent or
 * alternate.
 *
 * The test must be in this exact format:
 *
 *    if (wallaceConfig.flags.allowStubs) {}
 *
 */
export const flagVisitor = {
  IfStatement(path: NodePath<IfStatement>) {
    const test = path.node.test;
    if (t.isMemberExpression(test)) {
      if (
        t.isMemberExpression(test.object) &&
        t.isIdentifier(test.object.object) &&
        test.object.object.name === "wallaceConfig" &&
        t.isIdentifier(test.object.property) &&
        test.object.property.name === "flags" &&
        t.isIdentifier(test.property)
      ) {
        if (wallaceConfig.flags[test.property.name]) {
          path.replaceWith(path.node.consequent);
        } else {
          if (path.node.alternate) {
            path.replaceWith(path.node.alternate);
          } else {
            path.remove();
          }
        }
      }
    }
  }
};

/**
 * This set of visitors removes references to `ctrl`.
 */
export const removeCtrl = {
  AssignmentExpression(path: NodePath<AssignmentExpression>) {
    // @ts-ignore
    if (path.node.right.name === "ctrl") {
      path.remove();
    }
  },
  MemberExpression(path: NodePath<MemberExpression>) {
    // @ts-ignore
    const name = path.node.property.name;
    if (name === "ctrl") {
      path.remove();
    }
  },
  Identifier(path: NodePath<Identifier>) {
    const name = path.node.name;
    if (name === "ctrl") {
      path.remove();
    }
  }
};

/**
 * This flattens the `update` and `_u` methods into one, which are
 * only separate to allow parts, as this inproves performance when
 * parts are not used.
 */
export const flattenUpdate = {
  VariableDeclarator(path: NodePath<VariableDeclarator>) {
    // @ts-ignore
    if (path.node.id?.name === "ComponentPrototype") {
      path.traverse({
        ObjectProperty(path: NodePath<ObjectProperty>) {
          // @ts-ignore
          const name = path.node.key.name;
          if (name === COMPONENT_PROPERTIES.update) {
            path.remove();
          } else if (name === COMPONENT_PROPERTIES.updateInner) {
            // @ts-ignore
            path.node.key.name = COMPONENT_PROPERTIES.update;
            const functionDef = path.node.value as FunctionExpression;
            functionDef.params = [];
            const varDeclation = functionDef.body.body[0] as VariableDeclaration;
            varDeclation.declarations.push(
              t.variableDeclarator(t.identifier("i"), t.numericLiteral(0)),
              t.variableDeclarator(
                t.identifier("il"),
                t.memberExpression(t.thisExpression(), t.identifier("_l"))
              )
            );
          }
        }
      });
    }
  }
};

/**
 * Removes the last two parameters from repeaters, which aren't used.
 */
export const removeRepeaterDetacherParams = {
  FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
    // @ts-ignore
    if (path.node.id?.name?.endsWith("Repeater")) {
      path.node.params.pop();
      path.node.params.pop();
    }
  }
};

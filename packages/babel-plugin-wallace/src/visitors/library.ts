import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type {
  AssignmentExpression,
  Identifier,
  IfStatement,
  MemberExpression
} from "@babel/types";
import { wallaceConfig } from "../config";

/**
 * Very simple visitor which replaces the entire if statement with its consequent or
 * alternate.
 *
 * The test must be in this exact format:
 *
 *    if (wallaceConfig.flags.useStubs) {}
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
 * This set of visitors removes references to `ctrl` in library code.
 * Should only be applied to files in wallace/lib and may break if we change
 * how ctrl is referenced therein.
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

import type { NodePath } from "@babel/core";
import type { AssignmentExpression, Identifier, MemberExpression } from "@babel/types";

/**
 * This set of visitors removes references to `ctrl` in library code.
 * Should only be applied to files in wallace/lib and may break if we change
 * those.
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

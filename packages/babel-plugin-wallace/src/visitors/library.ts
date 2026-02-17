/**
 * These visitors should only run on the wallace source files and tests.
 * */
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
import { error } from "../errors";
import { wallaceConfig } from "../config";
import { COMPONENT_PROPERTIES } from "../constants";

export const flagVisitor = {
  /**
   * Conditionally removes statement/expressions/identifiers etc...
   * based on leading comments:
   *
   *   #INCLUDE-IF: allowCtrl
   *   #EXCLUDE-IF: allowCtrl
   *
   * WARNING: NOT RELIABLE! It sometimes knocks out subsequent nodes, so only use on
   * ende nodes.
   */
  enter(path: NodePath) {
    const leadingComments = path.node.leadingComments;
    if (!leadingComments || leadingComments.length === 0) return;

    path.node.leadingComments.forEach(comment => {
      const value = comment.value,
        include = value.includes("#INCLUDE-IF:"),
        exclude = value.includes("#EXCLUDE-IF:");
      if (include || exclude) {
        const flag = getFlagFromComment(path, value);
        const flagEnabled = wallaceConfig.flags[flag];
        if ((flagEnabled && exclude) || (!flagEnabled && include)) {
          path.remove();
        }
      }
    });
  },
  /**
   * Replaces the entire if statement with its consequent or alternate:
   *
   * The test must be in this exact format:
   *
   *    if (wallaceConfig.flags.allowStubs) {
   *      // code to keep
   *    } else {
   *      // code to remove (optional)
   *    }
   *
   * You can't do anything more complex in the test or the conditions.
   * There are places where this can't be used, in which case use a comment.
   */
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

function getFlagFromComment(path: NodePath, comment: string): string {
  const chunks = comment.split(":");
  if (chunks.length !== 2) {
    error(path, "Badly formed compiler comment");
  }
  const flag = chunks[1].trim();
  wallaceConfig.ensureFlagIsValid(flag);
  return flag;
}

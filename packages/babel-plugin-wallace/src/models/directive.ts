import type { NodePath } from "@babel/core";
import type { Expression, JSXAttribute } from "@babel/types";
import { TagNode } from "./node";
import { Component } from "../models";
import { EXPRESSION_SCOPE_VARIABLES, XARGS } from "../constants";
import { ERROR_MESSAGES, error } from "../errors";

export interface NodeValue {
  type: "string" | "expression" | "null";
  value?: string;
  expression?: Expression;
  path?: NodePath;
}

export type Qualifier = string | undefined;

export class Directive {
  static attributeName: string;
  static help: string;
  static allowExpression = true;
  static allowNull = false;
  static allowString = false;
  static allowQualifier = false;
  static requireQualifier = false;
  static allowOnNested = false;
  static allowOnRepeated = false;
  static allowOnNormalElement = true;
  static allowAccessTo: EXPRESSION_SCOPE_VARIABLES[] = [
    EXPRESSION_SCOPE_VARIABLES.component,
    EXPRESSION_SCOPE_VARIABLES.props
  ];
  static allowedTypes: { [key: string]: NodeValue["type"] };
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {}
  validate(
    node: TagNode,
    value: NodeValue,
    qualifier: Qualifier,
    base: string,
    component: Component
  ) {
    const constructor = this.constructor as typeof Directive;
    this.validateType(node, value, constructor);
    this.validateNestedAndRepeat(node, constructor);
    this.validateQualifier(node, qualifier, constructor);
    this.validateScopeVariablAccess(node, value, constructor, component);
  }
  validateType(node: TagNode, value: NodeValue, constructor: typeof Directive) {
    const { attributeName, allowExpression, allowString, allowNull } = constructor;
    const allowedTypes = [
      allowExpression && "expression",
      allowString && "string",
      allowNull && "null"
    ].filter(Boolean);
    if (!allowedTypes.includes(value.type)) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_INVALID_TYPE(attributeName, allowedTypes, value.type)
      );
    }
  }
  validateNestedAndRepeat(node: TagNode, constructor: typeof Directive) {
    const { attributeName, allowOnRepeated, allowOnNested } = constructor;
    if (!allowOnRepeated && node.isRepeatedComponent) {
      error(
        node.path,
        ERROR_MESSAGES.CANNOT_USE_DIRECTIVE_ON_REPEATED_ELEMENT(attributeName)
      );
    }
    if (!allowOnNested && node.isNestedComponent) {
      error(
        node.path,
        ERROR_MESSAGES.CANNOT_USE_DIRECTIVE_ON_NESTED_ELEMENT(attributeName)
      );
    }
  }
  validateQualifier(node: TagNode, qualifier: Qualifier, constructor: typeof Directive) {
    let { attributeName, allowQualifier, requireQualifier } = constructor;
    if (requireQualifier) {
      allowQualifier = true;
    }
    if (requireQualifier && !qualifier) {
      error(
        node.path,
        ERROR_MESSAGES.CANNOT_USE_DIRECTIVE_WITHOUT_QUALIFIER(attributeName)
      );
    }
    if (!allowQualifier && qualifier) {
      error(node.path, ERROR_MESSAGES.CANNOT_USE_DIRECTIVE_WITH_QUALIFIER(attributeName));
    }
  }
  /* 
  Ensures the expression only accesses the scope variables it is allowed to.
  */
  validateScopeVariablAccess(
    node: TagNode,
    value: NodeValue,
    constructor: typeof Directive,
    component: Component
  ) {
    if (value.type !== "expression") return;
    const { attributeName, allowAccessTo } = constructor;
    const refs = getReferencedScopedVariables(value.path, component);
    Object.values(EXPRESSION_SCOPE_VARIABLES).forEach(name => {
      if (!allowAccessTo.includes(name) && refs.includes(name)) {
        error(
          node.path,
          ERROR_MESSAGES.DIRECTIVE_MAY_NOT_ACCESS_SCOPE_VAR(attributeName, name)
        );
      }
    });
  }
}

function getReferencedScopedVariables(path: NodePath, component: Component): string[] {
  const refs = new Set<string>();
  path.traverse({
    Identifier(idPath) {
      if (idPath.isReferencedIdentifier()) {
        let name = idPath.node.name.split(".")[0];
        if (component.xargMapping[name]) {
          name = component.xargMapping[name];
        } else if (name === component.propsIdentifier.name) {
          name = EXPRESSION_SCOPE_VARIABLES.props;
        }
        refs.add(name);
      }
    }
  });
  return Array.from(refs);
}

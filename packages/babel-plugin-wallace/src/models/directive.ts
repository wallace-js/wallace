import type { Expression } from "@babel/types";
import { TagNode } from "./node";

import { ERROR_MESSAGES, error } from "../errors";

export interface NodeValue {
  type: "string" | "expression" | "null";
  value?: string | undefined;
  expression?: Expression | undefined;
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
  static allowedTypes: { [key: string]: NodeValue["type"] };
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {}
  validate(
    node: TagNode,
    value: NodeValue,
    qualifier: Qualifier,
    base: string
  ) {
    const constructor = this.constructor as typeof Directive;
    this.validateType(node, value, constructor);
    this.validateNestedAndRepeat(node, constructor);
    this.validateQualifier(node, qualifier, constructor);
  }
  validateType(node: TagNode, value: NodeValue, constructor: typeof Directive) {
    const { attributeName, allowExpression, allowString, allowNull } =
      constructor;
    const allowedTypes = [
      allowExpression && "expression",
      allowString && "string",
      allowNull && "null"
    ].filter(Boolean);
    if (!allowedTypes.includes(value.type)) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_INVALID_TYPE(
          attributeName,
          allowedTypes,
          value.type
        )
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
  validateQualifier(
    node: TagNode,
    qualifier: Qualifier,
    constructor: typeof Directive
  ) {
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
      error(
        node.path,
        ERROR_MESSAGES.CANNOT_USE_DIRECTIVE_WITH_QUALIFIER(attributeName)
      );
    }
  }
}

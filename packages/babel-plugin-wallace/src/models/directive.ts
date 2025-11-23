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
  static allowOnNested = false;
  static allowOnRepeated = false;
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
  }
  validateType(node: TagNode, value: NodeValue, constructor: typeof Directive) {
    const { attributeName, allowExpression, allowString, allowNull } =
      constructor;
    const allowedTypes = [
      allowExpression && "expression",
      allowString && "string",
      allowNull && "null",
    ].filter(Boolean);

    console.log("allowedTypes", allowedTypes, "value", value.type, constructor);
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
}

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
  static allowOnNested = false;
  static allowOnRepeated = false;
  static allowedTypes: NodeValue["type"][];
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {}
  assertType(node: TagNode, value: NodeValue, ...allowed: NodeValue["type"][]) {
    if (allowed.includes(value.type)) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_INVALID_TYPE(
          (this.constructor as typeof Directive).attributeName,
          allowed,
          value.type
        )
      );
    }
  }
}

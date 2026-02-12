import type { NodePath } from "@babel/core";
import type { Expression } from "@babel/types";
import { XARGS } from "../constants";
import { TagNode } from "./node";
import { Component } from "../models";
import { ERROR_MESSAGES, error } from "../errors";

export interface NodeValue {
  type: "string" | "expression" | "null";
  value?: string;
  expression?: Expression;
  path?: NodePath;
}

export type Qualifier = string | undefined;

export enum FieldMode {
  Required,
  Allowed,
  NotAllowed
}

export enum ValueType {
  Expression,
  String,
  Both,
  None
}

export class Directive {
  static attributeName: string;
  static help: string;
  // static allowExpression = true;
  // static allowNull = false;
  // static allowString = false;
  // static allowQualifier = false;
  // static requireQualifier = false;
  static allowedValue: ValueType = ValueType.None;
  static valueMode: FieldMode = FieldMode.NotAllowed;
  static qualifierMode: FieldMode; // = FieldMode.NotAllowed;
  static allowOnNested = false;
  static allowOnRepeated = false;
  static allowOnNormalElement = true;
  static mayAccessComponent = true;
  static mayAccessElement = false;
  static mayAccessEvent = false;
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
    this.validateNestedAndRepeat(node, constructor);
    this.validateValues(node, value, qualifier, constructor);
    // this.validateType(node, value, constructor);
    // this.validateQualifier(node, qualifier, constructor);
    this.validateScopeVariablAccess(node, value, constructor, component);
  }
  getValueOrQualifer(node: TagNode, value: NodeValue, qualifier: Qualifier): string {
    const constructor = this.constructor as typeof Directive;
    if (value.type === "null") {
      return qualifier;
    }
    if (value.type !== "string") {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_VALUE_NOT_STRING(constructor.attributeName, value.type)
      );
    }
    if (value.value && qualifier) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_REQUIRES_QUALIFIER_OR_VALUE(constructor.attributeName)
      );
      return value.value;
    }
    return value.value || qualifier;
  }
  validateValues(
    node: TagNode,
    value: NodeValue,
    qualifier: Qualifier,
    constructor: typeof Directive
  ) {
    const { attributeName, allowedValue, valueMode, qualifierMode } = constructor;
    // value provided
    if (value.type !== "null" && valueMode === FieldMode.NotAllowed) {
      error(node.path, ERROR_MESSAGES.DIRECTIVE_VALUE_NOT_ALLOWED(attributeName));
    }
    if (value.type === "null" && valueMode === FieldMode.Required) {
      error(node.path, ERROR_MESSAGES.DIRECTIVE_VALUE_REQUIRED(attributeName));
    }
    // qualifier provided
    if (qualifier && qualifierMode === FieldMode.NotAllowed) {
      error(node.path, ERROR_MESSAGES.DIRECTIVE_QUALIFIER_NOT_ALLOWED(attributeName));
    }
    if (qualifier === undefined && qualifierMode === FieldMode.Required) {
      error(node.path, ERROR_MESSAGES.DIRECTIVE_QUALIFIER_REQUIRED(attributeName));
    }
    // value type
    if (allowedValue === ValueType.String && value.type !== "string") {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_VALUE_NOT_STRING(attributeName, value.type)
      );
    }
    if (allowedValue === ValueType.Expression && value.type !== "expression") {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_VALUE_NOT_EXPRESSION(attributeName, value.type)
      );
    }
  }
  // validateType(node: TagNode, value: NodeValue, constructor: typeof Directive) {
  //   const { attributeName, allowExpression, allowString, allowNull } = constructor;
  //   const allowedTypes = [
  //     allowExpression && "expression",
  //     allowString && "string",
  //     allowNull && "null"
  //   ].filter(Boolean);
  //   if (!allowedTypes.includes(value.type)) {
  //     error(
  //       node.path,
  //       ERROR_MESSAGES.DIRECTIVE_INVALID_TYPE(attributeName, allowedTypes, value.type)
  //     );
  //   }
  // }
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
  // validateQualifier(node: TagNode, qualifier: Qualifier, constructor: typeof Directive) {
  //   let { attributeName, allowQualifier, requireQualifier } = constructor;
  //   if (requireQualifier) {
  //     allowQualifier = true;
  //   }
  //   if (requireQualifier && !qualifier) {
  //     error(
  //       node.path,
  //       ERROR_MESSAGES.CANNOT_USE_DIRECTIVE_WITHOUT_QUALIFIER(attributeName)
  //     );
  //   }
  //   if (!allowQualifier && qualifier) {
  //     error(node.path, ERROR_MESSAGES.CANNOT_USE_DIRECTIVE_WITH_QUALIFIER(attributeName));
  //   }
  // }
  /* 
  Ensures the expression only accesses the scope variables it is allowed to.

  In code like this:

      const Foo = ({ age }, { ctrl, self, element, event, props }) => (
        <div 
          onClick={doXYZ(element, event)}
          class={[ctrl, self, age, props.foo, self.bar]}>
        </div>
      );

  The component.xargMapping would be this:

      {
        event: 'event',
        element: 'element',
        _props: 'props',
        _component: 'self',
        '_component.ctrl': 'ctrl'
      }

  And logging (idPath.node.name, ">>", name) in getReferencedScopedVariables prints:

      element >> element
      event >> event
      _component.ctrl >> ctrl
      _component >> self
      _props >> props
      _props >> props
      _component >> self

  Note that `doXYZ` is excluded, as the function scope doesn't have its own binding.

  The error message must mention the original variable name used.
  We must also ignore variables that are not in scope.
  */
  validateScopeVariablAccess(
    node: TagNode,
    value: NodeValue,
    constructor: typeof Directive,
    component: Component
  ) {
    if (value.type !== "expression") return;

    const { attributeName, mayAccessComponent, mayAccessElement, mayAccessEvent } =
      constructor;
    const accesError = (name: string) =>
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_MAY_NOT_ACCESS_SCOPE_VAR(attributeName, name)
      );

    const refs = getReferencedScopedVariables(value.path, component);

    if (!mayAccessElement && refs.includes(XARGS.element)) {
      accesError(XARGS.element);
    }
    if (!mayAccessEvent && refs.includes(XARGS.event)) {
      accesError(XARGS.event);
    }
    if (!mayAccessComponent) {
      const componentRefs = [XARGS.props, XARGS.component, XARGS.controller];
      componentRefs.forEach(name => {
        if (refs.includes(name)) {
          accesError(name);
        }
      });
    }
  }
}

function getReferencedScopedVariables(path: NodePath, component: Component): string[] {
  const refs = new Set<string>();
  path.traverse({
    Identifier(idPath) {
      if (idPath.isReferencedIdentifier() && idPath.scope.hasBinding(idPath.node.name)) {
        // An identifier doesn't normally need to be split, as it's just the fist part,
        // but we have renamed some to things like `_component.ctrl` so be mindful.
        let name = idPath.node.name;
        if (component.xargMapping[idPath.node.name]) {
          name = component.xargMapping[idPath.node.name];
        } else if (name === component.propsIdentifier.name) {
          name = XARGS.props;
        }
        refs.add(name);
      }
    }
  });
  return Array.from(refs);
}

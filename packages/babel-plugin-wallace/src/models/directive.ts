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

export enum QualifierMode {
  Required,
  Optional,
  SetsValue,
  NotAllowed
}

export enum ValueMode {
  StringRequired,
  StringOptional,
  ExpressionRequired,
  ExpressionOptional,
  EitherRequired,
  EitherOptional,
  NotAllowed
}

const ValidModesForSetsValue = [
  ValueMode.StringRequired,
  ValueMode.StringOptional,
  ValueMode.EitherRequired,
  ValueMode.EitherOptional
];

export class Directive {
  static attributeName: string;
  static help: string;
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static allowOnNested = false;
  static allowOnRepeated = false;
  static allowOnNormalElement = true;
  static mayAccessComponent = true;
  static mayAccessElement = false;
  static mayAccessEvent = false;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {}
  validate(
    node: TagNode,
    value: NodeValue,
    qualifier: Qualifier,
    base: string,
    component: Component
  ) {
    const constructor = this.constructor as typeof Directive;
    this.validateTypeAndQualifier(node, value, qualifier, constructor);
    this.validateNestedAndRepeat(node, constructor);
    this.validateScopeVariablAccess(node, value, constructor, component);
  }
  validateTypeAndQualifier(
    node: TagNode,
    value: NodeValue,
    qualifier: Qualifier,
    constructor: typeof Directive
  ) {
    const { qualifierMode, valueMode } = constructor;

    // Validate special case for SetsValue.
    if (qualifierMode === QualifierMode.SetsValue && qualifier) {
      ensureValidValueModeForSetsValue(valueMode, constructor);
      if (value.expression || value.value) {
        error(
          node.path,
          ERROR_MESSAGES.DIRECTIVE_REQUIRES_QUALIFIER_OR_VALUE(constructor.attributeName)
        );
      }
      value.value = qualifier;
    }

    // Standard qualifer validation.
    if (qualifierMode === QualifierMode.Required && !qualifier) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_REQUIRES_QUALIFIER(constructor.attributeName)
      );
    }
    if (qualifierMode === QualifierMode.NotAllowed && qualifier) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_DISALLOWS_QUALIFIER(constructor.attributeName)
      );
    }

    if (value.value && value.expression) {
      throw new Error("Internal error: directive got both a value and expression");
    }

    // Validate value
    switch (valueMode) {
      case ValueMode.StringRequired:
        if (!value.value)
          error(
            node.path,
            ERROR_MESSAGES.DIRECTIVE_VALUE_REQUIRED("string", constructor.attributeName)
          );
        break;
      case ValueMode.StringOptional:
        if (value.expression)
          error(
            node.path,
            ERROR_MESSAGES.DIRECTIVE_VALUE_REQUIRED("string", constructor.attributeName)
          );
        break;
      case ValueMode.ExpressionRequired:
        if (!value.expression)
          error(
            node.path,
            ERROR_MESSAGES.DIRECTIVE_VALUE_REQUIRED(
              "expression",
              constructor.attributeName
            )
          );
        break;
      case ValueMode.ExpressionOptional:
        if (value.value)
          error(
            node.path,
            ERROR_MESSAGES.DIRECTIVE_VALUE_REQUIRED(
              "expression",
              constructor.attributeName
            )
          );
        break;
      case ValueMode.EitherRequired:
        if (!(value.expression || value.value))
          error(
            node.path,
            ERROR_MESSAGES.DIRECTIVE_EITHER_VALUE_REQUIRED(constructor.attributeName)
          );
        break;
      case ValueMode.EitherOptional:
        // Do nothing
        break;
      case ValueMode.NotAllowed:
        if (value.expression || value.value) {
          error(
            node.path,
            ERROR_MESSAGES.DIRECTIVE_NO_VALUE_ALLOWED(constructor.attributeName)
          );
        }
        break;
    }
  }
  validateNestedAndRepeat(node: TagNode, constructor: typeof Directive) {
    const { attributeName, allowOnRepeated, allowOnNested } = constructor;
    if (!allowOnRepeated && node.isRepeatedComponent) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_NOT_ALLOWED_ON_REPEATED_ELEMENT(attributeName)
      );
    }
    if (!allowOnNested && node.isNestedComponent) {
      error(
        node.path,
        ERROR_MESSAGES.DIRECTIVE_NOT_ALLOWED_ON_NESTED_ELEMENT(attributeName)
      );
    }
  }
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

function ensureValidValueModeForSetsValue(
  valueMode: ValueMode,
  constructor: typeof Directive
) {
  if (!ValidModesForSetsValue.includes(valueMode)) {
    throw new Error(
      `Invalid directive configuration for ${constructor.attributeName}. 
When qualifierMode is 'SetsValue' then valueMode must be one of: ${ValidModesForSetsValue}.`
    );
  }
}

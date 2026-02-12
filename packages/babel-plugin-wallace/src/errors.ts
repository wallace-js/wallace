import type { NodePath } from "@babel/core";
import { XARGS } from "./constants";

const ALLOWED_XARGS: string[] = Object.values(XARGS).map(n => `"${n}"`);

export const ERROR_MESSAGES = {
  BASE_COMPONENT_ALREADY_DEFINED: "Base component already defined.",
  BIND_ONLY_ALLOWED_ON_INPUT: "The `bind` directive may only be used on `input` tags.",
  FOUND_JSX_IN_INVALID_LOCATION: "Found JSX in invalid location.",
  CLASS_METHOD_MUST_BE_PROPERTY_JSX:
    "Function returning JSX in a class must be assigned to property 'jsx'",
  CAPITALISED_COMPONENT_NAME: "Component name must be capitalized.",
  CANNOT_MAKE_ROOT_ELEMENT_A_STUB: "Cannot make the root element a stub.",
  CANNOT_USE_IF_ON_ROOT_ELEMENT: "Cannot use 'if' on root element.",
  CANNOT_USE_DIRECTIVE_ON_NESTED_ELEMENT: (directive: string) => {
    return `The "${directive}" directive may not be used on nested elements.`;
  },
  CANNOT_USE_DIRECTIVE_ON_REPEATED_ELEMENT: (directive: string) => {
    return `The "${directive}" directive may not be used on repeated elements.`;
  },
  CANNOT_USE_DIRECTIVE_WITHOUT_QUALIFIER: (directive: string) => {
    return `The "${directive}" directive must have a qualifier.`;
  },
  CANNOT_USE_DIRECTIVE_WITH_QUALIFIER: (directive: string) => {
    return `The "${directive}" directive may not have a qualifier.`;
  },
  DIRECTIVE_ALREADY_DEFINED: (directive: string) => {
    return `The "${directive}" directive has already been defined on this node.`;
  },
  DIRECTIVE_MAY_NOT_ACCESS_SCOPE_VAR: (directive: string, name: string) => {
    return `The "${directive}" directive may not access scoped variable "${name}".`;
  },
  EVENT_USED_WITHOUT_BIND:
    "The `event` directive must be used with the `bind` directive.",
  FLAG_REQUIRED: (flag: string) => {
    return `Flag "${flag}" must be set to true in the config for this feature.`;
  },
  INVALID_EVENT_NAME: (event: string) => {
    return `"${event}" is not a valid event. Must be lowercase without "on" prefix. E.g. event:keyup.`;
  },
  NESTED_COMPONENT_MUST_BE_CAPTIALIZED: "Nested component must be capitalized.",
  INCORRECTLY_NESTED_COMPONENT: "Nest components using <Name.nest /> or <Name.repeat />.",
  ARROW_FUNCTION_NOT_ASSIGNED: "Component function must be assigned to a variable.",
  DIRECTIVE_INVALID_TYPE: (directive: string, allowed: string[], actual: string) => {
    return allowed.length
      ? `The "${directive}" directive value must be of type ${allowed.join(" or ")}. Found: ${actual}.`
      : `The "${directive}" directive value must be of type ${allowed[0]}. Found: ${actual}.`;
  },

  PLACEHOLDER_MAY_NOT_BE_LITERAL_OBJECT:
    "Literal objects in placeholders not allowed as they will become constants.",
  JSX_ELEMENTS_NOT_ALLOWED_IN_EXPRESSIONS: "JSX elements are not allowed in expressions.",
  UNSUPPORTED_ATTRIBUTE_VALUE: "Attribute value must be a string or expression.",
  VISIBILITY_TOGGLE_DISPLAY_ALREADY_DEFINED:
    "Can only define one visibility toggle on element.",
  STUB_ALREADY_DEFINED: "Stub already defined on element.",
  NESTED_COMPONENT_NOT_ALLOWED_ON_ROOT: "Nested component not allowed on root element.",
  NESTED_COMPONENT_WITH_CHILDREN: "Nested component may not have child nodes.",
  NO_ATTRIBUTES_ON_NESTED_CLASS: "Attributes not allowed on nested class elements.",
  REFS_MUST_BE_UNIQUE_WITHIN_EACH_COMPONENT: "Refs must be unique within each component.",
  SPECIFY_EITHER_VALUE_OR_QUALIFIER: (name: string) =>
    `Specify either value: ${name}="xyz" or qualifier: ${name}:xyz`,
  PARTS_MUST_BE_UNIQUE_WITHIN_EACH_COMPONENT:
    "Parts must be unique within each component.",
  REPEAT_ALREADY_DEFINED: "Repeat already defined on element.",
  REPEAT_ONLY_ON_NESTED_CLASS: "Repeat only allowed on nested component elements.",
  REPEAT_NOT_ALLOWED_ON_ROOT: "Repeated component not allowed on root element.",
  REPEAT_DIRECTIVE_WITH_SIBLINGS:
    "Repeat may not have sibling elements if `allowRepeaterSiblings` flag is false.",
  REPEAT_DIRECTIVE_WITH_CHILDREN: "Repeat may not have child nodes.",
  TOGGLE_TARGETS_WITHOUT_TOGGLE_TRIGGERS: "Toggle targets must have toggle triggers.",
  UNSUPPORTED_NAMESPACE: "Unsupported namespace, may only use 'stub'.",
  XARGS_MUST_BE_OBJECT: "Extra args must be a destructured object.",
  ILLEGAL_XARG: (name: string) =>
    `Illegal parameter in extra args: "${name}". You are only allowed ${ALLOWED_XARGS.join(", ")}.`
};

export function error(path: NodePath<any>, errorMessage: string) {
  throw path.buildCodeFrameError(errorMessage);
}

export function ensure(condition: boolean, path: NodePath<any>, errorMessage: string) {
  if (!condition) {
    error(path, errorMessage);
  }
}

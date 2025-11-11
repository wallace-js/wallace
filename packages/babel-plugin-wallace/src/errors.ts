import type { NodePath } from "@babel/core";

export const ERROR_MESSAGES = {
  BASE_COMPONENT_ALREADY_DEFINED: "Base component already defined.",
  FOUND_JSX_IN_INVALID_LOCATION: "Found JSX in invalid location.",
  CLASS_METHOD_MUST_BE_PROPERTY_JSX:
    "Function returning JSX in a class must be assigned to property 'jsx'",
  CAPITALISED_COMPONENT_NAME: "Component name must be capitalized.",
  CANNOT_USE_IF_ON_ROOT_ELEMENT: "Cannot use 'if' on root element.",
  CANNOT_USE_IF_ON_NESTED_OR_REPEATED_ELEMENT:
    "Cannot use 'if' on nested or repeated element.",
  NESTED_COMPONENT_MUST_BE_CAPTIALIZED: "Nested component must be capitalized.",
  INCORRECTLY_NESTED_COMPONENT:
    "Nest components using <Name.nest /> or <Name.repeat />.",
  ARROW_FUNCTION_NOT_ASSIGNED:
    "Component function must be assigned to a variable.",
  BIND_ONLY_ALLOWED_ON_INPUT:
    "The `bind` directive may only be used on `input` tags.",
  PLACEHOLDER_MAY_NOT_BE_LITERAL_OBJECT:
    "Literal objects in placeholders not allowed as they will become constants.",
  JSX_ELEMENTS_NOT_ALLOWED_IN_EXPRESSIONS:
    "JSX elements are not allowed in expressions.",
  UNSUPPORTED_ATTRIBUTE_VALUE:
    "Attribute value must be a string or expression.",
  VISIBILITY_TOGGLE_DISPLAY_ALREADY_DEFINED:
    "Can only define one visibility toggle on element.",
  REF_ALREADY_DEFINED: "Ref already defined on element.",
  STUB_ALREADY_DEFINED: "Stub already defined on element.",
  PROPS_ALREADY_DEFINED: "Props already defined on element.",
  NESTED_COMPONENT_WITH_CHILDREN: "Nested component may not have child nodes.",
  NO_ATTRIBUTES_ON_NESTED_CLASS:
    "Attributes not allowed on nested class elements.",
  REFS_MUST_BE_UNIQUE_WITHIN_EACH_COMPONENT:
    "Refs must be unique within each component.",
  REPEAT_ALREADY_DEFINED: "Repeat already defined on element.",
  REPEAT_ONLY_ON_NESTED_CLASS:
    "Repeat only allowed on nested component elements.",
  REPEAT_WITHOUT_PARENT: "Repeat may only be used under a parent node.",
  REPEAT_DIRECTIVE_WITH_SIBLINGS:
    "Repeat may only be used when the parent node has no other children.",
  REPEAT_DIRECTIVE_WITH_CHILDREN: "Repeat may not have child nodes.",
  TOGGLE_TARGETS_WITHOUT_TOGGLE_TRIGGERS:
    "Toggle targets must have toggle triggers.",
  UNSUPPORTED_NAMESPACE: "Unsupported namespace, may only use 'stub'.",
  ILLEGAL_NAMES_IN_PROPS: (names: string[]) =>
    `Illegal names in props: ${names
      .map((name) => `"${name}"`)
      .join(", ")} - these are reserved for event callbacks.`,
  ILLEGAL_PARAMETERS: (name: string) =>
    `Illegal parameters: "${name}". You are only allowed "_element", "_event" and "_component".`,
};

export function error(path: NodePath<any>, errorMessage: string) {
  throw path.buildCodeFrameError(errorMessage);
}

export function ensure(
  condition: boolean,
  path: NodePath<any>,
  errorMessage: string,
) {
  if (!condition) {
    error(path, errorMessage);
  }
}

import type { NodePath } from "@babel/core";
import type { JSXAttribute } from "@babel/types";
import { wallaceConfig } from "../config";
import { Component, TagNode } from "../models";
import { ERROR_MESSAGES, error } from "../errors";
import { extractAttributeName, extractAttributeValue } from "../ast-helpers";
import { getHtmlAttributeName } from "../utils";

interface State {
  extractedNode: TagNode;
  component: Component;
  allowAttributes: boolean;
}

export const attributeVisitors = {
  JSXAttribute(
    path: NodePath<JSXAttribute>,
    { extractedNode, component, allowAttributes }: State
  ) {
    if (extractedNode.path.node !== path.parentPath.parentPath.node) {
      // We exit here as otherwise we'd traverse attributes of nested JSXElements too.
      return;
    }
    const { base, qualifier } = extractAttributeName(path);
    const extractedValue = extractAttributeValue(path);
    if (!extractedValue) {
      return;
    }

    // Deprecated `onClick={...}` syntax. String values are left as normal attributes.
    const isDeprecatedEventHandler =
      !qualifier && extractedValue.type === "expression" && /^on[a-z]/i.test(base);
    const directiveClass = isDeprecatedEventHandler
      ? wallaceConfig.directives["on*"]
      : wallaceConfig.directives[base];
    if (directiveClass) {
      const handler = new directiveClass();
      handler.validate(extractedNode, extractedValue, qualifier, base, component);
      handler.apply(extractedNode, extractedValue, qualifier, base);
    } else {
      if (!allowAttributes) {
        error(path, ERROR_MESSAGES.NESTED_COMPONENT_WITH_ATTRIBUTES);
      }
      const htmlName = getHtmlAttributeName(base);
      if (htmlName) {
        error(path, ERROR_MESSAGES.USE_HTML_ATTRIBUTE_NAME(base, htmlName));
      }
      const attName = qualifier ? `${base}:${qualifier}` : base;
      switch (extractedValue.type) {
        case "expression":
          extractedNode.watchAttribute(attName, extractedValue.expression);
          break;
        case "string":
          extractedNode.addFixedAttribute(attName, extractedValue.value);
          break;
        case "null":
          extractedNode.addFixedAttribute(attName);
          break;
      }
    }
    path.remove();
  }
};

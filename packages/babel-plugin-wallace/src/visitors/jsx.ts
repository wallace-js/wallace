import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { JSXElement, JSXExpressionContainer, JSXText } from "@babel/types";
import { getJSXElementName } from "../ast-helpers";
import { Component, WalkTracker } from "../models";
import { ERROR_MESSAGES, error } from "../errors";
import { isCapitalized } from "../utils";

interface State {
  component: Component;
  tracker?: WalkTracker;
}

// Calls itself recursively, using trackers to identify where we are.
// Must delete visited nodes to avoid reprocessing them with recursion.
export const jsxVisitors = {
  JSXElement(
    path: NodePath<JSXElement>,
    { component, tracker = { childIndex: 0, parent: undefined } }: State
  ) {
    const tagName = getJSXElementName(path);
    if (typeof tagName === "string") {
      if (isCapitalized(tagName)) {
        error(path, ERROR_MESSAGES.INCORRECTLY_NESTED_COMPONENT);
      }
      component.processJSXElement(path, tracker, tagName, jsxVisitors);
    } else {
      const { namespace, name } = tagName;
      if (name === "nest" || name === "repeat") {
        const componentCls = namespace;
        if (!isCapitalized(componentCls)) {
          error(path, ERROR_MESSAGES.NESTED_COMPONENT_MUST_BE_CAPTIALIZED);
        }
        component.processNestedElement(path, tracker, componentCls, name === "repeat");
        path.traverse(errorIfJSXelementsFoundUnderNested);
      } else if (namespace === "stub") {
        // TODO: ensure there is nothing inside and no other attributes.
        // alternatively, allow attributes to control the stub.
        component.processStub(path, name, tracker);
      } else {
        error(path, ERROR_MESSAGES.UNSUPPORTED_NAMESPACE);
      }
    }
    path.remove();
  },
  JSXText(path: NodePath<JSXText>, { component, tracker }: State) {
    if (path.node.value.trim() !== "") {
      component.processJSXText(path, tracker);
    }
    path.remove();
  },
  JSXExpressionContainer(
    path: NodePath<JSXExpressionContainer>,
    { component, tracker }: State
  ) {
    path.traverse(errorIfJSXelementsFoundInExpression);
    // We remove attributes while processing JSXElements, so the only expressions left
    // must be text nodes.
    component.processJSXExpressionInText(path, tracker);
    path.remove();
  }
};

function getVisitorThatErrorsIfJSXElementFound(errorMessage: string) {
  return {
    JSXElement(path: NodePath<JSXElement>) {
      error(path, errorMessage);
    }
  };
}

const errorIfJSXelementsFoundInExpression = getVisitorThatErrorsIfJSXElementFound(
  ERROR_MESSAGES.JSX_ELEMENTS_NOT_ALLOWED_IN_EXPRESSIONS
);

const errorIfJSXelementsFoundUnderNested = getVisitorThatErrorsIfJSXElementFound(
  ERROR_MESSAGES.NESTED_COMPONENT_WITH_CHILDREN
);

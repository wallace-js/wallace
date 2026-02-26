import type { NodePath } from "@babel/core";
import type { JSXElement, JSXExpressionContainer, JSXText } from "@babel/types";
import { getJSXElementData } from "../ast-helpers";
import { Component, WalkTracker } from "../models";
import { ERROR_MESSAGES, error } from "../errors";

interface State {
  component: Component;
  tracker?: WalkTracker;
}

// Calls itself recursively, using trackers to identify where we are.
// Must delete visited nodes to avoid reprocessing them with recursion.
export const jsxVisitors = {
  JSXElement(
    path: NodePath<JSXElement>,
    { component, tracker = { childIndex: 0, initialIndex: 0, parent: undefined } }: State
  ) {
    const tagData = getJSXElementData(path);
    switch (tagData.type) {
      case "stub":
      case "nested":
        path.traverse(errorIfJSXelementsFoundUnderNested);
        component.processNestedComponentTagNode(
          path,
          tracker,
          tagData.name,
          tagData.repeat,
          tagData.type === "stub"
        );
        break;
      case "normal":
        component.processJSXElement(path, tracker, tagData.name, jsxVisitors);
        break;
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

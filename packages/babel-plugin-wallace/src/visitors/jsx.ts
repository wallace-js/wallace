import type { NodePath } from "@babel/core";
import type { JSXElement, JSXExpressionContainer, JSXText } from "@babel/types";
import { getJSXElementData } from "../ast-helpers";
import { wallaceConfig, FlagValue } from "../config";
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
    { component, tracker = { childIndex: 0, initialIndex: 0, parent: undefined } }: State
  ) {
    const tagData = getJSXElementData(path);
    console.log("tagData", tagData);
    if (tagData.type === "stub") {
      wallaceConfig.ensureFlagIstrue(path, FlagValue.allowStubs);
      component.processStub(path, tracker, tagData.name, tagData.repeat);
    } else if (tagData.type === "nested") {
      component.processNestedComponentTagNode(
        path,
        tracker,
        tagData.name,
        tagData.repeat
      );
    } else if (tagData.type === "normal") {
      component.processJSXElement(path, tracker, tagData.name, jsxVisitors);
    }

    // const tagName = getJSXElementName(path);
    // if (typeof tagName === "string") {
    //   if (isCapitalized(tagName)) {
    //     component.processNestedComponentTagNode(path, tracker, tagName);
    //     path.traverse(errorIfJSXelementsFoundUnderNested);
    //   } else {
    //     component.processJSXElement(path, tracker, tagName, jsxVisitors);
    //   }
    // } else {
    //   // Namespace can be <x.y /> or <x:y />
    //   const { namespace, name } = tagName;
    //   if (name === "nest" || name === "repeat") {
    //     // TODO: ensure it has items if it's repeat
    //     component.processNestedComponentTagNode(path, tracker, namespace);
    //     path.traverse(errorIfJSXelementsFoundUnderNested);
    //   } else if (namespace === "stub") {
    //     wallaceConfig.ensureFlagIstrue(path, FlagValue.allowStubs);
    //     component.processStub(path, name, tracker);
    //   } else {
    //     error(path, ERROR_MESSAGES.UNSUPPORTED_NAMESPACE);
    //   }
    // }
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

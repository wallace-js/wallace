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
  /**
   * We need to be careful with whitespace. In HTML this:
   *
   *   <span><span>foo</span> bar</span>
   *
   * And this:
   *
   *   <span>
   *     <span>foo</span>
   *     bar
   *   </span>
   *
   * Both render "foo bar". Whereas this:
   *
   *   <span><span>foo</span>bar</span>
   *
   * Renders "foobar".
   *
   * So HTML honours the delibarate space, and developers may expect Wallace to do this.
   * However, code formatters could rearrange the JSX and silently break things.
   *
   * If we process all whitespace as is, everything works, but we end up with extraneous
   * text nodes which means we call defineComponent with:
   *
   *  "<div>\n    <span><span>foo</span> <span></span></span>\n  </div>"
   *
   * And also creates more DOM nodes to traverse to find dynamic elements.
   *
   * The trick is therefore to distinguish whitespace which can be removed from that
   * which needs to stay (or rather be converted to a single space) and that depends
   * on whether it is an inline element or not.
   *
   * So we want to turn this:
   *
   *   <span>
   *     <span>foo</span>
   *     {name}
   *   </span>
   *
   * Into a single line HTML with a space before the placeholder span:
   *
   *   <span><span>foo</span> <span></span></span>
   *
   * Alt options:
   *
   * add an extra space to the expression.
   * Throw an error if illegal whitespace is detected.
   * Replace all whitspace with a single string (still creates extra nodes)
   *
   * So we have to create a system which guesses correctly, but that's tricky. If we
   * change the rules, it could break people's pages. On the other hand, we should
   * ignore how users format their JSX.
   * See rules here:
   *   https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Text/Whitespace
   *
   * Note this is also affected by stripHtml()
   */
  JSXText(path: NodePath<JSXText>, { component, tracker }: State) {
    console.log(
      "JSXText",
      `-${path.node.value.replace("\n", "(n)").replace(" ", "(s)")}-`
    );
    component.processJSXText(path, tracker);
    if (path.node.value.trim() !== "") {
    }
    path.remove();
  },
  JSXExpressionContainer(
    path: NodePath<JSXExpressionContainer>,
    { component, tracker }: State
  ) {
    console.log("JSXExpressionContainer", path.node.expression);
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

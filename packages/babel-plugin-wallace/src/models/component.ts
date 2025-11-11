import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type {
  Identifier,
  JSXElement,
  JSXExpressionContainer,
  JSXText,
  Expression,
} from "@babel/types";
import { ERROR_MESSAGES, error } from "../errors";
import { getPlaceholderExpression } from "../ast-helpers";
import { attributeVisitors } from "../visitors/attribute";
import {
  ExtractedNode,
  DynamicTextNode,
  PlainTextNode,
  StubNode,
  TagNode,
} from "./node";
import { Module } from "./module";

export interface WalkTracker {
  parent: TagNode;
  childIndex: number;
}

/*
Captures all the information extracted for a component.

`currentNodeAddress` is an array of integers representing the position of an element
relative to root, resolvable using `reduce`, which is how wallace creates references
at runtime.

<div>                    []
  <div>                  [0]
    <span>A<span>        [0, 0]
    <img />              [0, 1]
  </div>
  <a href>go</a>         [1]
</div>
*/
export class Component {
  _currentNodeAddress: Array<number> = [];
  name: string;
  module: Module;
  baseComponent: Expression | undefined;
  rootElement: HTMLElement;
  extractedNodes: ExtractedNode[] = [];
  propsIdentifier: Identifier;
  componentIdentifier: Identifier;
  constructor(
    name: string,
    module: Module,
    propsIdentifier: Identifier,
    componentIdentifier: Identifier,
  ) {
    this.name = name;
    this.module = module;
    this.propsIdentifier = propsIdentifier;
    this.componentIdentifier = componentIdentifier;
  }
  #enterLevel(index: number) {
    // This skips this step for root, whose address is []
    if (this.rootElement) {
      this._currentNodeAddress.push(index);
    }
  }
  #exitLevel() {
    this._currentNodeAddress.pop();
  }
  #getCurrentAddress() {
    return this._currentNodeAddress.slice();
  }
  #addElement(
    element: HTMLElement | Text | undefined,
    path: NodePath,
    tracker: WalkTracker,
  ) {
    if (tracker.parent?.isNestedClass) {
      error(path, ERROR_MESSAGES.NESTED_COMPONENT_WITH_CHILDREN);
    }
    if (tracker.parent?.isRepeatedNode) {
      error(path, ERROR_MESSAGES.REPEAT_DIRECTIVE_WITH_CHILDREN);
    }
    if (!element) {
      return;
    }
    if (this.rootElement) {
      const relativePath = this._currentNodeAddress.slice(0, -1);
      const parentNode = relativePath.reduce(
        (acc, index) => acc.childNodes[index],
        this.rootElement,
      );
      parentNode.appendChild(element);
    } else {
      // @ts-ignore (TS complains this could be Text, but we know it's not.)
      this.rootElement = element;
    }
    tracker.childIndex += 1;
  }
  #addNode(node: ExtractedNode, path: NodePath, tracker: WalkTracker) {
    this.#addElement(node.getElement(), path, tracker);
    this.extractedNodes.push(node);
  }
  processJSXElement(
    path: NodePath<JSXElement>,
    tracker: WalkTracker,
    tagName: string,
    jsxVisitors: any,
  ) {
    this.#enterLevel(tracker.childIndex);
    const extractedNode = new TagNode(
      path,
      this.#getCurrentAddress(),
      tracker.parent,
      this,
      tagName,
      false,
    );
    path.traverse(attributeVisitors, { extractedNode });
    this.#addNode(extractedNode, path, tracker);
    path.traverse(jsxVisitors, {
      component: this,
      tracker: { childIndex: 0, parent: extractedNode },
    });
    this.#exitLevel();
  }
  processNestedElement(
    path: NodePath<JSXElement>,
    tracker: WalkTracker,
    tagName: string,
    isRepeat: boolean,
  ) {
    this.#enterLevel(tracker.childIndex);
    const extractedNode = new TagNode(
      path,
      this.#getCurrentAddress(),
      tracker.parent,
      this,
      tagName,
      true,
    );
    extractedNode.isRepeatedNode = isRepeat;
    path.traverse(attributeVisitors, { extractedNode });
    this.#addNode(extractedNode, path, tracker);
    this.#exitLevel();
  }
  processStub(path: NodePath<JSXElement>, name: string, tracker: WalkTracker) {
    this.#enterLevel(tracker.childIndex);
    const extractedNode = new StubNode(
      path,
      this.#getCurrentAddress(),
      tracker.parent,
      name,
    );
    this.#addNode(extractedNode, path, tracker);
    this.#exitLevel();
  }
  processJSXText(path: NodePath<JSXText>, tracker: WalkTracker) {
    // This will always be a leaf node.
    this.#enterLevel(tracker.childIndex);
    const extractedNode = new PlainTextNode(
      path,
      this.#getCurrentAddress(),
      tracker.parent,
    );
    this.#addNode(extractedNode, path, tracker);
    this.#exitLevel();
  }
  processJSXExpressionInText(
    path: NodePath<JSXExpressionContainer>,
    tracker: WalkTracker,
  ) {
    this.#enterLevel(tracker.childIndex);
    const expression = getPlaceholderExpression(path, path.node.expression);
    if (expression) {
      const extractedNode = new DynamicTextNode(
        path,
        this.#getCurrentAddress(),
        tracker.parent,
        expression,
      );
      this.#addNode(extractedNode, path, tracker);
    }
    this.#exitLevel();
  }
}

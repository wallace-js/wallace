import type { NodePath } from "@babel/core";
import type {
  Identifier,
  JSXElement,
  JSXExpressionContainer,
  JSXText,
  Expression
} from "@babel/types";
import { stringLiteral } from "@babel/types";
import type { Scope } from "@babel/traverse";
import { HTML_SPLITTER } from "../constants";
import { buildConcat, getPlaceholderExpression } from "../ast-helpers";
import { attributeVisitors } from "../visitors/attribute";
import {
  ExtractedNode,
  DynamicTextNode,
  PlainTextNode,
  TagNode,
  NestedComponentTagNode
} from "./node";
import { Module } from "./module";

export interface WalkTracker {
  parent: TagNode;
  childIndex: number;
  initialIndex: number;
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
  #currentNodeAddress: Array<number> = [];
  module: Module;
  scope: Scope;
  baseComponent: Expression | undefined;
  rootElement: HTMLElement;
  extractedNodes: ExtractedNode[] = [];
  propsIdentifier: Identifier;
  componentIdentifier: Identifier;
  xargMapping: { [key: string]: string } = {};
  htmlExpressions: Expression[] = [];
  unique: boolean = false;
  constructor(
    module: Module,
    scope: Scope,
    propsIdentifier: Identifier,
    componentIdentifier: Identifier
  ) {
    this.module = module;
    this.scope = scope;
    this.propsIdentifier = propsIdentifier;
    this.componentIdentifier = componentIdentifier;
  }
  #enterLevel(index: number) {
    // This skips this step for root, whose address is []
    if (this.rootElement) {
      this.#currentNodeAddress.push(index);
    }
  }
  #exitLevel() {
    this.#currentNodeAddress.pop();
  }
  #getCurrentAddress() {
    return this.#currentNodeAddress.slice();
  }
  #addElement(
    element: HTMLElement | Text | undefined,
    path: NodePath,
    tracker: WalkTracker
  ) {
    tracker.initialIndex += 1;
    if (!element) {
      // means it is a nested or repeated node.
      return;
    }
    tracker.childIndex += 1;
    if (this.rootElement) {
      const relativePath = this.#currentNodeAddress.slice(0, -1);
      const parentNode = relativePath.reduce(
        (acc, index) => acc.childNodes[index],
        this.rootElement
      );
      parentNode.appendChild(element);
    } else {
      // @ts-ignore (TS complains this could be Text, but we know it's not.)
      this.rootElement = element;
    }
  }
  #addNode(node: ExtractedNode, path: NodePath, tracker: WalkTracker) {
    this.#addElement(node.getElement(), path, tracker);
    this.extractedNodes.push(node);
  }
  processJSXElement(
    path: NodePath<JSXElement>,
    tracker: WalkTracker,
    tagName: string,
    jsxVisitors: any
  ) {
    this.#enterLevel(tracker.childIndex);
    const extractedNode = new TagNode(
      path,
      this.#getCurrentAddress(),
      tracker.initialIndex,
      tracker.parent,
      this,
      tagName
    );
    path.traverse(attributeVisitors, {
      extractedNode,
      allowAttributes: true,
      component: this
    });
    this.#addNode(extractedNode, path, tracker);
    path.traverse(jsxVisitors, {
      component: this,
      tracker: { childIndex: 0, initialIndex: 0, parent: extractedNode }
    });
    this.#exitLevel();
  }
  processNestedComponentTagNode(
    path: NodePath<JSXElement>,
    tracker: WalkTracker,
    tagName: string,
    isRepeat: boolean,
    isStub: boolean
  ) {
    this.#enterLevel(tracker.childIndex);
    const extractedNode = new NestedComponentTagNode(
      path,
      this.#getCurrentAddress(),
      tracker.initialIndex,
      tracker.parent,
      this,
      tagName,
      isRepeat,
      isStub
    );
    path.traverse(attributeVisitors, {
      extractedNode,
      allowAttributes: false,
      component: this
    });
    this.#addNode(extractedNode, path, tracker);
    this.#exitLevel();
  }
  processJSXText(path: NodePath<JSXText>, tracker: WalkTracker) {
    // This will always be a leaf node.
    this.#enterLevel(tracker.childIndex);
    const extractedNode = new PlainTextNode(
      path,
      this.#getCurrentAddress(),
      tracker.initialIndex,
      tracker.parent
    );
    this.#addNode(extractedNode, path, tracker);
    this.#exitLevel();
  }
  processJSXExpressionInText(
    path: NodePath<JSXExpressionContainer>,
    tracker: WalkTracker
  ) {
    this.#enterLevel(tracker.childIndex);
    const expression = getPlaceholderExpression(path, path.node.expression);
    if (expression) {
      const extractedNode = new DynamicTextNode(
        path,
        this.#getCurrentAddress(),
        tracker.initialIndex,
        tracker.parent,
        expression
      );
      this.#addNode(extractedNode, path, tracker);
    }
    this.#exitLevel();
  }
  buildHTMLString(): Expression {
    const raw = this.rootElement.outerHTML;
    if (this.htmlExpressions.length === 0) return stringLiteral(raw);
    let expressions = [];
    const chunks = raw.split(HTML_SPLITTER);
    chunks.forEach((chunk, index) => {
      expressions.push(stringLiteral(chunk));
      const expression = this.htmlExpressions[index];
      // just for the last one.
      if (expression) {
        expressions.push(expression);
      }
    });

    return buildConcat(expressions);
  }
}

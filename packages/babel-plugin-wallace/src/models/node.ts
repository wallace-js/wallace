import type { NodePath } from "@babel/core";
import type {
  Expression,
  JSXElement,
  JSXExpressionContainer,
  JSXText
} from "@babel/types";
import { createElement, createTextNode, setAttributeCallback } from "../utils";
import { ERROR_MESSAGES, error } from "../errors";
import { HTML_SPLITTER, WATCH_CALLBACK_ARGS, SPECIAL_SYMBOLS } from "../constants";

interface Attribute {
  name: string;
  value?: string;
}

interface Watch {
  expression: Expression | SPECIAL_SYMBOLS.noLookup;
  callback: string | Expression;
}

export interface RepeatInstruction {
  expression: Expression;
  componentCls: string;
  repeatKey: Expression | string | undefined;
  // poolExpression: Expression | undefined;
}

interface EventListener {
  eventName: string;
  callback: Expression;
}

interface BindInstruction {
  event?: string;
  property?: string;
  expression?: Expression;
}

export interface VisibilityToggle {
  expression: Expression;
  reverse: boolean;
  detach: boolean;
}

interface ToggleTrigger {
  name: string;
  expression: Expression;
}

interface ToggleTarget {
  name: string;
  value: Expression | string;
}

type ValidElementType = JSXElement | JSXExpressionContainer | JSXText;

export class ExtractedNode {
  component: any;
  tagName: string;
  element: HTMLElement | Text | undefined;
  elementKey?: number;
  detacherVariable?: string;
  detacherStashKey?: number;
  isNestedComponent: boolean = false;
  isRepeatedComponent: boolean = false;
  repeatNode?: ExtractedNode;
  repeatKey: Expression | string | undefined;
  address: Array<number>;
  initialIndex: number;
  path: NodePath<ValidElementType>;
  parent: TagNode;
  children: Array<ExtractedNode> = [];
  watches: Watch[] = [];
  eventListeners: EventListener[] = [];
  bindInstructions: BindInstruction = {};
  hasConditionalChildren: boolean = false;
  hasRepeatedChildren: boolean = false;
  // poolExpression: Expression | undefined;
  /**
   * The sets of classes that may be toggled.
   */
  classToggleTargets: ToggleTarget[] = [];
  /**
   * The triggers that cause the classes to be toggled.
   */
  classToggleTriggers: ToggleTrigger[] = [];
  // Private to prevent being set more thant once by directives.
  #repeatExpression?: Expression;
  #stubName?: string;
  #visibilityToggle?: VisibilityToggle;
  #ref?: string;
  #part?: string;
  #props?: Expression;
  #ctrl?: Expression;
  constructor(
    path: NodePath<ValidElementType>,
    address: Array<number>,
    initialIndex: number,
    parent: TagNode
  ) {
    this.address = address;
    this.initialIndex = initialIndex;
    this.path = path;
    this.parent = parent;
    if (parent) {
      parent.children.push(this);
    }
  }
  getElement(): HTMLElement | Text {
    throw new Error("Not implemented");
  }
  addEventListener(eventName: string, callback: Expression) {
    this.eventListeners.push({ eventName, callback });
  }
  setBindInstruction(expression: Expression, property: string) {
    this.bindInstructions.property = property;
    this.bindInstructions.expression = expression;
  }
  setBindEvent(event: string) {
    this.bindInstructions.event = event;
  }
  addWatch(
    expression: Expression | SPECIAL_SYMBOLS.noLookup,
    callback: string | Expression
  ) {
    this.watches.push({
      expression,
      callback
    });
  }
  addClassToggleTrigger(name: string, expression: Expression) {
    this.classToggleTriggers.push({ name, expression });
  }
  addClassToggleTarget(name: string, value: Expression | string) {
    this.classToggleTargets.push({ name, value });
  }
  watchAttribute(attName: string, expression: Expression) {
    this.addWatch(expression, setAttributeCallback(attName));
  }
  watchText(expression: Expression) {
    this.addWatch(
      expression,
      `${WATCH_CALLBACK_ARGS.element}.textContent = ${WATCH_CALLBACK_ARGS.newValue}`
    );
  }
  setCtrl(expression: Expression) {
    if (this.#ctrl) {
      error(this.path, ERROR_MESSAGES.DIRECTIVE_ALREADY_DEFINED("ctrl"));
    }
    this.#ctrl = expression;
  }
  getCtrl(): Expression {
    return this.repeatNode ? this.repeatNode.getCtrl() : this.#ctrl;
  }
  setProps(expression: Expression) {
    if (this.#props) {
      error(this.path, ERROR_MESSAGES.DIRECTIVE_ALREADY_DEFINED("props"));
    }
    this.#props = expression;
  }
  getProps(): Expression | undefined {
    return this.#props;
  }
  setVisibilityToggle(expression: Expression, reverse: boolean, detach: boolean) {
    if (this.#visibilityToggle) {
      error(this.path, ERROR_MESSAGES.VISIBILITY_TOGGLE_DISPLAY_ALREADY_DEFINED);
    }
    this.#visibilityToggle = { expression, reverse, detach };
    if (detach) {
      if (!this.parent) {
        error(this.path, ERROR_MESSAGES.CANNOT_USE_IF_ON_ROOT_ELEMENT);
      }
      this.parent.hasConditionalChildren = true;
    }
  }
  getVisibilityToggle(): VisibilityToggle | undefined {
    return this.#visibilityToggle;
  }
  setRef(name: string) {
    if (this.#ref) {
      error(this.path, ERROR_MESSAGES.DIRECTIVE_ALREADY_DEFINED("ref"));
    }
    this.#ref = name;
  }
  getRef(): string | undefined {
    return this.#ref;
  }
  setPart(name: string) {
    if (this.#part) {
      error(this.path, ERROR_MESSAGES.DIRECTIVE_ALREADY_DEFINED("part"));
    }
    this.#part = name;
  }
  getPart(): string | undefined {
    return this.#part;
  }
  setRepeatExpression(expression: Expression) {
    if (this.#repeatExpression) {
      error(this.path, ERROR_MESSAGES.DIRECTIVE_ALREADY_DEFINED("items"));
    }
    this.isRepeatedComponent = true;
    this.#repeatExpression = expression;
    // this.parent.repeatNode = this;
  }
  setRepeatKey(expression: Expression | string) {
    this.repeatKey = expression;
  }
  /**
   * Called on the parent of a repeat.
   */
  getRepeatInstruction(): RepeatInstruction | undefined {
    if (this.isRepeatedComponent) {
      return {
        expression: this.#repeatExpression,
        componentCls: this.tagName,
        repeatKey: this.repeatKey
        // poolExpression: this.repeatNode.poolExpression
      };
    }
  }
  setStub(name: string) {
    if (!this.parent) {
      error(this.path, ERROR_MESSAGES.CANNOT_MAKE_ROOT_ELEMENT_A_STUB);
    }
    if (this.#stubName) {
      error(this.path, ERROR_MESSAGES.STUB_ALREADY_DEFINED);
    }
    this.#stubName = name;
  }
  getStubName(): string | undefined {
    return this.#stubName;
  }
}

export class TagNode extends ExtractedNode {
  parent: TagNode;
  address: Array<number>;
  path: NodePath<JSXElement>;
  attributes: Attribute[] = [];
  constructor(
    path: NodePath<JSXElement>,
    address: Array<number>,
    initialIndex: number,
    parent: TagNode,
    component: any, // TODO: fix type circular import.
    tagName: string,
    isNestedComponent: boolean,
    isRepeatedComponent: boolean
  ) {
    super(path, address, initialIndex, parent);
    this.component = component;
    this.tagName = tagName;
    this.isNestedComponent = isNestedComponent;
    this.isRepeatedComponent = isRepeatedComponent;
    if (!this.parent) {
      if (this.isRepeatedComponent) {
        error(this.path, ERROR_MESSAGES.REPEAT_NOT_ALLOWED_ON_ROOT);
      } else if (this.isNestedComponent) {
        error(this.path, ERROR_MESSAGES.NESTED_COMPONENT_NOT_ALLOWED_ON_ROOT);
      }
    }
    if (this.isRepeatedComponent) {
      this.parent.hasRepeatedChildren = true;
    }
  }
  addFixedAttribute(name: string, value?: string) {
    this.attributes.push({ name, value });
  }
  addStaticAttribute(name: string, expression: Expression) {
    this.component.htmlExpressions.push(expression);
    this.attributes.push({ name, value: HTML_SPLITTER });
  }
  getElement(): HTMLElement | Text {
    if (this.isRepeatedComponent) {
      return undefined;
    }
    const element = createElement(this.tagName);
    this.attributes.forEach(({ name, value }) => {
      element.setAttribute(name, value || "");
    });
    this.element = element;
    return this.element;
  }
}

export class StubNode extends ExtractedNode {
  constructor(
    path: NodePath<JSXElement>,
    address: Array<number>,
    initialIndex: number,
    parent: TagNode,
    name: string
  ) {
    super(path, address, initialIndex, parent);
    this.setStub(name);
  }
  getElement(): HTMLElement | Text {
    this.element = createElement("div");
    return this.element;
  }
}

export class DynamicTextNode extends ExtractedNode {
  constructor(
    path: NodePath<JSXExpressionContainer>,
    address: Array<number>,
    initialIndex: number,
    parent: TagNode,
    expression: Expression
  ) {
    super(path, address, initialIndex, parent);
    this.watchText(expression);
  }
  getElement(): HTMLElement | Text {
    this.element = createElement("span");
    return this.element;
  }
}

export class PlainTextNode extends ExtractedNode {
  constructor(
    path: NodePath<JSXText>,
    address: Array<number>,
    initialIndex: number,
    parent: TagNode
  ) {
    super(path, address, initialIndex, parent);
  }
  getElement(): HTMLElement | Text {
    // @ts-ignore
    this.element = createTextNode(this.path.node.value);
    return this.element;
  }
}

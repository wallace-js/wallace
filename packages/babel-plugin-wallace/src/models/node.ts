import type { NodePath } from "@babel/core";
import type {
  Expression,
  JSXElement,
  JSXExpressionContainer,
  JSXText,
  Identifier,
  NewExpression
} from "@babel/types";
import { createElement, createTextNode, setAttributeCallback } from "../utils";
import { ERROR_MESSAGES, error } from "../errors";
import {
  HTML_SPLITTER,
  WATCH_CALLBACK_ARGS,
  IMPORTABLES,
  SPECIAL_SYMBOLS
} from "../constants";
import { wallaceConfig, FlagValue } from "../config";

interface Attribute {
  name: string;
  value?: string;
}

interface Watch {
  expression: Expression | SPECIAL_SYMBOLS.noLookup;
  callback: string | Expression;
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
  detacherIdentifier?: Identifier;
  detacherObject?: NewExpression;
  detacherStashKey?: number;
  isNestedComponent: boolean = false;
  isRepeatedComponent: boolean = false;
  isStub: boolean = false;
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
  hasNestedChildren: boolean = false;
  hasRepeatedChildren: boolean = false;
  requiredImports: Set<IMPORTABLES> = new Set();
  /**
   * The sets of classes that may be toggled.
   */
  classToggleTargets: ToggleTarget[] = [];
  /**
   * The triggers that cause the classes to be toggled.
   */
  classToggleTriggers: ToggleTrigger[] = [];
  // Private to prevent being set more thant once by directives.
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
    return this.#ctrl;
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
  setRepeatKey(expression: Expression | string) {
    this.repeatKey = expression;
  }
  requiredImport(name: IMPORTABLES) {
    this.requiredImports.add(name);
  }
}

/**
 * Class for standard tag nodes:
 * <img />
 * <div>...</div>
 */
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
    tagName: string
  ) {
    super(path, address, initialIndex, parent);
    this.component = component;
    this.tagName = tagName;
  }
  addFixedAttribute(name: string, value?: string) {
    this.attributes.push({ name, value });
  }
  addStaticAttribute(name: string, expression: Expression) {
    this.component.htmlExpressions.push(expression);
    this.attributes.push({ name, value: HTML_SPLITTER });
  }
  getElement(): HTMLElement | Text {
    const element = createElement(this.tagName);
    this.attributes.forEach(({ name, value }) => {
      element.setAttribute(name, value || "");
    });
    this.element = element;
    return this.element;
  }
}

/**
 * Class for nested component tag nodes:
 *
 * <NestedComponent />
 */
export class NestedComponentTagNode extends TagNode {
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
    isRepeat: boolean,
    isStub: boolean
  ) {
    super(path, address, initialIndex, parent, component, tagName);
    if (!this.parent) {
      error(this.path, ERROR_MESSAGES.NESTED_COMPONENT_NOT_ALLOWED_ON_ROOT);
    }
    if (isStub) {
      this.isStub = true;
      wallaceConfig.ensureFlagIstrue(path, FlagValue.allowStubs);
    }
    if (isRepeat) {
      this.isRepeatedComponent = true;
      this.parent.hasRepeatedChildren = true;
    } else {
      this.isNestedComponent = true;
      this.parent.hasNestedChildren = true;
    }
  }
  getElement(): HTMLElement | Text {
    return undefined;
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

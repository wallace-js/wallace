import type { NodePath } from "@babel/core";
import type {
  Expression,
  JSXElement,
  JSXExpressionContainer,
  JSXText,
} from "@babel/types";
import { createElement, createTextNode, setAttributeCallback } from "../utils";
import { ERROR_MESSAGES, error } from "../errors";
import { WATCH_CALLBACK_PARAMS } from "../constants";

interface Attribute {
  name: string;
  value?: string;
}

interface Watch {
  expression: Expression;
  // TODO: change to proper expr
  callback: string;
}

interface RepeatInstruction {
  expression: Expression;
  componentCls: string;
  poolExpression: Expression | undefined;
}

interface EventListener {
  eventName: string;
  callback: Expression;
}

interface BindInstruction {
  eventName: string;
  expression: Expression;
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
  elementKey: number | undefined;
  detacherStashKey: number | undefined;
  isRepeatedNode: boolean = false;
  repeatNode: ExtractedNode | undefined;
  address: Array<number>;
  path: NodePath<ValidElementType>;
  parent: TagNode;
  watches: Watch[] = [];
  eventListeners: EventListener[] = [];
  bindInstructions: BindInstruction[] = [];
  isNestedClass: boolean = false;
  hasConditionalChildren: boolean = false;
  repeatExpression: Expression | undefined;
  poolExpression: Expression | undefined;
  /**
   * The sets of classes that may be toggled.
   */
  toggleTargets: ToggleTarget[] = [];
  /**
   * The triggers that cause the classes to be toggled.
   */
  toggleTriggers: ToggleTrigger[] = [];
  #stubName: string | undefined;
  #visibilityToggle: VisibilityToggle | undefined;
  #ref: string | undefined;
  #props: Expression | undefined;
  #forExpression: Expression | undefined;
  #forVariable: string | undefined;
  constructor(
    address: Array<number>,
    path: NodePath<ValidElementType>,
    parent: TagNode,
  ) {
    this.path = path;
    this.address = address;
    this.parent = parent;
  }
  getElement(): HTMLElement | Text {
    throw new Error("Not implemented");
  }
  addEventListener(eventName: string, callback: Expression) {
    if (this.isNestedClass) {
      error(this.path, ERROR_MESSAGES.NO_ATTRIBUTES_ON_NESTED_CLASS);
    }
    this.eventListeners.push({ eventName, callback });
  }
  addBindInstruction(eventName: string, expression: Expression) {
    if (this.isNestedClass) {
      error(this.path, ERROR_MESSAGES.NO_ATTRIBUTES_ON_NESTED_CLASS);
    }
    this.bindInstructions.push({ eventName, expression });
  }
  addWatch(expression: Expression, callback: string) {
    this.watches.push({
      expression,
      callback,
    });
  }
  addToggleTrigger(name: string, expression: Expression) {
    this.toggleTriggers.push({ name, expression });
  }
  addToggleTarget(name: string, value: Expression | string) {
    this.toggleTargets.push({ name, value });
  }
  watchAttribute(attName: string, expression: Expression) {
    if (this.isNestedClass) {
      error(this.path, ERROR_MESSAGES.NO_ATTRIBUTES_ON_NESTED_CLASS);
    }
    this.addWatch(expression, setAttributeCallback(attName));
  }
  watchText(expression: Expression) {
    this.addWatch(
      expression,
      `${WATCH_CALLBACK_PARAMS.element}.textContent = n`,
    );
  }
  setProps(expression: Expression) {
    if (this.isRepeatedNode) {
      this.setRepeatExpression(expression);
    } else {
      if (this.#props) {
        error(this.path, ERROR_MESSAGES.PROPS_ALREADY_DEFINED);
      }
      this.#props = expression;
    }
  }
  getProps(): Expression | undefined {
    return this.#props;
  }
  setVisibilityToggle(
    expression: Expression,
    reverse: boolean,
    detach: boolean,
  ) {
    if (this.#visibilityToggle) {
      error(
        this.path,
        ERROR_MESSAGES.VISIBILITY_TOGGLE_DISPLAY_ALREADY_DEFINED,
      );
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
      error(this.path, ERROR_MESSAGES.REF_ALREADY_DEFINED);
    }
    this.#ref = name;
  }
  getRef(): string | undefined {
    return this.#ref;
  }
  // TODO: fix not to use directive.
  setRepeatExpression(expression: Expression) {
    if (!this.parent) {
      error(this.path, ERROR_MESSAGES.REPEAT_WITHOUT_PARENT);
    }
    // if (this.isRepeatedNode) {
    //   error(this.path, ERROR_MESSAGES.REPEAT_ALREADY_DEFINED);
    // }
    // if (!this.isNestedClass) {
    //   error(this.path, ERROR_MESSAGES.REPEAT_ONLY_ON_NESTED_CLASS);
    // }
    this.isRepeatedNode = true;
    // While this could potentially be set multiple times, we later check that repeat
    // cannot be used if there siblings.
    this.repeatExpression = expression;
    this.parent.repeatNode = this;
  }
  /**
   * Called on the parent of a repeat.
   */
  getRepeatInstruction(): RepeatInstruction | undefined {
    return this.repeatNode
      ? {
          expression: this.repeatNode.repeatExpression,
          componentCls: this.repeatNode.tagName,
          poolExpression: this.repeatNode.poolExpression,
        }
      : undefined;
  }
  setStub(name: string) {
    if (this.#stubName) {
      error(this.path, ERROR_MESSAGES.STUB_ALREADY_DEFINED);
    }
    this.#stubName = name;
  }
  getStub(): string | undefined {
    return this.#stubName;
  }
  // setForLoop(expression: Expression, variable: string | undefined) {
  //   if (this.#forExpression) {
  //     error(this.path, ERROR_MESSAGES.REF_ALREADY_DEFINED);
  //   }
  //   this.#forVariable = variable;
  //   this.#forExpression = expression;
  // }
  // getForLoop():
  //   | { expression: Expression; variable: string | undefined }
  //   | undefined {
  //   if (this.#forExpression) {
  //     return { expression: this.#forExpression, variable: this.#forVariable };
  //   }
  // }
  setBaseComponent(expression: Expression) {
    if (this.component.baseComponent) {
      error(this.path, ERROR_MESSAGES.BASE_COMPONENT_ALREADY_DEFINED);
    }
    this.component.baseComponent = expression;
  }
}

export class TagNode extends ExtractedNode {
  parent: TagNode;
  address: Array<number>;
  path: NodePath<JSXElement>;
  attributes: Attribute[] = [];
  // directives: ExtractedDirective[] = [];
  constructor(
    path: NodePath<JSXElement>,
    address: Array<number>,
    parent: TagNode,
    component: any, // TODO: fix type circular import.
    tagName: string,
    isNestedClass: boolean,
  ) {
    super(address, path, parent);
    this.path = path;
    this.address = address;
    this.component = component;
    this.tagName = tagName;
    this.parent = parent;
    this.isNestedClass = isNestedClass;
  }
  addFixedAttribute(name: string, value?: string) {
    this.attributes.push({ name, value });
  }
  getElement(): HTMLElement | undefined {
    if (this.isRepeatedNode) {
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
    parent: TagNode,
    name: string,
  ) {
    super(address, path, parent);
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
    parent: TagNode,
    expression: Expression,
  ) {
    super(address, path, parent);
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
    parent: TagNode,
  ) {
    super(address, path, parent);
  }
  getElement(): HTMLElement | Text {
    // @ts-ignore
    this.element = createTextNode(this.path.node.value);
    return this.element;
  }
}

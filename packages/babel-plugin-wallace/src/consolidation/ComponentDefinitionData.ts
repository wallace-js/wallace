import type {
  Expression,
  CallExpression,
  ArrowFunctionExpression,
  Identifier,
  Statement
} from "@babel/types";
import {
  blockStatement,
  callExpression,
  arrowFunctionExpression,
  identifier,
  returnStatement
} from "@babel/types";
import { Component, ExtractedNode } from "../models";
import { IMPORTABLES, SPECIAL_SYMBOLS } from "../constants";
import { NodeAddress, Part, ShieldInfo } from "./types";
import {
  buildFindElementCall,
  buildWatchCallbackParams,
  buildNestedClassCall,
  removeKeys
} from "./utils";
import { codeToNode } from "../utils";

/**
 * An object with all the consolidated data for writing.
 */
export class ComponentDefinitionData {
  stash: Array<Expression> = [];
  detachers: Array<Expression> = [];
  component: Component;
  html: Expression;
  watches: Array<ComponentWatch> = [];
  dynamicElements: Expression[] = [];
  baseComponent: Expression | undefined;
  lookups: Map<number, ArrowFunctionExpression> = new Map();
  refs: string[] = [];
  parts: Array<Part> = [];
  #lookupKeys: Array<String> = [];
  constructor(component: Component) {
    this.component = component;
    this.baseComponent = component.baseComponent;
  }

  saveDynamicElement(address: NodeAddress) {
    this.dynamicElements.push(buildFindElementCall(this.component.module, address));
    return this.dynamicElements.length - 1;
  }
  saveNestedAsDynamicElement(address: NodeAddress, componentCls: Expression) {
    this.dynamicElements.push(
      buildNestedClassCall(this.component.module, address, componentCls)
    );
    return this.dynamicElements.length - 1;
  }
  addLookup(expression: Expression) {
    const hashExpression = expr => {
      const copy = JSON.parse(JSON.stringify(expr));
      removeKeys(copy, ["start", "end", "loc"]);
      return JSON.stringify(copy);
    };
    const hash = hashExpression(expression);
    if (!this.#lookupKeys.includes(hash)) {
      this.#lookupKeys.push(hash);
    }
    const key = this.#lookupKeys.indexOf(hash);
    this.lookups.set(
      key,
      arrowFunctionExpression(
        this.getLookupCallBackParams(),
        blockStatement([returnStatement(expression)])
      )
    );
    return key;
  }
  getFunctionIdentifier(name: IMPORTABLES) {
    this.component.module.requireImport(name);
    return identifier(name);
  }
  getLookupCallBackParams(): Array<Identifier> {
    return [this.component.propsIdentifier, this.component.componentIdentifier];
  }
  wrapDynamicElementCall(
    key: number,
    functionName: IMPORTABLES,
    remainingArgs: Expression[]
  ): CallExpression {
    return (this.dynamicElements[key] = callExpression(
      this.getFunctionIdentifier(functionName),
      [this.dynamicElements[key], ...remainingArgs]
    ));
  }
  stashItem(expression: Expression): number {
    this.stash.push(expression);
    return this.stash.length - 1;
  }
  createDetacher(expression: Expression): string {
    this.detachers.push(expression);
    return this.getDetacherId(this.detachers.length - 1);
  }
  getDetacherId(index: number): string {
    return `detacher${index}`;
  }
}

export class ComponentWatch {
  shieldInfo?: ShieldInfo | undefined;
  node: ExtractedNode;
  componentDefinition: ComponentDefinitionData;
  elementKey: number;
  address: NodeAddress;
  #tmpCallbacks: { [key: string | number]: Array<Statement> } = {};
  callbacks: { [key: string | number]: ArrowFunctionExpression } = {};
  constructor(
    node: ExtractedNode,
    componentDefinition: ComponentDefinitionData,
    elementKey: number,
    address: NodeAddress
  ) {
    this.node = node;
    this.componentDefinition = componentDefinition;
    this.elementKey = elementKey;
    this.address = address;
    if (this.elementKey === undefined) {
      // Means we messed up shouldSaveElement vs needsWatch
      throw "Internal Error: elementKey is undefined";
    }
    node.watches.forEach(watch => {
      if (watch.expression == SPECIAL_SYMBOLS.noLookup) {
        this.add(SPECIAL_SYMBOLS.noLookup, codeToNode(watch.callback));
      } else {
        const lookupKey = componentDefinition.addLookup(watch.expression);
        this.add(lookupKey, codeToNode(watch.callback));
      }
    });
    componentDefinition.watches.push(this);
  }
  add(lookupKey: string | number, statements: Statement[]) {
    if (!this.#tmpCallbacks.hasOwnProperty(lookupKey)) {
      this.#tmpCallbacks[lookupKey] = [];
    }
    this.#tmpCallbacks[lookupKey].push(...statements);
  }
  consolidate() {
    for (const key in this.#tmpCallbacks) {
      const args = buildWatchCallbackParams(
        this.componentDefinition.component,
        key === SPECIAL_SYMBOLS.noLookup
      );
      this.callbacks[key] = arrowFunctionExpression(
        args,
        blockStatement(this.#tmpCallbacks[key])
      );
    }
  }
}

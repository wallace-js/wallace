import type { Expression, FunctionExpression, Identifier } from "@babel/types";
import {
  blockStatement,
  callExpression,
  functionExpression,
  identifier,
  returnStatement
} from "@babel/types";
import { Component } from "../models";
import { IMPORTABLES } from "../constants";
import { ComponentWatch, NodeAddress } from "./types";
import { buildFindElementCall, buildNestedClassCall, removeKeys } from "./utils";

/**
 * An object with all the consolidated data for writing.
 */
export class ComponentDefinitionData {
  component: Component;
  html: Expression;
  watches: Array<ComponentWatch> = [];
  dynamicElements: { [key: number]: Expression } = {};
  baseComponent: Expression | undefined;
  lookups: { [key: string]: FunctionExpression } = {};
  collectedRefs: Array<string> = [];
  #dynamicElementKey: number = -1;
  #miscStashKey: number = 0;
  #lookupKeys: Array<String> = [];
  constructor(component: Component) {
    this.component = component;
    this.baseComponent = component.baseComponent;
  }
  saveDynamicElement(address: NodeAddress) {
    this.#dynamicElementKey++;
    this.dynamicElements[this.#dynamicElementKey] = buildFindElementCall(
      this.component.module,
      address
    );
    return this.#dynamicElementKey;
  }
  saveNestedAsDynamicElement(address: NodeAddress, componentCls: Expression) {
    this.#dynamicElementKey++;
    this.dynamicElements[this.#dynamicElementKey] = buildNestedClassCall(
      this.component.module,
      address,
      componentCls
    );
    return this.#dynamicElementKey;
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
    this.lookups[key] = functionExpression(
      null,
      this.getLookupCallBackParams(),
      blockStatement([returnStatement(expression)])
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
  ) {
    this.dynamicElements[key] = callExpression(this.getFunctionIdentifier(functionName), [
      this.dynamicElements[key],
      ...remainingArgs
    ]);
  }
  getNextmiscStashKey() {
    this.#miscStashKey++;
    return this.#miscStashKey - 1;
  }
}

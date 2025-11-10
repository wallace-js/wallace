import type {
  Expression,
  CallExpression,
  FunctionExpression,
  Identifier,
} from "@babel/types";
import {
  blockStatement,
  callExpression,
  functionExpression,
  identifier,
  returnStatement,
} from "@babel/types";
import { Component } from "../models";
import { IMPORTABLES } from "../constants";
import { ComponentWatch, NodeAddress } from "./types";
import {
  buildFindElementCall,
  buildNestedClassCall,
  removeKeys,
} from "./utils";

/**
 * An object with all the consolidated data for writing.
 */
export class ComponentDefinitionData {
  component: Component;
  html: string;
  watches: Array<ComponentWatch> = [];
  dynamicElements: { [key: string]: CallExpression } = {};
  baseComponent: Expression | undefined;
  lookups: { [key: string]: FunctionExpression } = {};
  collectedRefs: Array<string> = [];
  #dynamicElementKey: number = 0;
  #miscStashKey: number = 0;
  #lookupKeys: Array<String> = [];
  constructor(component: Component) {
    this.component = component;
    this.baseComponent = component.baseComponent;
  }
  saveDynamicElement(address: NodeAddress) {
    this.#dynamicElementKey++;
    const key = String(this.#dynamicElementKey);
    this.dynamicElements[key] = buildFindElementCall(
      this.component.module,
      address,
    );
    return key;
  }
  saveNestedAsDynamicElement(address: NodeAddress, componentCls: Expression) {
    this.#dynamicElementKey++;
    const key = String(this.#dynamicElementKey);
    this.dynamicElements[key] = buildNestedClassCall(
      this.component.module,
      address,
      componentCls,
    );
    return key;
  }
  addLookup(expression: Expression) {
    const hashExpression = (expr) => {
      const copy = JSON.parse(JSON.stringify(expr));
      removeKeys(copy, ["start", "end", "loc"]);
      return JSON.stringify(copy);
    };
    const hash = hashExpression(expression);
    if (this.#lookupKeys.indexOf(hash) === -1) {
      this.#lookupKeys.push(hash);
    }
    const key = String(this.#lookupKeys.indexOf(hash));
    this.lookups[key] = functionExpression(
      null,
      this.getLookupCallBackParams(),
      blockStatement([returnStatement(expression)]),
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
    key: string,
    functionName: IMPORTABLES,
    remainingArgs: Expression[],
  ) {
    this.dynamicElements[key] = callExpression(
      this.getFunctionIdentifier(functionName),
      [this.dynamicElements[key], ...remainingArgs],
    );
  }
  getNextmiscStashKey() {
    this.#miscStashKey++;
    return this.#miscStashKey - 1;
  }
}

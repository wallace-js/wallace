import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { Function, ClassDeclaration } from "@babel/types";
import { IMPORTABLES } from "../constants";
import { jsxVisitors } from "../visitors/jsx";
import { buildDefineComponentCall } from "../writers";
import { error, ERROR_MESSAGES } from "../errors";
import { Component, Module } from "../models";
import { functionReturnsOnlyJSX } from "../helpers";
import { isCapitalized } from "../utils";
import { processFunctionParameters } from "./parameters";

/**
 * Base class for contexts where an arrow function of interest may be found.
 */
class AbstractContextHandler {
  componentName: string;
  component: Component;
  isMatch: boolean = false;
  module: Module;
  path: NodePath<Function>;
  functionPath: NodePath<Function>;
  constructor(path: NodePath<Function>, module: Module) {
    this.path = path;
    this.module = module;
  }
  /**
   * Call this when you have found a component.
   */
  initialiseComponent(componentName: string) {
    if (!isCapitalized(componentName)) {
      error(this.path.parentPath, ERROR_MESSAGES.CAPITALISED_COMPONENT_NAME);
    }
    const scope = this.path.scope;
    this.component = new Component(
      componentName,
      this.module,
      scope.generateUidIdentifier("p"),
      scope.generateUidIdentifier("c")
    );
    this.module.requireImport(IMPORTABLES.defineComponent);
    this.functionPath = this.path;
    this.isMatch = true;
  }
  applyTransformations(): void {
    processFunctionParameters(this.functionPath, this.component);
    this.functionPath.traverse(jsxVisitors, { component: this.component });
    this.replaceWithDefineComponentCall();
  }
  replaceWithDefineComponentCall() {
    this.functionPath.replaceWith(buildDefineComponentCall(this.component));
  }
}

function getAssignedName(path: NodePath<Function>): string {
  const parentNode = path.parentPath.node;
  if (t.isVariableDeclarator(parentNode) && t.isIdentifier(parentNode.id)) {
    return parentNode.id.name;
  }
  return "Anonymous";
}

/**
 * const Foo = () => <div></div>
 */
class AssignedJsxFunction extends AbstractContextHandler {
  constructor(path: NodePath<Function>, module: Module) {
    super(path, module);
    if (
      functionReturnsOnlyJSX(path) &&
      path.parentPath.isVariableDeclarator()
    ) {
      this.initialiseComponent(getAssignedName(path));
    }
  }
}

/**
 * A.prototype.foo = () => <div></div>
 */
class JsxFunctionAssignedToMember extends AbstractContextHandler {
  constructor(path: NodePath<Function>, module: Module) {
    super(path, module);
    if (
      functionReturnsOnlyJSX(path) &&
      path.parentPath.isAssignmentExpression()
    ) {
      // TODO: fix name to be `stub something`
      this.initialiseComponent(getAssignedName(path));
    }
  }
}

/**
 * extendComponent(Foo, () => <div></div>);
 */
class JsxFunctionInExtendComponentCall extends AbstractContextHandler {
  constructor(path: NodePath<Function>, module: Module) {
    super(path, module);
    if (
      functionReturnsOnlyJSX(path) &&
      path.parentPath.isCallExpression() &&
      // @ts-ignore
      path.parentPath.node.callee?.name === "extendComponent"
    ) {
      console.log("Found one");
      this.initialiseComponent(getAssignedName(path));
    }
  }
  getBaseComponent(): t.Identifier {
    // @ts-ignore
    return this.path.parentPath.node.arguments[0];
  }
  replaceWithDefineComponentCall() {
    this.component.baseComponent = this.getBaseComponent();
    this.path.parentPath.replaceWith(buildDefineComponentCall(this.component));
  }
}

const contextClasses = [
  AssignedJsxFunction,
  JsxFunctionAssignedToMember,
  JsxFunctionInExtendComponentCall,
];

export function identifyContextToBeHandled(
  path: NodePath<Function>,
  module: Module
): AbstractContextHandler | undefined {
  const contexts = [];
  contextClasses.forEach((contextClass) => {
    contexts.push(new contextClass(path, module));
  });
  const matches = contexts.filter((context) => context.isMatch);
  if (matches.length > 1) {
    throw new Error(
      "Function matches more than one context. This is an error with the plugin."
    );
  } else if (matches.length === 1) {
    return matches[0];
  }
}

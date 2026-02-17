import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { Function, ObjectMethod } from "@babel/types";
import { IMPORTABLES } from "../constants";
import { jsxVisitors } from "../visitors/jsx";
import { buildDefineComponentCall } from "../writers";
import { Component, Module } from "../models";
import { functionReturnsOnlyJSX } from "../helpers";
import { processFunctionParameters } from "./parameters";

type AnyFunction = Function & ObjectMethod;
/**
 * Base class for contexts where an arrow function of interest may be found.
 */
class AbstractContextHandler {
  componentName: string;
  component: Component;
  isMatch: boolean = false;
  module: Module;
  path: NodePath<AnyFunction>;
  functionPath: NodePath<AnyFunction>;
  constructor(path: NodePath<AnyFunction>, module: Module) {
    this.path = path;
    this.module = module;
  }
  /**
   * Call this when you have found a component.
   */
  initialiseComponent() {
    // if (!isCapitalized(componentName)) {
    //   error(this.path.parentPath, ERROR_MESSAGES.CAPITALISED_COMPONENT_NAME);
    // }
    const scope = this.path.scope;
    this.component = new Component(
      this.module,
      this.path.scope,
      scope.generateUidIdentifier("props"),
      scope.generateUidIdentifier("component")
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

/**
 * Special case where we change the code:
 *
 * extendComponent(Foo, () => <div></div>);
 */
class JsxFunctionInExtendComponentCall extends AbstractContextHandler {
  constructor(path: NodePath<AnyFunction>, module: Module) {
    super(path, module);
    if (
      functionReturnsOnlyJSX(path) &&
      path.parentPath.isCallExpression() &&
      // @ts-ignore
      path.parentPath.node.callee?.name === "extendComponent"
    ) {
      this.initialiseComponent();
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

/**
 *  foo = {
 *   bar() {
 *      return <div></div>;
 *    }
 *  };
 */
class JsxFunctionInObjectMethod extends AbstractContextHandler {
  keyName: string;
  constructor(path: NodePath<AnyFunction>, module: Module) {
    super(path, module);
    if (
      functionReturnsOnlyJSX(path) &&
      path.isObjectMethod() &&
      path.node.key.type === "Identifier"
    ) {
      this.keyName = path.node.key.name;
      this.initialiseComponent();
    }
  }
  replaceWithDefineComponentCall() {
    this.functionPath.replaceWith(
      t.objectProperty(
        t.identifier(this.keyName),
        buildDefineComponentCall(this.component)
      )
    );
  }
}

class AnyJsxFunction extends AbstractContextHandler {
  constructor(path: NodePath<AnyFunction>, module: Module) {
    super(path, module);
    if (functionReturnsOnlyJSX(path)) {
      this.initialiseComponent();
    }
  }
}

const contextClasses = [
  JsxFunctionInObjectMethod,
  JsxFunctionInExtendComponentCall,
  AnyJsxFunction
];

export function identifyContextToBeHandled(
  path: NodePath<AnyFunction>,
  module: Module
): AbstractContextHandler | undefined {
  for (const contextClass of contextClasses) {
    const context = new contextClass(path, module);
    if (context.isMatch) {
      return context;
    }
  }
}

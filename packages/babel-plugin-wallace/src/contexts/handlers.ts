import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { Function, ClassDeclaration } from "@babel/types";
import { IMPORTABLES } from "../constants";
import { jsxVisitors } from "../visitors/jsx";
import { buildDefineComponentCall, buildExtendComponentCall } from "../writers";
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
  constructor(path: NodePath<Function>, module: Module) {
    this.path = path;
    this.module = module;
  }
  applyTransformations(): void {
    throw new Error("not implemented");
  }
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
    this.isMatch = true;
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
 * const A = () => <div></div>
 * A.prototype.foo = () => <div></div>
 */
class AssignedJsxFunction extends AbstractContextHandler {
  pathToReplace: NodePath<Function>;
  constructor(path: NodePath<Function>, module: Module) {
    super(path, module);
    if (functionReturnsOnlyJSX(path)) {
      this.initialiseComponent(getAssignedName(path));
      module.requireImport(IMPORTABLES.defineComponent);
      this.pathToReplace = path;
    }
  }
  applyTransformations(): void {
    processFunctionParameters(this.path, this.component);
    this.path.traverse(jsxVisitors, { component: this.component });
    this.pathToReplace.replaceWith(buildDefineComponentCall(this.component));
  }
}

// class JsxClassMethod extends AbstractContextHandler {
//   classDeclarationPath: NodePath<ClassDeclaration>;
//   constructor(path: NodePath<Function>, module: Module) {
//     super(path, module);
//     if (functionReturnsOnlyJSX(path)) {
//       // @ts-ignore
//       this.classDeclarationPath = path.parentPath.parentPath;
//       if (t.isClassDeclaration(this.classDeclarationPath.node)) {
//         const className = this.classDeclarationPath.node.id.name;
//         this.initialiseComponent(className);
//         module.requireImport(IMPORTABLES.extendComponent);
//       }
//     }
//   }
//   applyTransformations(): void {
//     processFunctionParameters(this.path, this.component);
//     this.path.traverse(jsxVisitors, { component: this.component });
//     this.classDeclarationPath.insertAfter(
//       buildExtendComponentCall(this.component),
//     );
//   }
// }

// NOT SUPPORTED UNTIL WE FIND A WAY TO MAKE IT WORK WITH .nest AND .repeat
// class AbstractClassPropertyContext extends AbstractContextHandler {
//   classDeclarationPath: NodePath<ClassDeclaration>;
//   constructor(path: NodePath<Function>, module: Module) {
//     super(path, module);
//     if (this.isRightShape(path)) {
//       const parentNode = path.parentPath.node;
//       if (t.isClassProperty(parentNode)) {
//         // @ts-ignore
//         const propName = parentNode.key.name;
//         // @ts-ignore
//         this.classDeclarationPath = path.parentPath.parentPath.parentPath;
//         // @ts-ignore
//         const className = this.classDeclarationPath.node.id.name;
//         this.tryMatch(path, propName, className, module);
//       }
//     }
//   }
//   isRightShape(path: NodePath<Function>): boolean {
//     throw new Error("not implemented");
//   }
//   tryMatch(
//     path: NodePath<Function>,
//     propName: string,
//     className: string,
//     module: Module,
//   ) {
//     throw new Error("not implemented");
//   }
// }

// class JsxFunctionAssignedToJsxClassProperty extends AbstractClassPropertyContext {
//   isRightShape(path: NodePath<Function>): boolean {
//     return !!functionReturnsOnlyJSX(path);
//   }
//   tryMatch(
//     path: NodePath<Function>,
//     propName: string,
//     className: string,
//     module: Module,
//   ) {
//     if (propName === "jsx") {
//       this.initialiseComponent(className);
//       module.requireImport(IMPORTABLES.extendComponent);
//     } else {
//       error(path.parentPath, ERROR_MESSAGES.CLASS_METHOD_MUST_BE_PROPERTY_JSX);
//     }
//   }
//   applyTransformations(): void {
//     processFunctionParameters(this.path, this.component);
//     this.path.traverse(jsxVisitors, { component: this.component });
//     this.classDeclarationPath.insertAfter(
//       buildExtendComponentCall(this.component),
//     );
//   }
// }

const contextClasses = [
  AssignedJsxFunction,
  // JsxClassMethod,
  // JsxFunctionAssignedToJsxClassProperty,
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

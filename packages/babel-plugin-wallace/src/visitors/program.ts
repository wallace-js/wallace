import type { NodePath } from "@babel/core";
import type {
  Function,
  ObjectMethod,
  JSXElement,
  ImportSpecifier
} from "@babel/types";
import { error, ERROR_MESSAGES } from "../errors";
import { Module } from "../models";
import { identifyContextToBeHandled } from "../contexts/handlers";

interface State {
  module: Module;
}

// Although we're mainly interested in JSXElements, we visit nodes above where
// we expect to find those, so that we can get in before other plugins apply
// their transformations (like ES6 ArrowFunction conversion).
// Note that other such plugins may not be loaded, so we can't depend on their
// transformations happening.

export const programVisitors = {
  ImportSpecifier(path: NodePath<ImportSpecifier>, { module }: State) {
    module.foundImport(path);
  },
  Function(path: NodePath<Function & ObjectMethod>, { module }: State) {
    const contextHandler = identifyContextToBeHandled(path, module);
    if (contextHandler) {
      contextHandler.applyTransformations();
    }
  },
  // This captures JSX not caught by valid contexts, and therefore not allowed.
  JSXElement(path: NodePath<JSXElement>) {
    error(path, ERROR_MESSAGES.FOUND_JSX_IN_INVALID_LOCATION);
  }
};

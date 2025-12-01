import type { ArrayExpression, Expression, CallExpression } from "@babel/types";
import {
  arrayExpression,
  callExpression,
  cloneNode,
  identifier,
  isIdentifier,
  numericLiteral
} from "@babel/types";
import { ExtractedNode, Module } from "../models";
import {
  COMPONENT_BUILD_PARAMS,
  IMPORTABLES,
  WATCH_CALLBACK_PARAMS
} from "../constants";
import { NodeAddress } from "./types";

export function getSiblings(
  node: ExtractedNode,
  allNodes: Array<ExtractedNode>
) {
  return allNodes.filter((n) => n.parent === node.parent && n !== node);
}

export function getChildren(
  node: ExtractedNode,
  allNodes: Array<ExtractedNode>
) {
  return allNodes.filter((n) => n.parent === node);
}

export function buildAddressArray(address: NodeAddress): ArrayExpression {
  return arrayExpression(address.map((i) => numericLiteral(i)));
}

export function buildFindElementCall(
  module: Module,
  address: NodeAddress
): CallExpression {
  module.requireImport(IMPORTABLES.findElement);
  return callExpression(identifier(IMPORTABLES.findElement), [
    identifier(COMPONENT_BUILD_PARAMS.rootElement),
    buildAddressArray(address)
  ]);
}

export function buildNestedClassCall(
  module: Module,
  address: NodeAddress,
  componentCls: Expression
): CallExpression {
  module.requireImport(IMPORTABLES.nestComponent);
  return callExpression(identifier(IMPORTABLES.nestComponent), [
    identifier(COMPONENT_BUILD_PARAMS.rootElement),
    buildAddressArray(address),
    componentCls
  ]);
}

export function removeKeys(obj: Object, keys: Array<string>) {
  for (const prop in obj) {
    if (keys.includes(prop)) delete obj[prop];
    else if (typeof obj[prop] === "object") removeKeys(obj[prop], keys);
  }
}

/**
 * Use this to rename variables when there is no scope.
 * It came from chatGTP.
 */
export function renameVariablesInExpression(
  originalExpression: Expression,
  variableMapping: { [key: string]: string }
): Expression {
  // Clone the original expression to avoid modifying it
  const clonedExpression = cloneNode(originalExpression);

  // Function to replace identifiers based on the mapping
  function replaceIdentifiers(node) {
    if (isIdentifier(node) && variableMapping[node.name]) {
      return identifier(variableMapping[node.name]);
    }
    return node;
  }

  // Recursive function to traverse and update the AST
  function traverseAndReplace(node) {
    // If the node is an array (e.g., arguments), handle each element
    if (Array.isArray(node)) {
      return node.map(traverseAndReplace);
    }

    // Replace identifiers if applicable
    const newNode = replaceIdentifiers(node);

    // Recursively handle child nodes
    for (const key of Object.keys(newNode)) {
      if (newNode[key] && typeof newNode[key] === "object") {
        newNode[key] = traverseAndReplace(newNode[key]);
      }
    }
    return newNode;
  }

  return traverseAndReplace(clonedExpression);
}

/**
 * No user code gets copied into the watch callback functions, so we can hardcode params
 * as they won't clash with anything.
 */
export function buildWatchCallbackParams() {
  return [
    WATCH_CALLBACK_PARAMS.newValue,
    WATCH_CALLBACK_PARAMS.oldValue,
    WATCH_CALLBACK_PARAMS.element,
    WATCH_CALLBACK_PARAMS.props,
    WATCH_CALLBACK_PARAMS.component
  ].map((letter) => identifier(letter));
}

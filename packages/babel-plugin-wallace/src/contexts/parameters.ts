import * as t from "@babel/types";
import type { NodePath } from "@babel/core";
import type { Function, Identifier } from "@babel/types";
import { Component } from "../models";
import { EXTRA_PARAMETERS, SPECIAL_SYMBOLS } from "../constants";
import { error, ERROR_MESSAGES } from "../errors";

interface PropsMap {
  [key: string]: string;
}

function splitLast(s: string, on: string): Array<string | null> {
  const chunks = s.split(on);
  const len = chunks.length;
  return [chunks[len - 1], len > 1 ? chunks.splice(0, len - 1).join(on) : null];
}

/**
 * Expands a name to a member expression if it has dots. Works recursively.
 *
 *   "a"   >  t.Identifier('a')
 *   "a.b" >  t.MemberExpression(...)
 */
function expandNameToMemberExpression(
  name: string,
): t.MemberExpression | t.Identifier {
  const [end, rest] = splitLast(name, ".");
  if (rest === null) {
    return t.identifier(end);
  }
  return t.memberExpression(
    expandNameToMemberExpression(rest),
    t.identifier(end),
  );
}

function checkForIllegalNamesInProps(
  path: NodePath<Function>,
  propVariableMap: { [key: string]: string },
) {
  const illegalNamesFound = [];
  for (let name in EXTRA_PARAMETERS) {
    const variable = EXTRA_PARAMETERS[name];
    if (propVariableMap.hasOwnProperty(variable)) {
      illegalNamesFound.push(variable);
    }
  }
  if (illegalNamesFound.length > 0) {
    error(path, ERROR_MESSAGES.ILLEGAL_NAMES_IN_PROPS(illegalNamesFound));
  }
}

function checkForIllegalNamesInRemainingParameters(path: NodePath<Function>) {
  const extraParameters = path.node.params.slice(1);
  for (const param of extraParameters) {
    if (t.isIdentifier(param)) {
      const name = param["name"];
      if (!Object.values(EXTRA_PARAMETERS).includes(name as EXTRA_PARAMETERS)) {
        error(path, ERROR_MESSAGES.ILLEGAL_PARAMETERS(name));
      }
    } else {
      error(path, ERROR_MESSAGES.ILLEGAL_PARAMETERS(param.type));
    }
  }
}

function renamePropKeysInsideFunction(
  path: NodePath<Function>,
  propVariableMap: PropsMap,
  propsVar: string,
) {
  // Babel lets us set identifier names that look like member expressions, however...
  for (const [key, value] of Object.entries(propVariableMap)) {
    path.scope.rename(key, value === null ? propsVar : `${propsVar}.${value}`);
  }
  // We are now left with identifiers like `_p2.name` which messes up further renaming
  // as that is seen as a single identifier rather than a memberExpression, so
  // we need to replace those.
  path.traverse({
    Identifier(path: NodePath<Identifier>) {
      const name = path.node.name;
      if (name.includes(".")) {
        path.replaceWith(expandNameToMemberExpression(name));
      }
    },
  });
}

function extractFinalPropsName(path: NodePath<Function>): PropsMap {
  const propVariableMap: PropsMap = {};
  const propsParam = path.node.params[0];
  if (t.isObjectPattern(propsParam)) {
    // key: prop on original object, may be an ObjectPattern
    // value: as used in function
    for (const prop of propsParam.properties) {
      if (t.isObjectProperty(prop)) {
        if (t.isIdentifier(prop.value) && t.isIdentifier(prop.key)) {
          propVariableMap[prop.value.name] = prop.key.name;
        } else {
          // ObjectPattern - TODO: allow further deconstruction.
          throw new Error(`Unexpected prop value type: ${prop.type}`);
        }
      } else {
        throw new Error(`Unexpected prop key type: ${prop.type}`);
      }
    }
  } else if (t.isIdentifier(propsParam)) {
    propVariableMap[propsParam.name] = null;
  } else {
    throw new Error(`Unexpected props param type: ${propsParam.type}`);
  }
  return propVariableMap;
}

function renameGeneralArgs(
  path: NodePath<Function>,
  componentIdentifier: Identifier,
) {
  path.scope.rename(EXTRA_PARAMETERS.component, componentIdentifier.name);
  path.scope.rename(
    EXTRA_PARAMETERS.controller,
    `${componentIdentifier.name}.${SPECIAL_SYMBOLS.ctrl}`,
  );
}

/**
 * Process JSX function parameters which included destructuring, renaming and checking
 * for illegal names.
 */
export function processFunctionParameters(
  path: NodePath<Function>,
  component: Component,
) {
  if (path.node.params.length < 1) {
    return;
  }
  const propVariableMap = extractFinalPropsName(path);
  checkForIllegalNamesInProps(path, propVariableMap);
  checkForIllegalNamesInRemainingParameters(path);
  renamePropKeysInsideFunction(
    path,
    propVariableMap,
    component.propsIdentifier.name,
  );
  renameGeneralArgs(path, component.componentIdentifier);
}

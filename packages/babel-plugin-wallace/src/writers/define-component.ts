import * as t from "@babel/types";
import type { CallExpression } from "@babel/types";
import { Component } from "../models";
import type {
  ArrayExpression,
  FunctionExpression,
  Expression,
  ObjectExpression,
  ObjectProperty,
  StringLiteral,
} from "@babel/types";
import { identifier, objectExpression } from "@babel/types";
import { escapeSingleQuotes, stripHtml } from "../utils";
import {
  ComponentDefinitionData,
  consolidateComponent,
} from "../consolidation";
import { COMPONENT_BUILD_PARAMS } from "../constants";

// component base to inherit from. Using 0 as false.
function buildComponentBaseArg(
  componentDefinition: ComponentDefinitionData,
): Expression {
  return componentDefinition.baseComponent || t.numericLiteral(0);
}

function buildTemplateArg(
  componentDefinition: ComponentDefinitionData,
): StringLiteral {
  return t.stringLiteral(
    escapeSingleQuotes(stripHtml(componentDefinition.html)),
  );
}

function buildObjectExpression(
  object: { [key: string]: any },
  fn: (n: any) => any,
): ObjectExpression {
  const properties: Array<ObjectProperty> = [];

  for (const [key, value] of Object.entries(object)) {
    properties.push({
      type: "ObjectProperty",
      key: identifier(key),
      value: fn(value),
      computed: false,
      shorthand: false,
    });
  }
  return objectExpression(properties);
}

function buildWatchesArg(
  componentDefinition: ComponentDefinitionData,
): ArrayExpression {
  const watchDeclarations = componentDefinition.watches.map((watch) => {
    const callbacks: Array<ObjectProperty> = [];
    for (const [key, fnExpr] of Object.entries(watch.callbacks)) {
      callbacks.push({
        type: "ObjectProperty",
        key: t.identifier(key),
        value: fnExpr,
        computed: false,
        shorthand: false,
      });
    }
    return t.arrayExpression([
      t.stringLiteral(watch.stashRef),
      watch.shieldInfo
        ? t.stringLiteral(watch.shieldInfo.key)
        : t.numericLiteral(0),
      t.numericLiteral(watch.shieldInfo?.reverse ? 1 : 0),
      t.numericLiteral(watch.shieldInfo?.skipCount || 0),
      t.objectExpression(callbacks),
    ]);
  });
  return t.arrayExpression([...watchDeclarations]);
}

function buildLookupsArg(
  componentDefinition: ComponentDefinitionData,
): ObjectExpression {
  return buildObjectExpression(componentDefinition.lookups, (fnExpx) => fnExpx);
}

/**
 * 
    component._e = {
      1: findElement(rootElement, [0]),
      2: findElement(rootElement, [1, 1]),
    };
 */
function buildComponentBuildFunction(
  componentDefinition: ComponentDefinitionData,
): FunctionExpression {
  const stashValueObject = buildObjectExpression(
    componentDefinition.stash,
    (stashEntry) => stashEntry,
  );

  const stashAssignment = t.assignmentExpression(
    "=",
    t.memberExpression(t.identifier("component"), t.identifier("_e")),
    stashValueObject,
  );
  const statements = [t.expressionStatement(stashAssignment)];
  return t.functionExpression(
    null,
    [
      t.identifier(COMPONENT_BUILD_PARAMS.component),
      t.identifier(COMPONENT_BUILD_PARAMS.rootElement),
    ],
    t.blockStatement(statements),
  );
}

function buildProtoExtrasCall(
  component: ComponentDefinitionData,
): ObjectExpression {
  return t.objectExpression([]);
}

export function buildDefineComponentCall(component: Component): CallExpression {
  const componentDefinition = consolidateComponent(component);
  return t.callExpression(t.identifier("defineComponent"), [
    buildTemplateArg(componentDefinition),
    buildWatchesArg(componentDefinition),
    buildLookupsArg(componentDefinition),
    buildComponentBuildFunction(componentDefinition),
    buildComponentBaseArg(componentDefinition),
    buildProtoExtrasCall(componentDefinition),
  ]);
}

/**
 * Unused. Was for classes.
 */
export function buildExtendComponentCall(component: Component): CallExpression {
  const componentDefinition = consolidateComponent(component);
  return t.callExpression(t.identifier("extendComponent"), [
    t.memberExpression(t.identifier(component.name), t.identifier("prototype")),
    buildTemplateArg(componentDefinition),
    buildWatchesArg(componentDefinition),
    buildLookupsArg(componentDefinition),
    buildComponentBuildFunction(componentDefinition),
  ]);
}

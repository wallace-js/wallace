import * as t from "@babel/types";
import type { CallExpression } from "@babel/types";
import { Component } from "../models";
import { COMPONENT_BUILD_PARAMS, SPECIAL_SYMBOLS, IMPORTABLES } from "../constants";
import type {
  ArrayExpression,
  FunctionExpression,
  Expression,
  ObjectExpression,
  ObjectProperty
} from "@babel/types";
import { identifier, objectExpression } from "@babel/types";
import { ComponentDefinitionData, consolidateComponent } from "../consolidation";

// component base to inherit from. Using 0 as false.
function buildComponentBaseArg(componentDefinition: ComponentDefinitionData): Expression {
  return componentDefinition.baseComponent || t.numericLiteral(0);
}

/**
 * Creates an ObjectExpression from an object.
 */
function buildObjectExpression(object: {
  [key: string | number]: any;
}): ObjectExpression {
  const properties: Array<ObjectProperty> = [];
  for (const [key, value] of Object.entries(object)) {
    let actualkey: t.Identifier | t.NumericLiteral;
    if (isNaN(parseInt(key))) {
      actualkey = identifier(key);
    } else {
      actualkey = t.numericLiteral(parseInt(key));
    }
    properties.push({
      type: "ObjectProperty",
      key: actualkey,
      value: value,
      computed: false,
      shorthand: false
    });
  }
  return objectExpression(properties);
}

function buildWatchesArg(componentDefinition: ComponentDefinitionData): ArrayExpression {
  const watchDeclarations = componentDefinition.watches.map(watch => {
    const watchArg = {
      e: t.numericLiteral(watch.elementKey),
      c: buildObjectExpression(watch.callbacks)
    };
    if (watch.shieldInfo) {
      const visibilityToggle = {
        q: t.numericLiteral(watch.shieldInfo.key),
        s: t.numericLiteral(watch.shieldInfo.skipCount || 0),
        r: t.numericLiteral(watch.shieldInfo.reverse ? 1 : 0)
      };
      if (watch.shieldInfo.detacher) {
        const detacher = watch.shieldInfo.detacher;
        visibilityToggle["d"] = buildObjectExpression({
          i: t.numericLiteral(detacher.index),
          s: t.numericLiteral(detacher.stashKey),
          e: t.numericLiteral(detacher.parentKey)
        });
      }
      watchArg["v"] = buildObjectExpression(visibilityToggle);
    }
    return buildObjectExpression(watchArg);
  });
  return t.arrayExpression([...watchDeclarations]);
}

function buildLookupsArg(componentDefinition: ComponentDefinitionData): ArrayExpression {
  // TODO: clean up temp code when original is an array too.
  const keys = Object.keys(componentDefinition.lookups).sort();
  const values: FunctionExpression[] = keys.map(key => componentDefinition.lookups[key]);
  return t.arrayExpression(values);
}

function buildComponentBuildFunction(
  componentDefinition: ComponentDefinitionData
): FunctionExpression {
  // TODO: clean up temp code when original is an array too.
  const keys = Object.keys(componentDefinition.dynamicElements).sort();
  const values: CallExpression[] = keys.map(
    key => componentDefinition.dynamicElements[key]
  );

  const dynamicElementsAssignment = t.assignmentExpression(
    "=",
    t.memberExpression(
      t.identifier(COMPONENT_BUILD_PARAMS.component),
      t.identifier(SPECIAL_SYMBOLS.elementStash)
    ),
    t.arrayExpression(values)
  );
  const statements = [dynamicElementsAssignment];
  if (componentDefinition.collectedRefs.length > 0) {
    statements.unshift(
      t.assignmentExpression(
        "=",
        t.memberExpression(
          t.identifier(COMPONENT_BUILD_PARAMS.component),
          t.identifier(SPECIAL_SYMBOLS.refs)
        ),
        t.objectExpression([])
      )
    );
  }

  return t.functionExpression(
    null,
    [
      t.identifier(COMPONENT_BUILD_PARAMS.component),
      t.identifier(COMPONENT_BUILD_PARAMS.rootElement)
    ],
    t.blockStatement(statements.map(statement => t.expressionStatement(statement)))
  );
}

export function buildDefineComponentCall(component: Component): CallExpression {
  const componentDefinition = consolidateComponent(component);
  const args: any[] = [
    componentDefinition.html,
    buildWatchesArg(componentDefinition),
    buildLookupsArg(componentDefinition),
    buildComponentBuildFunction(componentDefinition)
  ];
  if (componentDefinition.baseComponent) {
    args.push(buildComponentBaseArg(componentDefinition));
  }
  return t.callExpression(t.identifier(IMPORTABLES.defineComponent), args);
}

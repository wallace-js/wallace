import * as t from "@babel/types";
import type { CallExpression } from "@babel/types";
import { Component } from "../models";
import { wallaceConfig } from "../config";
import { COMPONENT_PROPERTIES, IMPORTABLES } from "../constants";
import type {
  ArrayExpression,
  FunctionExpression,
  Expression,
  ObjectExpression,
  ObjectProperty
} from "@babel/types";
import { identifier, objectExpression } from "@babel/types";
import { ComponentDefinitionData, consolidateComponent } from "../consolidation";

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
        visibilityToggle["d"] = t.newExpression(t.identifier(IMPORTABLES.detacher), [
          t.numericLiteral(detacher.originalIndex),
          t.numericLiteral(detacher.parentKey),
          t.numericLiteral(detacher.stashKey)
        ]);
      }
      watchArg["v"] = buildObjectExpression(visibilityToggle);
    }
    return buildObjectExpression(watchArg);
  });
  return t.arrayExpression([...watchDeclarations]);
}

function buildLookupsArg(componentDefinition: ComponentDefinitionData): ArrayExpression {
  // watch out for keys turning into strings!
  const lookups = componentDefinition.lookups;
  const keys = [...lookups.keys()].sort((a, b) => a - b);
  return t.arrayExpression(keys.map(key => lookups.get(key)));
}

function buildConstructor(
  componentDefinition: ComponentDefinitionData
): FunctionExpression {
  const tmpThis = t.identifier(COMPONENT_PROPERTIES.tmpThis);
  const emptyObject = () => t.objectExpression([]);
  const assignThis = (field: COMPONENT_PROPERTIES, expr: Expression) =>
    t.assignmentExpression("=", t.memberExpression(tmpThis, t.identifier(field)), expr);

  const assignAndDeclare = (field: COMPONENT_PROPERTIES, expr: Expression) =>
    t.variableDeclarator(
      t.identifier(field),
      t.assignmentExpression("=", t.memberExpression(tmpThis, t.identifier(field)), expr)
    );

  const createRootExpression = componentDefinition.component.unique
    ? t.memberExpression(tmpThis, t.identifier(COMPONENT_PROPERTIES.template))
    : t.callExpression(
        t.memberExpression(
          t.memberExpression(tmpThis, t.identifier(COMPONENT_PROPERTIES.template)),
          t.identifier("cloneNode")
        ),
        [t.booleanLiteral(true)]
      );

  const chainedConstExpressions = [
    t.variableDeclarator(tmpThis, t.thisExpression()),
    assignAndDeclare(COMPONENT_PROPERTIES.root, createRootExpression)
  ];

  if (componentDefinition.refs.length > 0) {
    chainedConstExpressions.push(
      assignAndDeclare(COMPONENT_PROPERTIES.ref, emptyObject())
    );
  }

  if (componentDefinition.parts.length > 0) {
    chainedConstExpressions.push(
      assignAndDeclare(COMPONENT_PROPERTIES.part, emptyObject())
    );
  }

  componentDefinition.detachers.forEach((detacher, i) => {
    chainedConstExpressions.push(
      t.variableDeclarator(t.identifier(componentDefinition.getDetacherId(i)), detacher)
    );
  });

  const expressions: any[] = [
    assignThis(COMPONENT_PROPERTIES.props, emptyObject()),
    assignThis(
      COMPONENT_PROPERTIES.watchLength,
      t.memberExpression(
        t.memberExpression(tmpThis, t.identifier(COMPONENT_PROPERTIES.watches)),
        t.identifier("length")
      )
    ),
    assignThis(
      COMPONENT_PROPERTIES.previous,
      t.arrayExpression(componentDefinition.watches.map(watch => t.objectExpression([])))
    )
  ];
  if (componentDefinition.stash.length > 0) {
    expressions.push(
      assignThis(COMPONENT_PROPERTIES.stash, t.arrayExpression(componentDefinition.stash))
    );
  }

  if (wallaceConfig.flags.useControllers) {
    expressions.unshift(assignThis(COMPONENT_PROPERTIES.ctrl, emptyObject()));
  }

  // const dynamicElementCalls = getDynamicElements(componentDefinition);

  if (componentDefinition.dynamicElements.length > 0) {
    expressions.push(
      t.assignmentExpression(
        "=",
        t.memberExpression(tmpThis, t.identifier(COMPONENT_PROPERTIES.elements)),
        t.arrayExpression(componentDefinition.dynamicElements)
      )
    );
  }

  return t.functionExpression(
    null,
    [],
    t.blockStatement([
      t.variableDeclaration("const", chainedConstExpressions),
      ...expressions.map(expr => t.expressionStatement(expr))
    ])
  );
}

export function buildDefineComponentCall(component: Component): CallExpression {
  const componentDefinition = consolidateComponent(component);
  const args: any[] = [
    componentDefinition.html,
    buildWatchesArg(componentDefinition),
    buildLookupsArg(componentDefinition),
    buildConstructor(componentDefinition)
  ];
  if (componentDefinition.baseComponent) {
    args.push(componentDefinition.baseComponent);
  }
  return t.callExpression(t.identifier(IMPORTABLES.defineComponent), args);
}

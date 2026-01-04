import * as t from "@babel/types";
import type { CallExpression } from "@babel/types";
import { Component } from "../models";
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
  // TODO: clean up temp code when original on componentDefinition is an array too.
  const keys = Object.keys(componentDefinition.lookups).sort();
  const values: FunctionExpression[] = keys.map(key => componentDefinition.lookups[key]);
  return t.arrayExpression(values);
}

function getDynamicElements(componentDefinition): CallExpression[] {
  // TODO: clean up temp code when original on componentDefinition is an array too.
  const keys = Object.keys(componentDefinition.dynamicElements).sort();
  return keys.map(key => componentDefinition.dynamicElements[key]);
}

function buildConstructor(
  componentDefinition: ComponentDefinitionData
): FunctionExpression {
  const emptyObject = () => t.objectExpression([]);
  const assignThis = (field: COMPONENT_PROPERTIES, expr: Expression) =>
    t.assignmentExpression(
      "=",
      t.memberExpression(t.thisExpression(), t.identifier(field)),
      expr
    );

  const assignAndDeclare = (field: COMPONENT_PROPERTIES, expr: Expression) =>
    t.variableDeclarator(
      t.identifier(field),
      t.assignmentExpression(
        "=",
        t.memberExpression(t.thisExpression(), t.identifier(field)),
        expr
      )
    );

  const chainedConstExpressions = [
    assignAndDeclare(
      COMPONENT_PROPERTIES.root,
      t.callExpression(
        t.memberExpression(
          t.memberExpression(
            t.thisExpression(),
            t.identifier(COMPONENT_PROPERTIES.template)
          ),
          t.identifier("cloneNode")
        ),
        [t.booleanLiteral(true)]
      )
    )
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

  if (componentDefinition.needsTempThis) {
    chainedConstExpressions.push(
      t.variableDeclarator(t.identifier(COMPONENT_PROPERTIES.tmpThis), t.thisExpression())
    );
  }

  if (componentDefinition.needsStash) {
    chainedConstExpressions.push(
      assignAndDeclare(COMPONENT_PROPERTIES.stash, t.arrayExpression([]))
    );
  }

  const expressions: any[] = [
    assignThis(COMPONENT_PROPERTIES.props, emptyObject()),
    assignThis(COMPONENT_PROPERTIES.ctrl, emptyObject()),
    assignThis(
      COMPONENT_PROPERTIES.watchLength,
      t.memberExpression(
        t.memberExpression(
          t.thisExpression(),
          t.identifier(COMPONENT_PROPERTIES.watches)
        ),
        t.identifier("length")
      )
    ),
    assignThis(
      COMPONENT_PROPERTIES.previous,
      t.arrayExpression(componentDefinition.watches.map(watch => t.objectExpression([])))
    )
  ];

  const dynamicElementCalls = getDynamicElements(componentDefinition);

  if (dynamicElementCalls.length > 0) {
    expressions.push(
      t.assignmentExpression(
        "=",
        t.memberExpression(
          t.thisExpression(),
          t.identifier(COMPONENT_PROPERTIES.elements)
        ),
        t.arrayExpression(dynamicElementCalls)
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

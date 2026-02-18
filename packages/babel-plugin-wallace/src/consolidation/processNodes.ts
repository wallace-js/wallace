import type { Identifier } from "@babel/types";
import {
  arrowFunctionExpression,
  blockStatement,
  callExpression,
  expressionStatement,
  identifier,
  memberExpression,
  newExpression,
  numericLiteral,
  stringLiteral
} from "@babel/types";
import * as t from "@babel/types";
import { wallaceConfig } from "../config";
import { Component, ExtractedNode, RepeatInstruction, VisibilityToggle } from "../models";
import { ERROR_MESSAGES, error } from "../errors";
import {
  COMPONENT_PROPERTIES,
  EVENT_CALLBACK_ARGS,
  IMPORTABLES,
  SPECIAL_SYMBOLS,
  WATCH_CALLBACK_ARGS,
  WATCH_AlWAYS_CALLBACK_ARGS,
  XARGS
} from "../constants";
import { ComponentDefinitionData, ComponentWatch } from "./ComponentDefinitionData";
import {
  buildNestedClassCall,
  getChildren,
  getSiblings,
  renameVariablesInExpression
} from "./utils";

export function processNode(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode
) {
  if (node.isRepeatedComponent) {
    // The watch should already have been added to the parent node, which is already
    // processed. All we do here is run some extra checks.
    // TODO: do this with visitor?
    const children = getChildren(node, componentDefinition.component.extractedNodes);
    if (children.length > 0) {
      error(node.path, ERROR_MESSAGES.REPEAT_DIRECTIVE_WITH_CHILDREN);
    }

    if (!wallaceConfig.flags.allowRepeaterSiblings) {
      const siblings = getSiblings(node, componentDefinition.component.extractedNodes);
      if (siblings.length > 0) {
        error(node.path, ERROR_MESSAGES.REPEAT_DIRECTIVE_WITH_SIBLINGS);
      }
    }
  }
  // Need to happen first
  ensureToggleTargetsHaveTriggers(node);
  createEventsForBoundInputs(componentDefinition, node);
  addRequiredImports(componentDefinition, node);

  const visibilityToggle = node.getVisibilityToggle();
  const ref = node.getRef();
  const part = node.getPart();
  const repeatInstruction = node.getRepeatInstruction();
  const hasBoundInputs = node.bindInstructions.expression;
  const hasClassToggles = node.classToggleTriggers.length > 0;
  const hasEventListeners = node.eventListeners.length > 0;
  const hasWatches = node.watches.length > 0;
  const isStub = node.getStubName() !== undefined;

  const needsWatch =
    hasWatches ||
    hasBoundInputs ||
    hasClassToggles ||
    visibilityToggle ||
    node.isNestedComponent ||
    repeatInstruction ||
    isStub;

  const shouldSaveElement =
    hasWatches ||
    hasBoundInputs ||
    hasClassToggles ||
    visibilityToggle ||
    ref ||
    part ||
    hasEventListeners ||
    isStub ||
    node.isNestedComponent ||
    node.hasConditionalChildren ||
    node.hasRepeatedChildren;

  // Note the detacher is associated with the parent node of conditionally displayed
  // or repeated nodes.
  const needsDetacher =
    node.hasConditionalChildren || (node.hasRepeatedChildren && node.children.length > 1);

  if (needsDetacher) {
    const detacherObject = t.newExpression(t.identifier("Map"), []);
    if (node.hasRepeatedChildren) {
      // We must save it to a variable so we can reference it when creating the
      // repeater.
      node.detacherIdentifier = componentDefinition.addDeclaration(detacherObject);
      node.detacherStashKey = componentDefinition.stashItem(node.detacherIdentifier);
    } else {
      node.detacherStashKey = componentDefinition.stashItem(detacherObject);
    }
  }

  if (shouldSaveElement) {
    if (node.isNestedComponent || isStub) {
      saveNestedOrStubElement(isStub, node, componentDefinition);
    } else {
      node.elementKey = componentDefinition.saveDynamicElement(node.address);
    }
  }

  if (needsWatch) {
    // Must be called before watches are processed.
    const componentWatch = new ComponentWatch(
      node,
      componentDefinition,
      repeatInstruction ? node.parent.elementKey : node.elementKey,
      node.address
    );

    if (node.isNestedComponent) {
      processNestedComponent(componentDefinition, componentWatch, node);
    }

    if (visibilityToggle) {
      processVisibilityToggle(
        componentDefinition,
        node,
        componentWatch,
        visibilityToggle
      );
    }

    if (repeatInstruction) {
      processRepeater(componentDefinition, node, repeatInstruction, componentWatch);
    }

    if (hasClassToggles) {
      addToggleCallbackStatement(componentDefinition, node, componentWatch);
    }

    if (isStub) {
      processStub(componentDefinition, node, componentWatch);
    }

    componentWatch.consolidate();
  }

  if (hasEventListeners) {
    processEventListeners(componentDefinition, node);
  }
  if (ref) processRef(componentDefinition, node, ref);
  if (part) processPart(componentDefinition, node, part);
}

function addRequiredImports(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode
) {
  node.requiredImports.forEach(importName => {
    componentDefinition.component.module.requireImport(importName);
  });
}

function processNestedComponent(
  componentDefinition: ComponentDefinitionData,
  componentWatch: ComponentWatch,
  node: ExtractedNode
) {
  const callbackArgs = [node.getProps() || t.objectExpression([])];
  if (wallaceConfig.flags.allowCtrl) {
    callbackArgs.push(getCtrlExpression(node, componentDefinition.component));
  }

  componentWatch.add(SPECIAL_SYMBOLS.noLookup, [
    expressionStatement(
      callExpression(
        memberExpression(
          identifier(WATCH_AlWAYS_CALLBACK_ARGS.element),
          identifier(COMPONENT_PROPERTIES.render)
        ),
        callbackArgs
      )
    )
  ]);
}

function processVisibilityToggle(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  componentWatch: ComponentWatch,
  visibilityToggle: VisibilityToggle
) {
  const shieldLookupKey = componentDefinition.addLookup(visibilityToggle.expression);
  componentWatch.shieldInfo = {
    skipCount: 0, // gets set later once we've processed all the nodes.
    key: shieldLookupKey,
    reverse: visibilityToggle.reverse
  };
  if (visibilityToggle.detach) {
    if (node.parent.detacherStashKey === undefined) {
      throw new Error("Parent node was not given a stash key");
    }
    componentDefinition.component.module.requireImport(IMPORTABLES.detacher);
    componentWatch.shieldInfo.detacher = {
      originalIndex: node.initialIndex,
      stashKey: node.parent.detacherStashKey,
      parentKey: node.parent.elementKey
    };
  }
}

function saveNestedOrStubElement(
  isStub: boolean,
  node: ExtractedNode,
  componentDefinition: ComponentDefinitionData
) {
  const componentCls = isStub
    ? t.callExpression(t.identifier(IMPORTABLES.getStub), [
        t.thisExpression(),
        t.stringLiteral(node.getStubName())
      ])
    : t.identifier(node.tagName);

  if (wallaceConfig.flags.allowDismount) {
    // We need to save to stash and register as a dismountable.
    const componentExpression = componentDefinition.addDeclaration(
      buildNestedClassCall(
        componentDefinition.component.module,
        node.address,
        componentCls
      )
    );
    const stashKey = componentDefinition.stashItem(componentExpression);
    componentDefinition.dismountKeys.push(stashKey);
    const dynamicElements = componentDefinition.dynamicElements;
    dynamicElements.push(componentExpression);
    node.elementKey = dynamicElements.length - 1;
  } else {
    // Do it normally
    node.elementKey = componentDefinition.saveNestedAsDynamicElement(
      node.address,
      componentCls
    );
  }
}

function processStub(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  componentWatch: ComponentWatch
) {
  const component = componentDefinition.component;
  componentDefinition.component.module.requireImport(IMPORTABLES.getStub);
  const callbackArgs: any[] = [component.propsIdentifier];
  if (wallaceConfig.flags.allowCtrl) {
    callbackArgs.push(getCtrlExpression(node, component));
  }
  componentWatch.add(SPECIAL_SYMBOLS.noLookup, [
    expressionStatement(
      callExpression(
        memberExpression(
          // In this case "element" is in fact the nested component.
          identifier(WATCH_AlWAYS_CALLBACK_ARGS.element),
          identifier(COMPONENT_PROPERTIES.render)
        ),
        callbackArgs
      )
    )
  ]);
}

function createEventsForBoundInputs(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode
) {
  let setExpression,
    setProperty,
    { expression, event, property } = node.bindInstructions;

  if (expression === undefined) {
    if (event) {
      error(node.path, ERROR_MESSAGES.EVENT_USED_WITHOUT_BIND);
    }
    return;
  }
  event = event || "change";
  property = property || "value";

  // This is a hack to deal with Proxy Date objects, which we get from `watch` as they
  // are rejected as not being Date objects:
  //
  //   Uncaught TypeError: Failed to set the 'valueAsDate' property on
  //   'HTMLInputElement': The provided value is not a Date.
  //
  // Essentially we convert to string and write to value instead. We still read from
  // valueAsDate.
  // This relies on binding methods to the target, which is done inside watch.
  // For this same reason valueAsDate is also a hidden directive.
  if (property == "valueAsDate") {
    componentDefinition.component.module.requireImport(IMPORTABLES.toDateString);
    setProperty = "value";
    setExpression = t.callExpression(t.identifier(IMPORTABLES.toDateString), [
      expression
    ]);
  } else {
    setProperty = property;
    setExpression = expression;
  }

  // This is the callback, which must be alwaysUpate as there's otherwise a glitch
  // caused by the fact this isn't tiggering an update, and therefore not resetting
  // the previous stored value, which eventually ends up being the same as the new
  // value, causing the element not to update.
  node.addWatch(
    SPECIAL_SYMBOLS.noLookup,
    t.assignmentExpression(
      "=",
      t.memberExpression(
        t.identifier(WATCH_AlWAYS_CALLBACK_ARGS.element),
        t.identifier(setProperty)
      ),
      setExpression as Identifier
    )
  );

  // This is the event handler that updates the data:
  const callback = t.assignmentExpression(
    "=",
    expression as Identifier,
    t.memberExpression(
      t.memberExpression(t.identifier(EVENT_CALLBACK_ARGS.event), t.identifier("target")),
      t.identifier(property)
    )
  );
  node.addEventListener(event, callback);
}

function ensureToggleTargetsHaveTriggers(node: ExtractedNode) {
  node.classToggleTargets.forEach(target => {
    const match = node.classToggleTriggers.find(trigger => trigger.name == target.name);
    if (!match) {
      error(node.path, ERROR_MESSAGES.TOGGLE_TARGETS_WITHOUT_TOGGLE_TRIGGERS);
    }
  });
}

function getCtrlExpression(node: ExtractedNode, component: Component) {
  return (
    node.getCtrl() ||
    memberExpression(component.componentIdentifier, identifier(COMPONENT_PROPERTIES.ctrl))
  );
}

function extractCssClasses(value: string | t.Expression) {
  if (typeof value == "string") {
    return value
      .trim()
      .split(" ")
      .map(v => t.stringLiteral(v));
  } else {
    return [t.spreadElement(value)];
  }
}

/**
 * Notes: toggles are implemented as add/remove because:
 *  a) they allow multiple classes
 *  b) it's less brittle around truthiness
 */
function addToggleCallbackStatement(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  componentWatch: ComponentWatch
) {
  node.classToggleTriggers.forEach(trigger => {
    const target = node.classToggleTargets.find(target => target.name == trigger.name);
    const classesToToggle = target
      ? extractCssClasses(target.value)
      : [t.stringLiteral(trigger.name)];
    const toBoolExpression = trigger.expression;
    const lookupKey = componentDefinition.addLookup(toBoolExpression);
    const getCallback = (method: "add" | "remove") =>
      callExpression(
        memberExpression(
          memberExpression(
            identifier(WATCH_CALLBACK_ARGS.element),
            identifier("classList")
          ),
          identifier(method)
        ),
        classesToToggle
      );

    componentWatch.add(lookupKey, [
      t.ifStatement(
        t.identifier(WATCH_CALLBACK_ARGS.newValue),
        blockStatement([expressionStatement(getCallback("add"))]),
        blockStatement([expressionStatement(getCallback("remove"))])
      )
    ]);
  });
}

function processRepeater(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  repeatInstruction: RepeatInstruction,
  componentWatch: ComponentWatch
) {
  const component = componentDefinition.component;
  const detacherInfo = node.parent.detacherIdentifier
    ? {
        index: node.initialIndex,
        detacherVariable: node.parent.detacherIdentifier
      }
    : undefined;

  let repeaterClass;
  const repeaterArgs: any = [identifier(repeatInstruction.componentCls)];
  if (repeatInstruction.repeatKey) {
    repeaterClass = IMPORTABLES.KeyedRepeater;
    if (typeof repeatInstruction.repeatKey === "string") {
      repeaterArgs.push(t.stringLiteral(repeatInstruction.repeatKey));
    } else {
      repeaterArgs.push(repeatInstruction.repeatKey);
    }
  } else {
    repeaterClass = IMPORTABLES.SequentialRepeater;
  }
  componentDefinition.component.module.requireImport(repeaterClass);
  if (detacherInfo) {
    repeaterArgs.push(detacherInfo.detacherVariable, numericLiteral(detacherInfo.index));
  }
  const stashKey = componentDefinition.stashItem(
    newExpression(identifier(repeaterClass), repeaterArgs)
  );

  if (wallaceConfig.flags.allowDismount) {
    componentDefinition.dismountKeys.push(stashKey);
  }

  const callbackArgs = [
    identifier(WATCH_AlWAYS_CALLBACK_ARGS.element),
    repeatInstruction.expression
  ];
  if (wallaceConfig.flags.allowCtrl) {
    callbackArgs.push(getCtrlExpression(node, component));
  }
  componentWatch.add(SPECIAL_SYMBOLS.noLookup, [
    expressionStatement(
      callExpression(
        memberExpression(
          memberExpression(
            identifier(WATCH_AlWAYS_CALLBACK_ARGS.stash),
            numericLiteral(stashKey),
            true
          ),
          identifier(SPECIAL_SYMBOLS.patch)
        ),
        callbackArgs
      )
    )
  ]);
}

function processPart(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  name: string
) {
  const otherParts = componentDefinition.parts.map(r => r.name);
  if (otherParts.includes(name)) {
    error(node.path, ERROR_MESSAGES.PARTS_MUST_BE_UNIQUE_WITHIN_EACH_COMPONENT);
  }
  // Note: we modify this call expression in post processing.
  const callExpression = componentDefinition.wrapDynamicElementCall(
    node.elementKey,
    IMPORTABLES.savePart,
    [t.thisExpression(), identifier(COMPONENT_PROPERTIES.part), t.stringLiteral(name)]
  );
  const part = { name, callExpression, address: node.address };
  componentDefinition.parts.push(part);
}

function processRef(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  name: string
) {
  if (componentDefinition.refs.includes(name)) {
    error(node.path, ERROR_MESSAGES.REFS_MUST_BE_UNIQUE_WITHIN_EACH_COMPONENT);
  }
  componentDefinition.wrapDynamicElementCall(node.elementKey, IMPORTABLES.saveRef, [
    identifier(COMPONENT_PROPERTIES.ref),
    t.stringLiteral(name)
  ]);
  componentDefinition.refs.push(name);
}

function processEventListeners(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode
) {
  const component = componentDefinition.component;
  // TODO: improve this, as we are basically renaming things specifically for the
  // build function that have already been renamed, which can get confusing.
  // It also needs to rename ctrl and props explicitly as it doesn't seem to
  // rename component when it's a member expression.
  const eventVariableMapping: { [key: string]: string } = {
    [component.componentIdentifier.name]: COMPONENT_PROPERTIES.tmpThis,
    [component.componentIdentifier.name + "." + COMPONENT_PROPERTIES.ctrl]:
      `${COMPONENT_PROPERTIES.tmpThis}.${COMPONENT_PROPERTIES.ctrl}`,
    [component.propsIdentifier.name]:
      `${COMPONENT_PROPERTIES.tmpThis}.${COMPONENT_PROPERTIES.props}`
  };
  if (component.xargMapping.hasOwnProperty(XARGS.element)) {
    eventVariableMapping[EVENT_CALLBACK_ARGS.element] =
      `${EVENT_CALLBACK_ARGS.event}.target`;
  }
  node.eventListeners.forEach(listener => {
    const updatedExpression = renameVariablesInExpression(
      listener.callback,
      eventVariableMapping
    );
    componentDefinition.wrapDynamicElementCall(node.elementKey, IMPORTABLES.onEvent, [
      stringLiteral(listener.eventName),
      arrowFunctionExpression(
        [identifier(EVENT_CALLBACK_ARGS.event)],
        blockStatement([expressionStatement(updatedExpression)])
      )
    ]);
  });
}

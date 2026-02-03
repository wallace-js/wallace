import type { Identifier, Statement } from "@babel/types";
import {
  blockStatement,
  callExpression,
  Expression,
  expressionStatement,
  functionExpression,
  identifier,
  memberExpression,
  newExpression,
  numericLiteral,
  stringLiteral
} from "@babel/types";
import * as t from "@babel/types";
import { wallaceConfig } from "../config";
import { codeToNode } from "../utils";
import { Component, ExtractedNode, RepeatInstruction } from "../models";
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
import { ComponentWatch } from "./types";
import { ComponentDefinitionData } from "./ComponentDefinitionData";
import {
  getSiblings,
  getChildren,
  renameVariablesInExpression,
  buildWatchCallbackParams
} from "./utils";

function addBindInstruction(node: ExtractedNode) {
  if (node.tagName.toLowerCase() == "input") {
    // @ts-ignore
    const inputType = node.element.type.toLowerCase();
    const attribute = inputType === "checkbox" ? "checked" : "value";
    node.bindInstructions.forEach(({ eventName, expression }) => {
      // node.watchAttribute(attribute, expression);

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
            t.identifier(attribute)
          ),
          expression as Identifier
        )
      );

      // This is the event handler that updates the data:
      const callback = t.assignmentExpression(
        "=",
        expression as Identifier,
        t.memberExpression(
          t.memberExpression(
            t.identifier(EVENT_CALLBACK_ARGS.event),
            t.identifier("target")
          ),
          t.identifier(attribute)
        )
      );
      node.addEventListener(eventName, callback);
    });
  } else {
    error(node.path, ERROR_MESSAGES.BIND_ONLY_ALLOWED_ON_INPUT);
  }
}

function ensureToggleTargetsHaveTriggers(node: ExtractedNode) {
  node.toggleTargets.forEach(target => {
    const match = node.toggleTriggers.find(trigger => trigger.name == target.name);
    if (!match) {
      error(node.path, ERROR_MESSAGES.TOGGLE_TARGETS_WITHOUT_TOGGLE_TRIGGERS);
    }
  });
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

// Notes: toggles are implemented as add/remove because:
//  a) they allow multiple classes
//  b) it's less brittle around truthiness

function addToggleCallbackStatement(
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  addCallbackStatement: (lookupKey: string | number, statements: Statement[]) => void
) {
  node.toggleTriggers.forEach(trigger => {
    const target = node.toggleTargets.find(target => target.name == trigger.name);
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

    addCallbackStatement(lookupKey, [
      t.ifStatement(
        t.identifier(WATCH_CALLBACK_ARGS.newValue),
        blockStatement([expressionStatement(getCallback("add"))]),
        blockStatement([expressionStatement(getCallback("remove"))])
      )
    ]);
  });
}

function getKeyFunction(repeatKey: Expression | string | undefined) {
  if (typeof repeatKey === "string") {
    const param = t.identifier("x");
    return t.functionExpression(
      null,
      [param],
      t.blockStatement([
        t.returnStatement(t.memberExpression(param, t.identifier(repeatKey)))
      ])
    );
  }
  return repeatKey;
}

function processRepeater(
  component: Component,
  componentDefinition: ComponentDefinitionData,
  node: ExtractedNode,
  repeatInstruction: RepeatInstruction,
  addCallbackStatement: (lookupKey: string | number, statements: Statement[]) => void
) {
  let repeaterInstance, repeaterClass;
  if (repeatInstruction.repeatKey) {
    repeaterClass = IMPORTABLES.KeyedRepeater;
    repeaterInstance = newExpression(identifier(repeaterClass), [
      identifier(repeatInstruction.componentCls),
      getKeyFunction(repeatInstruction.repeatKey)
    ]);
  } else {
    repeaterClass = IMPORTABLES.SequentialRepeater;
    repeaterInstance = newExpression(identifier(repeaterClass), [
      identifier(repeatInstruction.componentCls)
    ]);
  }

  componentDefinition.component.module.requireImport(repeaterClass);
  componentDefinition.component.module.requireImport(IMPORTABLES.stashMisc);

  // TODO: couple the stash index with the call to save - if possible?
  // Or make it an object and pass the key when saving.
  const miscStashKey = componentDefinition.getNextmiscStashKey();
  componentDefinition.wrapDynamicElementCall(node.elementKey, IMPORTABLES.stashMisc, [
    identifier(COMPONENT_PROPERTIES.stash),
    repeaterInstance
  ]);
  const callbackArgs = [
    identifier(WATCH_AlWAYS_CALLBACK_ARGS.element),
    repeatInstruction.expression
  ];
  if (wallaceConfig.flags.useControllers) {
    const ctrlExpression =
      node.getCtrl() ||
      memberExpression(
        component.componentIdentifier,
        identifier(COMPONENT_PROPERTIES.ctrl)
      );
    callbackArgs.push(ctrlExpression);
  }
  addCallbackStatement(SPECIAL_SYMBOLS.noLookup, [
    expressionStatement(
      callExpression(
        memberExpression(
          memberExpression(
            memberExpression(
              component.componentIdentifier,
              identifier(COMPONENT_PROPERTIES.stash)
            ),
            numericLiteral(miscStashKey),
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
  // Note: we modify this call expression in post processing.
  componentDefinition.wrapDynamicElementCall(node.elementKey, IMPORTABLES.saveRef, [
    identifier(COMPONENT_PROPERTIES.ref),
    t.stringLiteral(name)
  ]);
  componentDefinition.refs.push(name);
}

// TODO: break this up.
export function processNodes(
  component: Component,
  componentDefinition: ComponentDefinitionData
) {
  component.extractedNodes.forEach(node => {
    if (node.isRepeatedComponent) {
      // The watch should already have been added to the parent node, which is already
      // processed. All we do here is run some extra checks.
      const siblings = getSiblings(node, component.extractedNodes);
      if (siblings.length > 0) {
        error(node.path, ERROR_MESSAGES.REPEAT_DIRECTIVE_WITH_SIBLINGS);
      }
      const children = getChildren(node, component.extractedNodes);
      if (children.length > 0) {
        error(node.path, ERROR_MESSAGES.REPEAT_DIRECTIVE_WITH_CHILDREN);
      }
      return;
    }

    const stubName = node.getStub();
    let stubExpression: t.Expression | undefined;
    if (stubName) {
      componentDefinition.component.module.requireImport(IMPORTABLES.getStub);
      stubExpression = t.callExpression(t.identifier(IMPORTABLES.getStub), [
        t.thisExpression(),
        t.stringLiteral(stubName)
      ]);
    }
    const visibilityToggle = node.getVisibilityToggle();
    const ref = node.getRef();
    const part = node.getPart();
    const repeatInstruction = node.getRepeatInstruction();
    const createWatch =
      node.watches.length > 0 ||
      node.bindInstructions.length > 0 ||
      node.toggleTriggers.length > 0 ||
      visibilityToggle ||
      node.isNestedComponent ||
      repeatInstruction || // This is NOT the same as .isRepeatedComponent, which is on parent!
      stubName;

    // TODO: some of these should not save the element...
    // restructure.
    const shouldSaveElement =
      createWatch ||
      ref ||
      part ||
      node.eventListeners.length > 0 ||
      node.hasConditionalChildren;

    ensureToggleTargetsHaveTriggers(node);

    if (shouldSaveElement) {
      const nestedComponentCls =
        node.isNestedComponent || node.isRepeatedComponent
          ? t.identifier(node.tagName)
          : stubExpression;
      node.elementKey = nestedComponentCls
        ? componentDefinition.saveNestedAsDynamicElement(node.address, nestedComponentCls)
        : componentDefinition.saveDynamicElement(node.address);

      if (node.bindInstructions.length) {
        addBindInstruction(node);
      }

      if (node.hasConditionalChildren) {
        node.detacherStashKey = componentDefinition.getNextmiscStashKey();
        componentDefinition.wrapDynamicElementCall(
          node.elementKey,
          IMPORTABLES.stashMisc,
          [identifier(COMPONENT_PROPERTIES.stash), t.objectExpression([])]
        );
      }

      if (createWatch) {
        const _callbacks: { [key: string | number]: Array<Statement> } = {};
        const addCallbackStatement = (key: string | number, statements: Statement[]) => {
          if (!_callbacks.hasOwnProperty(key)) {
            _callbacks[key] = [];
          }
          _callbacks[key].push(...statements);
        };

        const componentWatch: ComponentWatch = {
          elementKey: node.elementKey,
          callbacks: {},
          address: node.address
        };
        componentDefinition.watches.push(componentWatch);

        node.watches.forEach(watch => {
          if (watch.expression == SPECIAL_SYMBOLS.noLookup) {
            addCallbackStatement(SPECIAL_SYMBOLS.noLookup, codeToNode(watch.callback));
          } else {
            const lookupKey = componentDefinition.addLookup(watch.expression);
            addCallbackStatement(lookupKey, codeToNode(watch.callback));
          }
        });

        if (node.isNestedComponent) {
          const callbackArgs = [node.getProps() || t.objectExpression([])];
          if (wallaceConfig.flags.useControllers) {
            const ctrlExpression =
              node.getCtrl() ||
              memberExpression(
                component.componentIdentifier,
                identifier(COMPONENT_PROPERTIES.ctrl)
              );
            callbackArgs.push(ctrlExpression);
          }

          addCallbackStatement(SPECIAL_SYMBOLS.noLookup, [
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

        if (node.toggleTriggers.length) {
          addToggleCallbackStatement(componentDefinition, node, addCallbackStatement);
        }

        if (stubName) {
          const callbackArgs: any[] = [component.propsIdentifier];
          if (wallaceConfig.flags.useControllers) {
            const ctrlExpression =
              node.getCtrl() ||
              memberExpression(
                component.componentIdentifier,
                identifier(COMPONENT_PROPERTIES.ctrl)
              );
            callbackArgs.push(ctrlExpression);
          }
          addCallbackStatement(SPECIAL_SYMBOLS.noLookup, [
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

        if (visibilityToggle) {
          const shieldLookupKey = componentDefinition.addLookup(
            visibilityToggle.expression
          );
          componentWatch.shieldInfo = {
            skipCount: 0, // gets set later once we've processed all the nodes.
            key: shieldLookupKey,
            reverse: visibilityToggle.reverse
          };
          if (visibilityToggle.detach) {
            if (node.parent.detacherStashKey === undefined) {
              throw new Error("Parent node was not given a stash key");
            }
            componentWatch.shieldInfo.detacher = {
              index: node.address[node.address.length - 1],
              stashKey: node.parent.detacherStashKey,
              parentKey: node.parent.elementKey
            };
          }
        }

        if (repeatInstruction) {
          processRepeater(
            component,
            componentDefinition,
            node,
            repeatInstruction,
            addCallbackStatement
          );
        }

        for (const key in _callbacks) {
          const args = buildWatchCallbackParams(
            component,
            key === SPECIAL_SYMBOLS.noLookup
          );
          componentWatch.callbacks[key] = functionExpression(
            null,
            args,
            blockStatement(_callbacks[key])
          );
        }
      }

      if (ref) processRef(componentDefinition, node, ref);
      if (part) processPart(componentDefinition, node, part);

      if (node.eventListeners.length > 0) {
        processEventListeners(componentDefinition, component, node);
      }
    }
  });
}

function processEventListeners(
  componentDefinition: ComponentDefinitionData,
  component: Component,
  node: ExtractedNode
) {
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
      functionExpression(
        null,
        [identifier(EVENT_CALLBACK_ARGS.event)],
        blockStatement([expressionStatement(updatedExpression)])
      )
    ]);
  });
}

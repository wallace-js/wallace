import type { Identifier, Statement } from "@babel/types";
import {
  blockStatement,
  callExpression,
  expressionStatement,
  functionExpression,
  identifier,
  memberExpression,
  numericLiteral,
  stringLiteral,
} from "@babel/types";
import * as t from "@babel/types";
import { codeToNode } from "../utils";
import { Component, VisibilityToggle, ExtractedNode } from "../models";
import { ERROR_MESSAGES, error } from "../errors";
import {
  COMPONENT_BUILD_PARAMS,
  COMPONENT_METHODS,
  EXTRA_PARAMETERS,
  IMPORTABLES,
  SPECIAL_SYMBOLS,
  WATCH_CALLBACK_PARAMS,
} from "../constants";
import { ComponentWatch } from "./types";
import { ComponentDefinitionData } from "./ComponentDefinitionData";
import {
  getSiblings,
  getChildren,
  renameVariablesInExpression,
  buildWatchCallbackParams,
} from "./utils";

function addBindInstruction(node: ExtractedNode) {
  if (node.tagName.toLowerCase() == "input") {
    // @ts-ignore
    const inputType = node.element.type.toLowerCase();
    const attribute = inputType === "checkbox" ? "checked" : "value";
    node.bindInstructions.forEach(({ eventName, expression }) => {
      node.watchAttribute(attribute, expression);
      const callback = t.assignmentExpression(
        "=",
        expression as Identifier,
        t.memberExpression(
          t.memberExpression(
            t.identifier(EXTRA_PARAMETERS.event),
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
  node.toggleTargets.forEach((target) => {
    const match = node.toggleTriggers.find(
      (trigger) => trigger.name == target.name
    );
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
      .map((v) => t.stringLiteral(v));
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
  addCallbackStatement: (
    lookupKey: string | number,
    statements: Statement[]
  ) => void
) {
  node.toggleTriggers.forEach((trigger) => {
    const target = node.toggleTargets.find(
      (target) => target.name == trigger.name
    );
    const classesToToggle = target
      ? extractCssClasses(target.value)
      : [t.stringLiteral(trigger.name)];
    const toBoolExpression = trigger.expression;
    const lookupKey = componentDefinition.addLookup(toBoolExpression);
    const getCallback = (method: "add" | "remove") =>
      callExpression(
        memberExpression(
          memberExpression(
            identifier(WATCH_CALLBACK_PARAMS.element),
            identifier("classList")
          ),
          identifier(method)
        ),
        classesToToggle
      );

    addCallbackStatement(lookupKey, [
      t.ifStatement(
        t.identifier(WATCH_CALLBACK_PARAMS.newValue),
        blockStatement([expressionStatement(getCallback("add"))]),
        blockStatement([expressionStatement(getCallback("remove"))])
      ),
    ]);
  });
}

// TODO: break this up.
export function processNodes(
  component: Component,
  componentDefinition: ComponentDefinitionData
) {
  component.extractedNodes.forEach((node) => {
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
    const stubComponentName = stubName
      ? t.callExpression(
          t.memberExpression(
            t.identifier(COMPONENT_BUILD_PARAMS.component),
            t.identifier(COMPONENT_METHODS.getStub)
          ),
          [t.stringLiteral(stubName)]
        )
      : undefined;
    const visibilityToggle = node.getVisibilityToggle();
    const ref = node.getRef();
    const repeatInstruction = node.getRepeatInstruction();
    const createWatch =
      node.watches.length > 0 ||
      node.bindInstructions.length > 0 ||
      node.toggleTriggers.length > 0 ||
      visibilityToggle ||
      node.isNestedComponent ||
      stubName ||
      repeatInstruction;

    // TODO: should ref really save the element?
    const shouldSaveElement =
      createWatch ||
      ref ||
      node.eventListeners.length > 0 ||
      node.hasConditionalChildren;

    ensureToggleTargetsHaveTriggers(node);

    if (shouldSaveElement) {
      const nestedComponentCls = node.isNestedComponent
        ? t.identifier(node.tagName)
        : stubComponentName;
      node.elementKey = nestedComponentCls
        ? componentDefinition.saveNestedAsDynamicElement(
            node.address,
            nestedComponentCls
          )
        : componentDefinition.saveDynamicElement(node.address);

      if (node.bindInstructions.length) {
        addBindInstruction(node);
      }

      if (node.hasConditionalChildren) {
        node.detacherStashKey = componentDefinition.getNextmiscStashKey();
        componentDefinition.wrapDynamicElementCall(
          node.elementKey,
          IMPORTABLES.stashMisc,
          [identifier(COMPONENT_BUILD_PARAMS.component), t.objectExpression([])]
        );
      }

      if (createWatch) {
        const _callbacks: { [key: string | number]: Array<Statement> } = {};
        const addCallbackStatement = (
          key: string | number,
          statements: Statement[]
        ) => {
          if (!_callbacks.hasOwnProperty(key)) {
            _callbacks[key] = [];
          }
          _callbacks[key].push(...statements);
        };

        const componentWatch: ComponentWatch = {
          elementKey: node.elementKey,
          callbacks: {},
          address: node.address,
        };
        componentDefinition.watches.push(componentWatch);

        node.watches.forEach((watch) => {
          const lookupKey = componentDefinition.addLookup(watch.expression);
          addCallbackStatement(lookupKey, codeToNode(watch.callback));
        });

        if (node.isNestedComponent) {
          const props = node.getProps();
          const ctrlArg = memberExpression(
            component.componentIdentifier,
            identifier(SPECIAL_SYMBOLS.ctrl)
          );
          const args = props
            ? [props, ctrlArg]
            : [identifier("undefined"), ctrlArg];
          addCallbackStatement(SPECIAL_SYMBOLS.alwaysUpdate, [
            expressionStatement(
              callExpression(
                memberExpression(
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  identifier(COMPONENT_METHODS.render)
                ),
                args
              )
            ),
          ]);
        }

        if (node.toggleTriggers.length) {
          addToggleCallbackStatement(
            componentDefinition,
            node,
            addCallbackStatement
          );
        }

        // Need to be careful with WATCH_CALLBACK_PARAMS as `e` is actually a reference
        // to the nested component, and that's what we want to render.
        if (stubName) {
          addCallbackStatement(SPECIAL_SYMBOLS.alwaysUpdate, [
            expressionStatement(
              callExpression(
                memberExpression(
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  identifier(COMPONENT_METHODS.render)
                ),
                [
                  component.propsIdentifier,
                  memberExpression(
                    component.componentIdentifier,
                    identifier(SPECIAL_SYMBOLS.ctrl)
                  ),
                ]
              )
            ),
          ]);
        }

        if (visibilityToggle) {
          const shieldLookupKey = componentDefinition.addLookup(
            visibilityToggle.expression
          );
          componentWatch.shieldInfo = {
            skipCount: 0, // gets set later once we've processed all the nodes.
            key: shieldLookupKey,
            reverse: visibilityToggle.reverse,
          };
          if (visibilityToggle.detach) {
            if (node.parent.detacherStashKey === undefined) {
              throw new Error("Parent node was not given a stash key");
            }
            componentWatch.shieldInfo.detacher = {
              index: node.address[node.address.length - 1],
              stashKey: node.parent.detacherStashKey,
              parentKey: node.parent.elementKey,
            };
          }
        }

        if (repeatInstruction) {
          componentDefinition.component.module.requireImport(
            IMPORTABLES.getSequentialRepeater
          );
          const poolInstance =
            repeatInstruction.poolExpression ||
            callExpression(identifier(IMPORTABLES.getSequentialRepeater), [
              identifier(repeatInstruction.componentCls),
            ]);

          // TODO: couple the stash index with the call to save - if possible?
          // Or make it an object and pass the key when saving.
          const miscStashKey = componentDefinition.getNextmiscStashKey();
          componentDefinition.wrapDynamicElementCall(
            node.elementKey,
            IMPORTABLES.stashMisc,
            [identifier(COMPONENT_BUILD_PARAMS.component), poolInstance]
          );
          addCallbackStatement(SPECIAL_SYMBOLS.alwaysUpdate, [
            expressionStatement(
              callExpression(
                memberExpression(
                  memberExpression(
                    memberExpression(
                      component.componentIdentifier,
                      identifier(SPECIAL_SYMBOLS.objectStash)
                    ),
                    numericLiteral(miscStashKey),
                    true
                  ),
                  identifier(SPECIAL_SYMBOLS.patch)
                ),
                [
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  repeatInstruction.expression,
                  memberExpression(
                    component.componentIdentifier,
                    identifier(SPECIAL_SYMBOLS.ctrl)
                  ),
                ]
              )
            ),
          ]);
        }

        for (const key in _callbacks) {
          const args =
            key === SPECIAL_SYMBOLS.alwaysUpdate
              ? [
                  identifier(WATCH_CALLBACK_PARAMS.element),
                  component.propsIdentifier,
                  component.componentIdentifier,
                ]
              : buildWatchCallbackParams();
          componentWatch.callbacks[key] = functionExpression(
            null,
            args,
            blockStatement(_callbacks[key])
          );
        }
      }

      if (ref) {
        if (componentDefinition.collectedRefs.includes(ref)) {
          error(
            node.path,
            ERROR_MESSAGES.REFS_MUST_BE_UNIQUE_WITHIN_EACH_COMPONENT
          );
        }
        componentDefinition.collectedRefs.push(ref);
        componentDefinition.wrapDynamicElementCall(
          node.elementKey,
          IMPORTABLES.saveRef,
          [identifier(COMPONENT_BUILD_PARAMS.component), stringLiteral(ref)]
        );
      }

      // TODO: improve this, as we are basically renaming things specifically for the
      // build function that have already been renamed, which can get confusing.
      // It also needs to rename ctrl and props explicitly as it doesn't seem to
      // rename component when it's a member expression.
      const eventVariableMapping: { [key: string]: string } = {
        [component.componentIdentifier.name]: COMPONENT_BUILD_PARAMS.component,
        [component.componentIdentifier.name + "." + SPECIAL_SYMBOLS.ctrl]:
          `${COMPONENT_BUILD_PARAMS.component}.${SPECIAL_SYMBOLS.ctrl}`,
        [component.propsIdentifier.name]:
          `${COMPONENT_BUILD_PARAMS.component}.props`,
      };
      node.eventListeners.forEach((listener) => {
        const updatedExpression = renameVariablesInExpression(
          listener.callback,
          eventVariableMapping
        );

        componentDefinition.wrapDynamicElementCall(
          node.elementKey,
          IMPORTABLES.onEvent,
          [
            stringLiteral(listener.eventName),
            functionExpression(
              null,
              [identifier(EXTRA_PARAMETERS.event)],
              blockStatement([expressionStatement(updatedExpression)])
            ),
          ]
        );
      });
    }
  });
}

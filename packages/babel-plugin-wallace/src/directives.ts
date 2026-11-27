/**
 * These are the directives, which work by matching `attributeName`, except for the
 * deprecated `onClick` style event directive (see `visitors/attribute.ts`).
 *
 * The `help` field was supposed to be used for docs, but we're now putting this in
 * the packages/wallace/lib/types.d.ts to make it available by tool tip. When making
 * changes here be sure to update that file.
 */
import * as t from "@babel/types";
import { wallaceConfig, FlagValue } from "./config";
import { ERROR_MESSAGES, error, warn } from "./errors";
import {
  Directive,
  TagNode,
  NodeValue,
  Qualifier,
  ValueMode,
  QualifierMode
} from "./models";
import {
  WATCH_CALLBACK_ARGS,
  SPECIAL_SYMBOLS,
  IMPORTABLES,
  INPUT_TYPE_VALUES
} from "./constants";

class ApplyDirective extends Directive {
  static attributeName = "apply";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static mayAccessElement = true;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.addWatch(SPECIAL_SYMBOLS.noLookup, value.expression);
  }
}

class AssignDirective extends Directive {
  static attributeName = "assign";
  static valueMode: ValueMode = ValueMode.EitherRequired;
  static qualifierMode: QualifierMode = QualifierMode.SetsValue;
  static mustBeOnRoot = true;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.component.assignTo = value.expression || value.value;
  }
}

class BindDirective extends Directive {
  static attributeName = "bind";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.Optional;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.setBindInstruction(value.expression, qualifier);
  }
}

class BindAsDirective extends Directive {
  static attributeName = "bind-as";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.Required;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    if (INPUT_TYPE_VALUES.hasOwnProperty(qualifier)) {
      node.setBindInstruction(value.expression, INPUT_TYPE_VALUES[qualifier]);
      node.addFixedAttribute("type", qualifier);
    } else {
      error(node.path, ERROR_MESSAGES.INVALID_BIND_AS_FIELD(qualifier));
    }
  }
}

class ClassDirective extends Directive {
  static attributeName = "class";
  static valueMode: ValueMode = ValueMode.EitherRequired;
  static qualifierMode: QualifierMode = QualifierMode.Optional;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    if (qualifier) {
      node.addClassToggleTarget(
        qualifier,
        value.type === "expression" ? value.expression : value.value
      );
    } else {
      // TODO: refactor as "process as normal" function.
      if (value.type === "string") {
        node.addFixedAttribute(base, value.value);
      } else if (value.type === "expression") {
        node.watchAttribute("class", value.expression);
      }
    }
  }
}

class CssDirective extends Directive {
  static attributeName = "css";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static mayAccessComponent = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.addStaticAttribute("class", value.expression);
  }
}

class BindOnDirective extends Directive {
  static attributeName = "bind-on";
  static valueMode: ValueMode = ValueMode.StringRequired;
  static qualifierMode: QualifierMode = QualifierMode.SetsValue;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.setBindEvent(qualifier || value.value);
  }
}

/**
 * Deprecated: use `bind-on`. Make this a compile error in a future version.
 */
class EventDirective extends BindOnDirective {
  static attributeName = "event";
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    const eventName = qualifier || value.value;
    warn(node.path, ERROR_MESSAGES.EVENT_DIRECTIVE_DEPRECATED(eventName));
    super.apply(node, value, qualifier, base);
  }
}

class FixedDirective extends Directive {
  static attributeName = "fixed";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.Required;
  static mayAccessComponent = false;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.addStaticAttribute(qualifier, value.expression);
  }
}

class HideDirective extends Directive {
  static attributeName = "hide";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setVisibilityToggle(value.expression, true, false);
  }
}

class HtmlDirective extends Directive {
  static attributeName = "html";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.watchAttribute("innerHTML", value.expression);
  }
}

class HubDirective extends Directive {
  static attributeName = "hub";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static allowOnNested = true;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    wallaceConfig.ensureFlagIstrue(node.path, FlagValue.allowHub);
    node.setHub(value.expression);
  }
}

class IfDirective extends Directive {
  static attributeName = "if";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static allowOnNested = true;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setVisibilityToggle(value.expression, false, true);
  }
}

class KeyDirective extends Directive {
  static attributeName = "key";
  static valueMode: ValueMode = ValueMode.EitherRequired;
  static qualifierMode: QualifierMode = QualifierMode.SetsValue;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setRepeatKey(value.expression || value.value);
  }
}

class ModelDirective extends Directive {
  static attributeName = "model";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static allowOnNested = true;
  static allowOnNormalElement = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setModel(value.expression);
  }
}

class ModelsDirective extends Directive {
  static attributeName = "models";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setModel(value.expression);
  }
}

/**
 * The expression is copied into the listener, so a function or uncalled reference
 * compiles fine but does nothing when the event fires.
 */
function ensureHandlerIsCall(value: NodeValue) {
  let expression: t.Node = value.expression;
  while (t.isTSAsExpression(expression) || t.isTSNonNullExpression(expression)) {
    expression = expression.expression;
  }
  if (t.isArrowFunctionExpression(expression) || t.isFunctionExpression(expression)) {
    error(value.path, ERROR_MESSAGES.EVENT_HANDLER_IS_FUNCTION);
  }
  if (
    t.isIdentifier(expression) ||
    t.isMemberExpression(expression) ||
    t.isOptionalMemberExpression(expression)
  ) {
    error(value.path, ERROR_MESSAGES.EVENT_HANDLER_NOT_CALLED);
  }
}

class OnDirective extends Directive {
  static attributeName = "on";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.Required;
  static mayAccessElement = true;
  static mayAccessEvent = true;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    ensureHandlerIsCall(value);
    node.addEventListener(qualifier, value.expression);
  }
}

/**
 * Deprecated: use `on:click`. Only used for `onClick={expression}`, as string values
 * are normal attributes. Make this a compile error in a future version, rather than
 * letting it become a normal attribute, which would silently run the handler on render.
 */
class DeprecatedOnEventDirective extends Directive {
  static attributeName = "on*";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static mayAccessElement = true;
  static mayAccessEvent = true;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, base: string) {
    const eventName = base.substring(2).toLowerCase();
    warn(value.path, ERROR_MESSAGES.ON_EVENT_DEPRECATED(base, eventName));
    ensureHandlerIsCall(value);
    node.addEventListener(eventName, value.expression);
  }
}

class PartDirective extends Directive {
  static attributeName = "part";
  static valueMode: ValueMode = ValueMode.StringRequired;
  static qualifierMode: QualifierMode = QualifierMode.SetsValue;
  static allowOnNested = true;
  static allowOnRepeated = true;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    wallaceConfig.ensureFlagIstrue(node.path, FlagValue.allowParts);
    node.setPart(qualifier || value.value);
  }
}

class RefDirective extends Directive {
  static attributeName = "ref";
  static valueMode: ValueMode = ValueMode.StringRequired;
  static qualifierMode: QualifierMode = QualifierMode.SetsValue;
  static allowOnNested = true;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.setRef(qualifier || value.value);
  }
}

class ShowDirective extends Directive {
  static attributeName = "show";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setVisibilityToggle(value.expression, false, false);
  }
}

class StyleDirective extends Directive {
  static attributeName = "style";
  static valueMode: ValueMode = ValueMode.EitherRequired;
  static qualifierMode: QualifierMode = QualifierMode.Optional;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    if (qualifier) {
      if (value.type === "string") {
        throw new Error("Value must be an expression");
      } else if (value.type === "expression") {
        node.addWatch(
          value.expression,
          `${WATCH_CALLBACK_ARGS.element}.style.${qualifier} = ${WATCH_CALLBACK_ARGS.newValue}`
        );
      }
    } else {
      if (value.type === "string") {
        node.addFixedAttribute(base, value.value);
      } else if (value.type === "expression") {
        node.watchAttribute("style", value.expression);
      }
    }
  }
}

class ToggleDirective extends Directive {
  static attributeName = "toggle";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.Required;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    if (!qualifier) {
      throw new Error("Toggle must have a qualifier");
    }
    node.addClassToggleTrigger(qualifier, value.expression);
  }
}

class UniqueDirective extends Directive {
  static attributeName = "unique";
  static valueMode: ValueMode = ValueMode.NotAllowed;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static mustBeOnRoot = true;
  apply(node: TagNode, _value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.component.unique = true;
  }
}

/**
 * This is a hack to enable a Proxy of a Date to be passed to `valueAsDate`.
 * It is not a documented directive.
 */
class ValueAsDateDirective extends Directive {
  static attributeName = "valueAsDate";
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    if (value.type === "expression") {
      node.requiredImport(IMPORTABLES.toDateString);
      node.watchAttribute(
        "value",
        t.callExpression(t.identifier(IMPORTABLES.toDateString), [value.expression])
      );
    } else if (value.type === "string") {
      node.addFixedAttribute("valueAsDate", value.value);
    }
  }
}

class WatchDirective extends Directive {
  static attributeName = "watch";
  static valueMode: ValueMode = ValueMode.ExpressionOptional;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static mustBeOnRoot = true;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.component.watchModel = { callback: value.expression };
  }
}

export const builtinDirectives = [
  ApplyDirective,
  AssignDirective,
  BindDirective,
  BindAsDirective,
  BindOnDirective,
  ClassDirective,
  CssDirective,
  EventDirective,
  FixedDirective,
  HideDirective,
  HtmlDirective,
  HubDirective,
  IfDirective,
  KeyDirective,
  ModelDirective,
  ModelsDirective,
  OnDirective,
  DeprecatedOnEventDirective,
  PartDirective,
  RefDirective,
  ShowDirective,
  StyleDirective,
  ToggleDirective,
  UniqueDirective,
  ValueAsDateDirective,
  WatchDirective
];

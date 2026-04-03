/**
 * These are the directives, which work by matching `attributeName`, except for the
 * event directive.
 *
 * The `help` field was supposed to be used for docs, but we're now putting this in
 * the packages/wallace/lib/types.d.ts to make it available by tool tip. When making
 * changes here be sure to update that file.
 */
import * as t from "@babel/types";
import { wallaceConfig, FlagValue } from "./config";
import { ERROR_MESSAGES, error } from "./errors";
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
  DOM_EVENTS_LOWERCASE
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

class CtrlDirective extends Directive {
  static attributeName = "ctrl";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static allowOnNested = true;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    wallaceConfig.ensureFlagIstrue(node.path, FlagValue.allowCtrl);
    node.setCtrl(value.expression);
  }
}

class EventDirective extends Directive {
  static attributeName = "event";
  static valueMode: ValueMode = ValueMode.StringRequired;
  static qualifierMode: QualifierMode = QualifierMode.SetsValue;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    const eventName = qualifier || value.value;
    if (!DOM_EVENTS_LOWERCASE.includes(eventName)) {
      error(node.path, ERROR_MESSAGES.INVALID_EVENT_NAME(eventName));
    }
    node.setBindEvent(eventName);
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

// TODO: change to be on:click
class OnEventDirective extends Directive {
  static attributeName = "on*";
  static valueMode: ValueMode = ValueMode.EitherRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static mayAccessElement = true;
  static mayAccessEvent = true;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, base: string) {
    if (value.type === "string") {
      node.addFixedAttribute(base, value.value);
    } else {
      node.addEventListener(base.substring(2).toLowerCase(), value.expression);
    }
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

class PropsDirective extends Directive {
  static attributeName = "props";
  static valueMode: ValueMode = ValueMode.ExpressionRequired;
  static qualifierMode: QualifierMode = QualifierMode.NotAllowed;
  static allowOnNested = true;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setProps(value.expression);
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
    node.component.watchProps = { callback: value.expression };
  }
}

export const builtinDirectives = [
  ApplyDirective,
  AssignDirective,
  BindDirective,
  ClassDirective,
  CssDirective,
  CtrlDirective,
  EventDirective,
  FixedDirective,
  HideDirective,
  HtmlDirective,
  IfDirective,
  KeyDirective,
  OnEventDirective,
  PartDirective,
  PropsDirective,
  RefDirective,
  ShowDirective,
  StyleDirective,
  ToggleDirective,
  UniqueDirective,
  ValueAsDateDirective,
  WatchDirective
];

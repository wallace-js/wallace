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
import { Directive, TagNode, NodeValue, Qualifier } from "./models";
import {
  WATCH_CALLBACK_ARGS,
  SPECIAL_SYMBOLS,
  IMPORTABLES,
  DOM_EVENTS_LOWERCASE
} from "./constants";

class ApplyDirective extends Directive {
  static attributeName = "apply";
  static allowNull = true;
  static allowString = false;
  static mayAccessElement = true;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.addWatch(SPECIAL_SYMBOLS.noLookup, value.expression);
  }
}

class BindDirective extends Directive {
  static attributeName = "bind";
  static allowQualifier = true;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.setBindInstruction(value.expression, qualifier);
  }
}

class ClassDirective extends Directive {
  static attributeName = "class";
  static allowString = true;
  static allowQualifier = true;
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
  static mayAccessComponent = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.addStaticAttribute("class", value.expression);
  }
}

class CtrlDirective extends Directive {
  static attributeName = "ctrl";
  static allowOnNested = true;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  static help: `
  Specify ctrl for a nested component:
  
  /h <NestedComponent ctrl={self.ctrl1} />
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    wallaceConfig.ensureFlagIstrue(node.path, FlagValue.allowCtrl);
    node.setCtrl(value.expression);
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

class EventDirective extends Directive {
  static attributeName = "event";
  static allowExpression = false;
  static allowNull = true;
  static requireQualifier = true;
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
  static requireQualifier = true;
  static mayAccessComponent = false;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.addStaticAttribute(qualifier, value.expression);
  }
}

class HideDirective extends Directive {
  static attributeName = "hide";
  static help = `
    Hides an element by toggling its hidden attribute.

    /h <div hide={}></div>
    `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setVisibilityToggle(value.expression, false, false);
  }
}

class HtmlDirective extends Directive {
  static attributeName = "html";
  static help = `

    /h <div html={'<div>hello</div>'}></div>
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.watchAttribute("innerHTML", value.expression);
  }
}

class IfDirective extends Directive {
  static attributeName = "if";
  static allowOnNested = true;
  static help = `
    Conditionally includes/exludes an element from the DOM.

    /h <div if={}></div>
    `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setVisibilityToggle(value.expression, true, true);
  }
}

class ItemsDirective extends Directive {
  static attributeName = "items";
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  static help: `
  Specify items for a repeated component:
  
  /h <NestedComponent.repeat props={arrayOfProps} />
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setProps(value.expression);
  }
}

class KeyDirective extends Directive {
  static attributeName = "key";
  static allowString = true;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setRepeatKey(value.expression || value.value);
  }
}

class OnEventDirective extends Directive {
  static attributeName = "on*";
  static allowString = true;
  static mayAccessElement = true;
  static mayAccessEvent = true;
  static help = `
    Creates an event handler:

    /h <div onclick={alert('hello')}></div>
    `;
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
  static allowOnNested = true;
  static allowOnRepeated = true;
  static allowNull = true;
  static allowExpression = false;
  static requireQualifier = true;
  static help = `
    Saves a reference to a part of a component which can be updated.

    /h <div part:title></div>
    `;
  apply(node: TagNode, _value: NodeValue, qualifier: Qualifier, _base: string) {
    wallaceConfig.ensureFlagIstrue(node.path, FlagValue.allowParts);
    node.setPart(qualifier);
  }
}

class PropsDirective extends Directive {
  static attributeName = "props";
  static allowOnNested = true;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  static help: `
  Specify props for a nested component:
  
  /h <NestedComponent props={{foo: 'bar'}} />
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setProps(value.expression);
  }
}

class RefDirective extends Directive {
  static attributeName = "ref";
  static allowOnNested = true;
  static allowNull = true;
  static allowExpression = false;
  static requireQualifier = true;
  static help = `
    Saves a reference to an element or nested component:

    /h <div ref:title></div>
    `;
  apply(node: TagNode, _value: NodeValue, qualifier: Qualifier, _base: string) {
    node.setRef(qualifier);
  }
}

class ShowDirective extends Directive {
  static attributeName = "show";
  static help = `
    Shows an element by toggling its hidden attribute.

    /h <div show={}></div>
    `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setVisibilityToggle(value.expression, true, false);
  }
}

class StyleDirective extends Directive {
  static attributeName = "style";
  static allowString = true;
  static allowQualifier = true;
  static help = `

    /h <div style:color="red"></div>
    `;
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
  static requireQualifier = true;
  static help = `
    If used on its own, the qualifer is the name of the css class to toggle:

    /h <div toggle:danger={expr}></div>

    If the element has class sets, then the qualifer corresponds to the name of the
    class set:

    /h <div class:danger="red danger" toggle:danger={expr}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    if (!qualifier) {
      throw new Error("Toggle must have a qualifier");
    }
    node.addClassToggleTrigger(qualifier, value.expression);
  }
}

class UniqueDirective extends Directive {
  static attributeName = "unique";
  static allowExpression = false;
  static allowNull = true;
  apply(node: TagNode, _value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.component.unique = true;
  }
}

export const builtinDirectives = [
  ApplyDirective,
  BindDirective,
  ClassDirective,
  CssDirective,
  CtrlDirective,
  ValueAsDateDirective,
  EventDirective,
  FixedDirective,
  HideDirective,
  HtmlDirective,
  IfDirective,
  ItemsDirective,
  KeyDirective,
  OnEventDirective,
  PartDirective,
  PropsDirective,
  RefDirective,
  ShowDirective,
  StyleDirective,
  ToggleDirective,
  UniqueDirective
];

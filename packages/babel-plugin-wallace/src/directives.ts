/**
 * These are the directives, which work by matching `attributeName`, except for the
 * event directive.
 *
 * The `help` field was supposed to be used for docs, but we're now putting this in
 * the packages/wallace/lib/types.d.ts to make it available by tool tip. When making
 * changes here be sure to update that file.
 */

import { wallaceConfig, FlagValue } from "./config";
import { ERROR_MESSAGES, error } from "./errors";
import { Directive, TagNode, NodeValue, Qualifier, FieldMode, ValueType } from "./models";
import { WATCH_CALLBACK_ARGS, SPECIAL_SYMBOLS, DOM_EVENTS_LOWERCASE } from "./constants";

class ApplyDirective extends Directive {
  static attributeName = "apply";
  static allowNull = true;
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
  static mayAccessElement = true;

  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.addWatch(SPECIAL_SYMBOLS.noLookup, value.expression);
  }
}

class BindDirective extends Directive {
  static attributeName = "bind";
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.Allowed;
  static help = `
    Create a two-way binding between an input element's "value" property and the
    expression, which must be assignable. 
    If the input is of type "checkbox", it uses the "checked" property instead.
    
    /h <div bind={p.count}></div>

    By defaults it listens to "change" event, but you can specify a different one:

    /h <div bind:keyup={p.count}></div>
  `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    const eventName = qualifier || "change";
    if (!DOM_EVENTS_LOWERCASE.includes(eventName)) {
      error(node.path, ERROR_MESSAGES.INVALID_EVENT_NAME_IN_BIND(eventName));
    }
    node.addBindInstruction(eventName, value.expression);
  }
}

class ClassDirective extends Directive {
  static attributeName = "class";
  static allowedValue = ValueType.Both;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.Allowed;
  static help = `
    Without a qualifer this acts as a normal attribute, but with a qualifier it creates
    a toggle target for use with the "toggle" directive:

    /h <div class:danger="btn-danger" toggle:danger={expr}></div>
    `;
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
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
  static mayAccessComponent = false;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.addStaticAttribute("class", value.expression);
  }
}

class CtrlDirective extends Directive {
  static attributeName = "ctrl";
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
  static allowOnNested = true;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  static help: `
  Specify ctrl for a nested component:
  
  /h <NestedComponent.nest ctrl={self.ctrl1} />
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    wallaceConfig.ensureFlagIstrue(node.path, FlagValue.allowCtrl);
    node.setCtrl(value.expression);
  }
}

class FixedDirective extends Directive {
  static attributeName = "fixed";
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.Required;
  static mayAccessComponent = false;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.addStaticAttribute(qualifier, value.expression);
  }
}

class HideDirective extends Directive {
  static attributeName = "hide";
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
  static allowOnNested = true;
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
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
  static help = `

    /h <div html={'<div>hello</div>'}></div>
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.watchAttribute("innerHTML", value.expression);
  }
}

class IfDirective extends Directive {
  static attributeName = "if";
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
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
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  static help: `
  Specify items for a repeated component:
  
  /h <NestedComponent.repeat items={arrayOfProps} />
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setRepeatExpression(value.expression);
  }
}

class KeyDirective extends Directive {
  static attributeName = "key";
  static allowedValue = ValueType.Both;
  static valueMode = FieldMode.Allowed;
  static qualifierMode = FieldMode.Allowed;
  static allowOnRepeated = true;
  static allowOnNormalElement = false;
  static help = `
    Specifies the key for a repeated node. Can either specify a function:
    /h <Foo.repeat props={} key={(x) => x.id}></div>
    Or a string:
    /h <Foo.repeat props={} key="id"></div>
    If specifying a key, you may not specify a pool.
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    // TODO: validate permutations.
    node.setRepeatKey(value.expression || value.value);
  }
}

class OnEventDirective extends Directive {
  static attributeName = "on*";
  static allowedValue = ValueType.Both;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
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
  static allowedValue = ValueType.String;
  static valueMode = FieldMode.Allowed;
  static qualifierMode = FieldMode.Allowed;
  static allowOnNested = true;
  static help = `
    Saves a reference to a part of a component which can be updated.

    /h <div part:title></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    wallaceConfig.ensureFlagIstrue(node.path, FlagValue.allowParts);
    const partName = this.getValueOrQualifer(node, value, qualifier);
    node.setPart(partName);
  }
}

class PropsDirective extends Directive {
  static attributeName = "props";
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Allowed;
  static qualifierMode = FieldMode.NotAllowed;
  static allowOnNested = true;
  static allowOnNormalElement = false;
  static help: `
  Specify props for a nested component:
  
  /h <NestedComponent.nest props={{foo: 'bar'}} />
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setProps(value.expression);
  }
}

class RefDirective extends Directive {
  static attributeName = "ref";
  static allowedValue = ValueType.String;
  static valueMode = FieldMode.Allowed;
  static qualifierMode = FieldMode.Allowed;
  static allowOnNested = true;
  static help = `
    Saves a reference to an element or nested component:

    /h <div ref:title></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    const refName = this.getValueOrQualifer(node, value, qualifier);
    node.setRef(refName);
  }
}

class ShowDirective extends Directive {
  static attributeName = "show";
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.NotAllowed;
  static allowOnNested = true;
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
  static allowedValue = ValueType.Both;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.Allowed;
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
  static allowedValue = ValueType.Expression;
  static valueMode = FieldMode.Required;
  static qualifierMode = FieldMode.Required;
  static help = `
    If used on its own, the qualifer is the name of the css class to toggle:

    /h <div toggle:danger={expr}></div>

    If the element has class sets, then the qualifer corresponds to the name of the
    class set:

    /h <div class:danger="red danger" toggle:danger={expr}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, _base: string) {
    node.addClassToggleTrigger(qualifier, value.expression);
  }
}

class UniqueDirective extends Directive {
  static attributeName = "unique";
  static allowNull = true;
  static allowedValue = ValueType.None;
  static valueMode = FieldMode.NotAllowed;
  static qualifierMode = FieldMode.NotAllowed;
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

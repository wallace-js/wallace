/**
 * These are the directives, which work by matching `attributeName`, except for the
 * event directive.
 *
 * The `help` field was supposed to be used for docs, but we're now putting this in
 * the packages/wallace/lib/types.d.ts to make it available by tool tip. When making
 * changes here be sure to update that file.
 */

import { ERROR_MESSAGES, error } from "./errors";
import { Directive, TagNode, NodeValue, Qualifier } from "./models";
import {
  EXPRESSION_SCOPE_VARIABLES,
  WATCH_CALLBACK_ARGS,
  SPECIAL_SYMBOLS,
  DOM_EVENTS_LOWERCASE
} from "./constants";

class ApplyDirective extends Directive {
  static attributeName = "apply";
  static allowNull = true;
  static allowString = false;
  static allowQualifier = false;
  static allowAccessTo = [
    EXPRESSION_SCOPE_VARIABLES.component,
    EXPRESSION_SCOPE_VARIABLES.props,
    EXPRESSION_SCOPE_VARIABLES.element
  ];
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    node.addWatch(SPECIAL_SYMBOLS.noLookup, value.expression);
  }
}

class BindDirective extends Directive {
  static attributeName = "bind";
  static allowQualifier = true;
  static help = `
    Create a two-way binding between an input element's "value" property and the
    expression, which must be assignable. 
    If the input is of type "checkbox", it uses the "checked" property instead.
    
    /h <div bind={p.count}></div>

    By defaults it listens to "change" event, but you can specify a different one:

    /h <div bind:keyup={p.count}></div>
  `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    const eventName = qualifier || "change";
    if (!DOM_EVENTS_LOWERCASE.includes(eventName)) {
      error(node.path, ERROR_MESSAGES.INVALID_EVENT_NAME_IN_BIND(eventName));
    }
    node.addBindInstruction(eventName, value.expression);
  }
}

class ClassDirective extends Directive {
  static attributeName = "class";
  static allowString = true;
  static allowQualifier = true;
  static help = `
    Without a qualifer this acts as a normal attribute, but with a qualifier it creates
    a toggle target for use with the "toggle" directive:

    /h <div class:danger="btn-danger" toggle:danger={expr}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    if (qualifier) {
      node.addToggleTarget(
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

class HideDirective extends Directive {
  static attributeName = "hide";
  static allowOnNested = true;
  static allowOnRepeated = true;
  static help = `
    Hides an element by toggling its hidden attribute.

    /h <div hide={}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    // this.ensureValueType();
    node.setVisibilityToggle(value.expression, false, false);
  }
}

class HtmlDirective extends Directive {
  static attributeName = "html";
  static help = `

    /h <div html={'<div>hello</div>'}></div>
  `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    node.watchAttribute("innerHTML", value.expression);
  }
}

class IfDirective extends Directive {
  static attributeName = "if";
  static help = `
    Conditionally includes/exludes an element from the DOM.

    /h <div if={}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    node.setVisibilityToggle(value.expression, true, true);
  }
}

class ItemsDirective extends Directive {
  static attributeName = "items";
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

class OnEventDirective extends Directive {
  static attributeName = "on*";
  static allowString = true;
  static allowAccessTo = [
    EXPRESSION_SCOPE_VARIABLES.component,
    EXPRESSION_SCOPE_VARIABLES.props,
    EXPRESSION_SCOPE_VARIABLES.element,
    EXPRESSION_SCOPE_VARIABLES.event
  ];
  static help = `
    Creates an event handler:

    /h <div onclick={alert('hello')}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    if (value.type === "string") {
      node.addFixedAttribute(base, value.value);
    } else {
      node.addEventListener(base.substring(2).toLowerCase(), value.expression);
    }
  }
}

class PropsDirective extends Directive {
  static attributeName = "props";
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
  static allowOnNested = true;
  static allowOnRepeated = true;
  static help = `
    Shows an element by toggling its hidden attribute.

    /h <div show={}></div>
    `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    // this.ensureValueType();
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
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    if (!qualifier) {
      throw new Error("Toggle must have a qualifier");
    }
    node.addToggleTrigger(qualifier, value.expression);
  }
}

export const builtinDirectives = [
  ApplyDirective,
  BindDirective,
  ClassDirective,
  HideDirective,
  HtmlDirective,
  IfDirective,
  ItemsDirective,
  OnEventDirective,
  PropsDirective,
  RefDirective,
  ShowDirective,
  StyleDirective,
  ToggleDirective
];

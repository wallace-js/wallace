import { Directive, TagNode, NodeValue, Qualifier } from "./models";
import { WATCH_CALLBACK_PARAMS } from "./constants";
import { ERROR_MESSAGES, error } from "./errors";

class BaseDirective extends Directive {
  static attributeName = "base";
  static help = `
    Causes this componento to extend (inherit from) a base component:

    /h <div base={OtherComponent}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    node.setBaseComponent(value.expression);
  }
}

class BindDirective extends Directive {
  static attributeName = "bind";
  static help = `
    Create a two-way binding between and input element's "value" property and the
    expression, which must be assignable. 
    If the input is of type "checkbox", it uses the "checked" property instead.
    
    /h <div bind={p.count}></div>

    By defaults it listens to "change" event, but you can specify a different one:

    /h <div bind:keyup={p.count}></div>
  `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    const eventName = qualifier || "change";
    node.addBindInstruction(eventName, value.expression);
  }
}

class ClassDirective extends Directive {
  static attributeName = "class";
  static help = `
    Without a qualifer this acts as a normal attribute, but with a qualifier it creates
    a toggle target for use with the "toggle" directive:

    /h <div class:danger="btn-danger" toggle:danger={expr}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    if (value.type === "null") {
      throw new Error("Value cannot be null");
    }
    if (qualifier) {
      node.addToggleTarget(
        qualifier,
        value.type === "expression" ? value.expression : value.value,
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

class HelpDirective extends Directive {
  static attributeName = "help";
  static help = `
    Displays the help system:

    /h <div help></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    console.log(`Help launched`);
  }
}

class HideDirective extends Directive {
  static attributeName = "hide";
  static help = `
    Hides an element by toggling its hidden attribute.

    /h <div hide={}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    // this.ensureValueType();
    node.setVisibilityToggle(value.expression, false, false);
  }
}

class IfDirective extends Directive {
  static attributeName = "if";
  static help = `
    Conditionally includes/exludes an element from the DOM.

    /h <div if={}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    // this.ensureValueType();
    if (node.isRepeatedNode || node.isNestedClass) {
      error(
        node.path,
        ERROR_MESSAGES.CANNOT_USE_IF_ON_NESTED_OR_REPEATED_ELEMENT,
      );
    }
    node.setVisibilityToggle(value.expression, true, true);
  }
}

class OnEventDirective extends Directive {
  static attributeName = "on*";
  static help = `
    Creates an event handler:

    /h <div onclick={alert('hello')}></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    // TODO: change behaviour if value vs expression
    if (value.type === "string") {
      node.addFixedAttribute(base, value.value);
    } else {
      node.addEventListener(base.substring(2).toLowerCase(), value.expression);
    }
  }
}

class PropsDirective extends Directive {
  static attributeName = "props";
  static help: `
  Specify props for a nested or repeated component:
  
  /h <NestedComponent.nest props={{foo: 'bar'}} />
  /h <NestedComponent.repeat props={{foo: 'bar'}} />
  
  If it is a repeated component, then props should be an array of props.
  `;
  apply(node: TagNode, value: NodeValue, _qualifier: Qualifier, _base: string) {
    node.setProps(value.expression);
  }
}

class RefDirective extends Directive {
  static attributeName = "ref";
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
    // this.ensureValueType();
    node.setVisibilityToggle(value.expression, true, false);
  }
}

class StyleDirective extends Directive {
  static attributeName = "style";
  static help = `

    /h <div style:color="red"></div>
    `;
  apply(node: TagNode, value: NodeValue, qualifier: Qualifier, base: string) {
    if (value.type === "null") {
      throw new Error("Value cannot be null");
    }
    if (qualifier) {
      if (value.type === "string") {
        throw new Error("Value must be an expression");
      } else if (value.type === "expression") {
        node.addWatch(
          value.expression,
          `${WATCH_CALLBACK_PARAMS.element}.style.${qualifier} = n`,
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
    if (value.type !== "expression") {
      throw new Error("Value must be an expression");
    }
    node.addToggleTrigger(qualifier, value.expression);
  }
}

export const builtinDirectives = [
  BaseDirective,
  BindDirective,
  ClassDirective,
  HelpDirective,
  HideDirective,
  IfDirective,
  OnEventDirective,
  PropsDirective,
  RefDirective,
  ShowDirective,
  StyleDirective,
  ToggleDirective,
];

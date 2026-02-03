/**
 * This file lies about several definitions in order to make TypeScript work with JSX.
 * Note that docstrings will appear in most IDE tooltips, selecting the latest overload.
 */

/**
# Wallace cheat sheet

### Contents

  0. Configuration
  1. Components
  2. JSX
  3. Nesting
  4. Repeating
  5. Directives
  6. Controllers
  7. Inheritance
  8. Stubs
  9. TypeScript
 10. Helpers

For more detailed documentation go to https://wallace.js.org/docs/


## 0. Configuration

You need to set flags in your babel config to use certain features:

 1. useControllers - enables use of `ctrl` in components.
 2. useMethods - adds the `methods` helper to components.
 3. useStubs - enables the use of stubs.

The types (and therefore tool tips) are unaffected by these flags, and will treat them
all as being true.

```tsx
module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          useControllers: true,
          useMethods: true,
          useStubs: true
        },
        directives: [...]
      }
    ],
    "@babel/plugin-syntax-jsx"
  ],
  presets: ["@babel/preset-typescript", ...]
};
```

The `directives` option lets you override or define new directives. See main docs.

## 1. Components

### 1.1 Defining

You define a component by assigning a JSX function to a value:

```tsx
const MyComponent = () => <div>Hello</div>;
```

The function body must be a single JSX expression, returned, and nothing else.

The function takes two arguments, both optional:

1. **props** - which *may* be destructured.
2. **xargs** - which *must* be destructured to exactly one level, as shown:

```tsx
const MyComponent = ({title}, {ctrl, event}) => (
  <button onClick={ctrl.doSomething(event)}>
    {title}
  </button>
);
```

The **xargs** contains:

- `ctrl` refers to the controller.
- `props` refers to the props, in case you want the non-destructured version too.
- `self` refers to the component instance (as `this` is not allowed).
- `event` refers to the event in an event callback.
- `element` refers to the element in an event callback, or in `apply`.

The function will be replaced by a very different one during compilation, therefore:

1. Do not call it from your own code.
2. Do not do weird things with it or within it.

### 1.2 Mounting

You mount the root component of your tree using `mount`:

```tsx
const root = mount("root", MyComponent, props, ctrl);
```

The arguments are:

1. Element or id string.
2. Component definition.
3. props for the element (optional)
4. controller (optional)

`mount` returns the component instance, allowing you to call its methods:

```tsx
root.update();
```

### 1.3 Methods

Components have two public methods:

#### render(props, ctrl)

Called from "above" by `mount` or when nesting other components. Here it is:

```tsx
render(props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
}
```

#### update()

Updates the DOM. Only called internally by `render`, but you can call it from other
places.

#### Overriding

You can override these methods, and add new ones using `methods` property of the
component definition:

```tsx
MyComponent.methods = {
  render(props) {
    this.ctrl = new MyController(this, props);
    this.update();
  },
  getName() {
    return 'wallace';
  }
};
```

This has the same effect as setting them on the prototype:

```tsx
MyComponent.prototype.render = function () {};
```

You can use `this.base` to access methods on the base `Component` class:

```tsx
MyComponent.methods = {
  render(props) {
    this.base.render.call(this, props, ctrl);
  }
};
```

Note that `base` is not the same as `super` in classes which access the lowest override.

You access the instance as `this` in methods, but cannot use `this` in arrow functions,
so use `self` from the **xargs** in component functions.


### 1.4 Fields

Component instances have the following fields:

- `props` the data for this component instance.
- `ctrl` the controller object.
- `el` the component instance's root element.

Optionally:

- `ref` an object containing named elements or nested components.
- `part` an object containing named parts.

Both `props` and `ctrl` are set during the `render` method before calling `update`.
There are no restrictions on types but typically:

- `props` is an object with primitive data.
- `ctrl` is an instance of a custom class.

Nested components will receive:

- The same `ctrl` as the parent.
- The `props` specified in JSX.

## 2. JSX

Wallace has two JSX rules:

1. JSX is only permitted in components as described above.
2. You cannot put JavaScript expressions before, within or around JSX - except inside
placeholders, and only so long as it does not return further JSX.

Other than that, its standard JSX, except for three special cases:

1. Directives (attributes with special behaviours).
2. Nesting.
3. Stubs, for inheritance.

## 3. Nesting

To nest a component use its name followed by `.nest` and pass `props` if needed:

```tsx
const Task = (task) => (<div></div>);

const TopTasks = (tasks) => (
  <div>
    <Task.nest props={tasks[0]} />
    <Task.nest props={tasks[1]} />
  </div>
);

const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} />
  </div>
);
```

Notes:

 - You cannot use nest on the root element.

## 4. Repeating

To repeat a component use its name followed by `.repeat` and pass `items`:

```tsx
const Task = (task) => (<div></div>);

const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} />
  </div>
);
```

This form reuses components sequentially, which may cause issues with CSS animations
and focus, in which case you should use a keyed repeater by passing `key` which can
be a string or a function:

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} key="id"/>
  </div>
);

const TaskList = (tasks) => (
  <div>
    <Task.repeat items={tasks} key={(x) => x.id}/>
  </div>
);
```

Notes:

 - You cannot repeat on the root element.
 - Repeat must be the only child element under its parent.

## 5. Directives

Directives are attributes with special behaviours. 

You can see the list of available directives by hovering over any JSX element, like
a `div`

You will get more details by hovering on the directive itself, but unfortunetely the
tool tip won't display when you use a qualifier, like `class:danger`. To see it you can
temporarily change it to something `class x:danger`.

You can define your own directives in your babel config.

## 6. Controllers

A controller is just an object you create which gets passed down to every nested
component, making it a convenient place to handle:

- Event handlers.
- Fetching data.
- Sorting, filtering and formatting props.
- Coordinating updates.

This lets you use props purely for data.

Controllers often reference:

- One or more components to be updated after data changes.
- Other controllers they need access to like services or modal containers.

Components sometimes only use a controller, and no props.

```tsx
class TaskController {
  constructor (rootComponent, dbController) {
    this.root = rootComponent;
    this.db = dbController;
  }
  getTasks () {
    return this.db.fetch(...);
  }
  newTask () {
    this.db.put(...).then(() => {
      this.root.update();
    });
  }
}

const Task = (task) => (<div>{task.name}</div>);

const TaskList = (_, {ctrl}) => (
  <div>
    <Task.repeat items={ctrl.getTasks()} />
  </div>
);

TaskList.methods = {
  render(_, ctrl) {
    this.ctrl = new TaskController(this, ctrl);
    this.update();
  }
};
```

## 7. Inheritance

You can creat new component defintion by extending another one, either preserving the
base's structure, or overriding it:

```tsx
import { extendComponent } from 'wallace';

const Parent = ({name}) => <h1>{name}</h1>;

const Child1 = extendComponent(Parent);
const Child2 = extendComponent(Parent, ({name}) => <h3>{name}</h3>);
```

Either way the new component definition inherits the parent *prototype* and *stubs*.

## 8. Stubs

Stubs are named placeholders for nested components which are requested in the JSX:

```tsx
const MyComponent = () => (
  <div>
    <stub:animation />
    <stub:text />
  </div>
);
```

And defined on the `stubs` property of the component definition:

```tsx
MyComponent.stubs.animation: () => <div>...</div>;
MyComponent.stubs.text: MyTextComponent;
```

Stubs are inherited and can be overridden, which means you can either:

- Set the DOM structure in the base, and implement/override stubs on the child.
- Set the DOM structure in the child, and use/override stubs from the base.

So long as the rendered component has all its stubs defined somewhere, it will work.

Notes:

 - Stubs receive the same props and controller as their containing component.
 - Stubs are separate components, so cannot access methods on the containing component
   through `self` (use the controller for that kind of thing).

## 9. TypeScript

The main type is `Uses` which must be placed right after the comonent name:

```tsx
import { Uses } from 'wallace';

interface iTask {
  text: string
}

const Task: Uses<iTask> = ({text}) => <div>{text}</div>;
```

If you require no props, set it to `null`:

```tsx
const Task: Uses<null> = () => <div>Hello</div>;
```

`Uses` sets up type support in several places.

### Props

TypeScript will ensure you pass correct props during mounting, nesting and repeating:

```
const TaskList: Uses<iTask[]> = (tasks) => (
  <div>
    First task:
    <Task.nest props={tasks[0]} />
    <div>
      <Task.repeat items={tasks.slice(1)} />
    </div>
  </div>
);

mount("main", TaskList, [{test: 'foo'}]);
```

### Controller

The 2nd type is used for the controller, available as `ctrl` in **xargs**:

```tsx
import { Uses } from 'wallace';

class TaskController () {
  getName() {}
}

const Task: Uses<null, TaskController> = (_, { ctrl }) => (
  <div>{ctrl.getName()}</div>
));
```

### Methods

To see custom methods on `self` you'll need use an interface:

```tsx
import { Uses } from 'wallace';

interface TaskMethods () {
  getName(): string;
}

const Task: Uses<null, null, TaskMethods> = (_, { self }) => (
  <div>{self.getName()}</div>
));

Task.methods = {
  getName() { return 'wallace' },
  render(props, ctrl) {  // types are already known
    this.props = { ...props, notallowed: 1 };  // type error
  }
};
```

The type will pass into the object passed into `methods` so it recognises custom methods
in addition to standard methods like `render`, which are already typed for you.

### Stubs

The `props` and `controller` will pass through to functions you assign to
`Component.stubs` as stubs receive the same props as the parent.

But `methods` are not passed through as stubs are distinct components and will have
their own methods.

```tsx
Task.stubs.foo = (_, { self }) => (
  <div>{self.getName()}</div>
));
```

### Inheritance

The `extendComponent` function transfers the types specified on the base:

```tsx
const Child = extendComponent(Parent);
```

You may specify different types:

```tsx
const Child = extendComponent<newProps, Controller, Methods>(Parent);
```

 However:

1. You must specify all those that are specified on base - as omitted types default
   to `any`.
2. Each type must extend its corresponding type on base.

### Other types:

Wallace defines some other types you may use:

 - `Component<Props, Controller, Methods>` - the base component class (it is a 
    constructor, not a class)
 - `ComponentInstance<Props, Controller, Methods>` - a component instance.

## 10. Helpers

Each of these has their own JSDoc, we just lsit them here.


### extendComponent

Define a new componend by extending another one:

```
const Foo = extendComponent(Base);
const Bar = extendComponent(Base, () => <div></div>);
```

### mount

Mounts an instance of a component to the DOM:

```
mount("elementId", MyComponent, props, ctrl);
```

### watch

Returns a Proxy of an object which calls `callback` when it, or its nested objects are
modified:

```
const watchedObj = watch([], () => console.log('obj modified));
watchedObj[0] = 'foo;  // Calls callback.
```

### protect

Returns a Proxy of an object which throws an error if it, or its nested objects are
modified.

```
const protectedObj = protect([]);
watchedObj[0] = 'foo';  // throws error.
```

---
Report any issues to https://github.com/wallace-js/wallace (and please give it a ★)

*/

declare module "wallace" {
  /**
   * For internal use. Ensures a component can be nested in JSX, and also sets the types
   * for the args.
   */
  interface ComponentFunction<
    Props = any,
    Controller = any,
    Methods extends object = {}
  > {
    (
      props: Props,
      xargs?: {
        ctrl: Controller;
        props: Props;
        self: ComponentInstance<Props, Controller, Methods>;
        event: Event;
        element: HTMLElement;
      }
    ): JSX.Element;
    nest?({
      props,
      show,
      hide
    }: {
      props?: Props;
      ctrl?: any;
      show?: boolean;
      hide?: boolean;
    }): JSX.Element;
    repeat?({
      items,
      key,
      show,
      hide
    }: {
      items: Array<Props>;
      ctrl?: any;
      key?: string | ((item: Props) => any);
      show?: boolean;
      hide?: boolean;
    }): JSX.Element;
    methods?: ComponenMethods<Props, Controller> &
      ThisType<ComponentInstance<Props, Controller, Methods>>;
    readonly prototype?: ComponenMethods<Props, Controller> &
      ThisType<ComponentInstance<Props, Controller, Methods>>;
    // Methods will not be available on nested component, so omit.
    readonly stubs?: Record<string, ComponentFunction<Props, Controller>>;
  }

  type ComponenMethods<Props, Controller> = {
    render?(props: Props, ctrl: Controller): void;
    update?(): void;
    [key: string]: any;
  };

  /**
   * A type which must be placed as shown:
   *
   * ```tsx
   * const Task: Uses<iTask> = ({text}) => <div>{text}</div>;
   * ```
   *
   * If you require no props, set it to `null`:
   *
   * ```tsx
   * const Task: Uses<null> = () => <div>Hello</div>;
   * ```
   *
   * See cheat sheet by hovering over the module import for more details.
   */
  export type Uses<
    Props = any,
    Controller = any,
    Methods extends object = {}
  > = ComponentFunction<Props, Controller, Methods>;

  export interface Part {
    update(): void;
  }

  /**
   * The type for a component instance.
   */
  export type ComponentInstance<
    Props = any,
    Controller = any,
    Methods extends object = {}
  > = {
    el: HTMLElement;
    props: Props;
    ctrl: Controller;
    ref: { [key: string]: HTMLElement | ComponentInstance };
    part: { [key: string]: Part };
    base: Component<Props, Controller>;
  } & Component<Props, Controller> &
    Methods;

  /**
   * The component constructor function (typed as a class, but isn't).
   */
  export class Component<Props = any, Controller = any> {
    /**
     * The base render method looks like this:
     *
     * ```
     * render(props?: Props, ctrl?: Controller) {
     *   this.props = props;
     *   this.ctrl = ctrl;
     *   this.update();
     * }
     * ```
     *
     * You can override like so:
     *
     * ```
     * render(props?: Props, ctrl?: Controller) {
     *   // do your thing
     *   this.base.render.call(this, props, ctrl);
     * }
     * ```
     */
    render(props?: Props, ctrl?: Controller): void;
    /**
     * Updates the DOM.
     *
     * You can override like so:
     *
     * ```
     * update() {
     *   // do your thing
     *   this.base.update.call(this);
     * }
     * ```
     */
    update(): void;
  }

  /**
   * Creates a component instance and renders it.
   * @param def
   * @param props
   * @param ctrl
   */
  export function createComponent<Props, Controller, Methods extends object = {}>(
    def: ComponentFunction<Props, Controller, Methods>,
    props?: Props,
    ctrl?: Controller
  ): ComponentInstance<Props, Controller, Methods>;

  /**
   * Use to define a new component which extends another component, meaning it will
   * inherit its prototye and stubs.
   *
   * If componentFunc is omitted, the new component inherits the base's DOM structure.
   *
   * @param base The component definition to inherit from.
   * @param componentFunc A JSX function to override the DOM.
   */
  export function extendComponent<
    Props = any,
    Controller = any,
    Methods extends object = {}
  >(
    base: ComponentFunction<Props, Controller, Methods>,
    componentFunc?: ComponentFunction<Props, Controller, Methods>
  ): ComponentFunction<Props, Controller, Methods>;

  /**
   * *Replaces* element with an instance of componentDefinition and renders it.
   *
   * Note that the original element is removed along with its attributes (class, id...).
   */
  export function mount<Props = any, Controller = any, Methods extends object = {}>(
    element: string | HTMLElement,
    componentDefinition: ComponentFunction<Props, Controller, Methods>,
    props?: Props,
    ctrl?: Controller
  ): ComponentInstance<Props, Controller, Methods>;

  /**
   * Returns a Proxy of an object which throws an error when it, or its nested objects
   * are modified:
   *
   * ```js
   * const protectedObj = protect([]);
   * watchedObj[0] = 'foo';  // throws error.
   * ```
   */
  export function protect<T>(target: T): T;

  type WatchCallback = (target: any, key: string, value: any) => void;

  /**
   * Returns a Proxy of the target which calls `callback` when it, or its nested objects
   * are modified:
   *
   * ```js
   * ar = watch([], callback)
   * obj = watch({}, callback)
   *
   * // all of the following trigger the callback:
   * ar.push(100)
   * obj.x = 100
   * obj.y = {}
   * obj.y.z = 1000
   * ```
   *
   * The original object is also modified.
   *
   * The callback accepts parameters:
   *
   *  - `target` - the object which is being modified.
   *  - `key` - the key being set.
   *  - `value` - the value it is being set to.
   *
   * The callback is called after the modification has occured.
   *
   * @param {*} target - Any object, including arrays.
   * @param {*} callback - A callback function.
   * @returns a Proxy of the object.
   */
  export function watch<T>(target: T, callback: WatchCallback): T;

  export type RouteData = {
    args: { [key: string]: any };
    params: URLSearchParams;
    url: string;
  };

  export function route<Props>(
    path: string,
    componentDef: ComponentFunction<Props>,
    converter: RouteConverter<Props>
  ): Route<Props>;

  type RouteConverter<Props> = (routedata: RouteData) => Props;

  export type Route<Props> = [string, ComponentFunction<Props>, RouteConverter<Props>?];
  export type RouterProps = {
    routes: readonly Route<unknown>[];
    atts?: Record<string, unknown>;
    error?: (error: Error, router: Router) => void;
  };

  export class Router extends Component {
    static nest?({ props }: { props?: RouterProps }): JSX.Element;
    mount(component: Component<any>): void;
  }
}

type MustBeExpression = Exclude<any, string>;

/**
 * Custom JSX directives available on any intrinsic element.
 * We can't make it work with qualifiers - that requires a VSCode plugin.
 */
interface DirectiveAttributes extends AllDomEvents {
  /**
   * ## Wallace directive: apply
   *
   * Applies a callback, typically to modify its element, which is accessible via
   * **xargs**.
   *
   * Note that you can use `element` from **xargs** multiple times and each will refer
   * to the element where it is used.
   *
   * ```
   * const MyComponent = (_, { element }) => (
   *   <div>
   *     <div apply={doSomething(element)}></div>
   *     <div apply={doSomethingElse(element)}></div>
   *   </div>
   * );
   * ```
   *
   */
  apply?: MustBeExpression;

  /**
   * ## Wallace directive: bind
   *
   * Sets up two-way binding:
   *
   *   1. It uses the expression as the element's value.
   *   2. It assigns the value back to the expression when the element's `change` event
   * fires.
   *
   * So this:
   *
   * ```
   * const MyComponent = ({name}) => (
   *   <input type="text" bind={name}/>
   * );
   * ```
   *
   * Is the equivalent of this:
   *
   *```
   * const MyComponent = ({name}, {event}) => (
   *   <input type="text" onChange={name = event.target.value} value={name}/>
   * );
   * ```
   *
   * In the case of a checkbox it uses `checked` instead of `value`, so is the equivalent of this:
   *
   * ```
   * const MyComponent = ({done}, {event}) => (
   *   <input type="checkbox" onChange={done = event.target.checked} checked={done}/>
   * );
   * ```
   *
   * By defaults it listens to the `change` event, but you can specify a different one:
   *
   *```
   * const MyComponent = ({name}) => (
   *   <input type="text" bind:KeyUp={name} />
   * );
   * ```
   *
   * Note that destructured props are converted to member expressions, so these examples
   * work even though it looks like you're setting a local variable.
   */
  bind?: MustBeExpression;

  /**
   * ## Wallace directive: class
   *
   * Without a qualifer this acts as a normal attribute:
   *
   * ```
   * <div class={foo} ></div>
   * ```
   *
   * With a qualifier it defines a group of classes which can be toggled:
   *
   * ```
   * <div class:danger="danger red" toggle:danger={expr}></div>
   * ```
   */
  class?: any;

  /**
   * ## Wallace directive: css
   *
   * Shorthand for `fixed:class`:
   *
   * ```
   * <div css={foo} ></div>
   * ```
   */
  css?: string;

  /**
   * ## Wallace directive: ctrl
   *
   * Specifies ctrl for nested/repeated components.
   *
   * ```
   * <MyComponent.nest ctrl={aController} />
   * ```
   */
  ctrl?: any;

  /**
   * ## Wallace directive: fixed
   *
   * Sets the value of an attribute from an expression at point of component definition,
   * as such the expression may not access props or xargs. See also `css` directive.
   *
   * Requires a qualifer, which is the name of the attribute to set.
   *
   * ```
   * <div fixed:class={foo} ></div>
   * ```
   */
  fixed?: string;

  /** ## Wallace directive: hide
   *
   * Set the element's `hidden` property and if true, does not render dynamic elements
   * underneath.
   */
  hide?: MustBeExpression;

  /** ## Wallace directive: html
   *
   * Set the element's `innnerHTML` property.
   */
  html?: MustBeExpression;

  /** ## Wallace directive: if
   *
   * Excludes this element from the DOM completely if the condition is false,
   * and does not render dynamic elements underneath.
   * When the condition becomes true, the element is reattached.
   */
  if?: MustBeExpression;

  /**
   * ## Wallace directive: items
   *
   * Specifies items for repeated component. Must be an array of the props which the
   * nested item accepts.
   *
   */
  items?: MustBeExpression;

  /** ## Wallace directive: key
   *
   * Specifies a key for repeated components, creating an association between the key
   * and the nested component.
   *
   * You can specify a property as a string or a function.
   */
  key?: any;

  /**
   * ## Wallace directive: part
   *
   * Saves a reference to part of a component allowing you to update it independently.
   *
   * ```
   * <div part:title>
   *   {name}
   * </div>
   * ```
   *
   * ```
   * component.part.title.update();
   * ```
   */
  part?: null;

  /**
   * ## Wallace directive: props
   *
   * Specifies props for a nested component.
   *
   */
  props?: MustBeExpression;

  /**
   * ## Wallace directive: ref
   *
   * Saves a reference to an element or nested component.
   *
   * ```
   * <div ref:title>
   *   {name}
   * </div>
   * ```
   *
   * ```
   * component.ref.title.textContent = 'hello';
   * ```
   */
  ref?: null;

  /** ## Wallace directive: show
   *
   * Set the element's `hidden` property and if false, does not render dynamic elements
   * underneath.
   */
  show?: MustBeExpression;

  /**
   * ## Wallace directive: style
   *
   * Sets a style property.
   *
   * ```
   * <div style:color={getColor()}></div>
   * ```
   *
   * Requires a qualifier, but you lose the tooltip in that format.
   */
  style?: string;

  /**
   * ## Wallace directive: toggle
   *
   * Toggles classes, with two use options.
   *
   * If there is a set of classes named with `class:xyz` then it toggles those classes:
   *
   * ```
   * <div class:danger="danger red" toggle:danger={expr}></div>
   * ```
   *
   * If there isn't, then it treats the qualifier as the class name:
   * ```
   * <div toggle:danger={expr}></div>
   * ```
   *
   * Requires a qualifier, but you lose the tooltip in that format.
   */
  toggle?: string;

  /**
   * ## Wallace directive: unique
   *
   * Performance optimisation that can be applied to a component which is only used once.
   */
  unique?: boolean;
}

declare namespace JSX {
  interface Element {}

  interface IntrinsicElements {
    /**
     * Nesting syntax:
     *   ```
     *   <MyComponent.nest props={singleProps} />
     *   <MyComponent.repeat items={arrayOfProps} />
     *   <MyComponent.repeat items={arrayOfProps} key="id"/>
     *   <MyComponent.repeat items={arrayOfProps} key={(i) => i.id}/>
     *   ```
     * Note that repeated components may not have siblings.
     *
     * Available Wallace directives:
     *
     * - `apply` runs a callback to modify an element.
     * - `bind` updates a value when an input is changed.
     * - `class:xyz` defines a set of classes to be toggled.
     * - `css` shorthand for `fixed:class`.
     * - `ctrl` specifies ctrl for nested/repeated components.
     * - `fixed:xyz` sets a attribute from an expression at definition.
     * - `hide` sets an element or component's hidden property.
     * - `html` Set the element's `innnerHTML` property.
     * - `if` excludes an element from the DOM.
     * - `key` specifies a key for repeated items.
     * - `items` set items for repeated component, must be an array of props.
     * - `on[EventName]` creates an event handler (note the code is copied).
     * - `part:xyz` saves a reference to part of a component so it can be updated.
     * - `props` specifies props for a nested components.
     * - `ref:xyz` saves a reference to an element or nested component.
     * - `show` sets and element or component's hidden property.
     * - `style:xyz` sets a specific style property.
     * - `toggle:xyz` toggles `xyz` as defined by `class:xyz` on same element, or class
     *   `xyz`.
     * - `unique` can be set on components which are only used once for better performance.
     *
     * You will get more details by hovering on the directive itself, but unfortunetely
     * the tool tip won't display when you use a qualifier, like `class:danger`. To see
     * it you cantemporarily change it to something `class x:danger`.
     */
    [elemName: string]: DirectiveAttributes & Record<string, any>;
  }
  interface ElementClass {}
  interface IntrinsicAttributes {}
  interface ElementAttributesProperty {}
}

/**
 * These must be individually named to obtain the JSDoc.
 * They allow expressions or strings, so we don't bother enforcing type here.
 */
interface AllDomEvents {
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onAbort?: any;
  /**
   * ## Wallace event handler.
   *
   * Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onAnimationCancel?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onAnimationEnd?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onAnimationIteration?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onAnimationStart?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onAuxClick?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onBeforeInput?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onBlur?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onCancel?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onCanPlay?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onCanPlayThrough?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onChange?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onClick?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onClose?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onContextMenu?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onCopy?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onCueChange?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onCut?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDblClick?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDrag?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDragEnd?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDragEnter?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDragLeave?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDragOver?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDragStart?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDrop?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onDurationChange?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onEmptied?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onEnded?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onError?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onFocus?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onFormData?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onGotPointerCapture?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onInput?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onInvalid?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onKeyDown?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onKeyPress?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onKeyUp?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onLoad?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onLoadedData?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onLoadedMetadata?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onLoadStart?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onLostPointerCapture?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onMouseDown?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onMouseEnter?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onMouseLeave?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onMouseMove?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onMouseOut?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onMouseOver?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onMouseUp?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPaste?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPause?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPlay?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPlaying?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerCancel?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerDown?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerEnter?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerLeave?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerMove?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerOut?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerOver?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onPointerUp?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onProgress?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onRateChange?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onReset?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onResize?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onScroll?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onSecurityPolicyViolation?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onSeeked?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onSeeking?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onSelect?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onSlotChange?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onStalled?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onSubmit?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onSuspend?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTimeUpdate?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onToggle?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTouchCancel?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTouchEnd?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTouchMove?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTouchStart?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTransitionCancel?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTransitionEnd?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTransitionRun?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onTransitionStart?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onVolumeChange?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onWaiting?: any;
  /**
   * ## Wallace event handler
   *
   * Note the code is copied. Use xargs to access the event:
   *
   * ```
   * const MyComponent = (_, { event }) => (
   *    <button onClick={clickHandler(event)} />
   * );
   * ```
   */ onWheel?: any;
}

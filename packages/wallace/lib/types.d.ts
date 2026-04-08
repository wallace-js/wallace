/**
 * This file lies about several definitions in order to make TypeScript work with JSX.
 * Note that docstrings will appear in most IDE tooltips, selecting the latest overload.
 */

/**
# Wallace cheat sheet

### Contents

  1. Components
  2. JSX
  3. Nesting
  4. Repeating
  5. Directives
  6. Hubs
  7. Inheritance
  8. Stubs
  9. TypeScript
 10. Helpers
 11. Flags

For more detailed documentation go to https://wallace.js.org/docs/


## 1. Components

### 1.1 Defining

You define a component by assigning a JSX function to a value:

```tsx
const MyComponent = () => <div>Hello</div>;
```

The function body must be a single JSX expression, returned, and nothing else.

The function takes two arguments, both optional:

1. **model** - which *may* be destructured.
2. **xargs** - which *must* be destructured to exactly one level, as shown:

```tsx
const MyComponent = ({title}, {hub, event}) => (
  <button onClick={hub.doSomething(event)}>
    {title}
  </button>
);
```

The **xargs** contains:

- `hub` refers to the hub.
- `model` refers to the model, in case you want the non-destructured version too.
- `self` refers to the component instance (as `this` is not allowed).
- `event` refers to the event in an event callback.
- `element` refers to the element in an event callback, or in `apply`.

The function will be replaced by a very different one during compilation, therefore:

1. Do not call it from your own code.
2. Do not do weird things with it or within it.

### 1.2 Mounting

You mount the root component of your tree using `mount`:

```tsx
const root = mount("root", MyComponent, model, hub);
```

The arguments are:

1. Element or id string.
2. Component definition.
3. model for the element (optional)
4. hub (optional)

`mount` returns the component instance, allowing you to call its methods:

```tsx
root.update();
```

### 1.3 Methods

Components have two public methods:

#### render(model, hub)

Called from "above" by `mount` or when nesting other components. Here it is:

```tsx
render(model, hub) {
  this.model = model;
  this.hub = hub;
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
  render(model) {
    this.hub = new MyHub(this, model);
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
  render(model) {
    this.base.render.call(this, model, hub);
  }
};
```

Note that `base` is not the same as `super` in classes which access the lowest override.

You access the instance as `this` in methods, but cannot use `this` in arrow functions,
so use `self` from the **xargs** in component functions.


### 1.4 Fields

Component instances have the following fields:

- `model` the data for this component instance.
- `hub` the hub object.
- `el` the component instance's root element.

Optionally:

- `ref` an object containing named elements or nested components.
- `part` an object containing named parts.

Both `model` and `hub` are set during the `render` method before calling `update`.
There are no restrictions on types but typically:

- `model` is an object with primitive data.
- `hub` is an instance of a custom class.

Nested components will receive:

- The same `hub` as the parent.
- The `model` specified in JSX.

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

To nest a component use its name and pass `model` if needed:

```tsx
const Task = (task) => (<div></div>);

const TopTasks = (tasks) => (
  <div>
    <Task model={tasks[0]} />
  </div>
);
```

Notes:

 - You cannot use nest on the root element.
 - You cannot use `if` on a nested element, only `show` and `hide`.

## 4. Repeating

To repeat a component use its name followed by `.repeat` and pass `model` which must
be an Array of the model the component uses:

```tsx
const Task = (task) => (<div></div>);

const TaskList = (tasks) => (
  <div>
    <Task.repeat model={tasks} />
  </div>
);
```

This form reuses components sequentially, which may cause issues with CSS animations
and focus, in which case you should use a keyed repeater by passing `key` which can
be a string or a function:

```tsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat model={tasks} key="id"/>
  </div>
);

const TaskList = (tasks) => (
  <div>
    <Task.repeat model={tasks} key={(x) => x.id}/>
  </div>
);
```

Notes:

 - You cannot use repeat on the root element.
 - You cannot toggle visibility on the repeat element.

## 5. Directives

Directives are attributes with special behaviours. 

You can see the list of available directives by hovering over any JSX element, like
a `div`

You will get more details by hovering on the directive itself, but unfortunetely the
tool tip won't display when you use a qualifier, like `class:danger`. To see it you can
temporarily change it to something `class x:danger`.

You can define your own directives in your babel config.

## 6. Hubs

A hub is just an object you create which gets passed down to every nested
component, making it a convenient place to handle:

- Event handlers.
- Fetching data.
- Sorting, filtering and formatting model.
- Coordinating updates.

This lets you use model purely for data.

Hubs often reference:

- One or more components to be updated after data changes.
- Other controllers they need access to like services or modal containers.

Components sometimes only use a controller, and no model.

```tsx
class TaskHub {
  constructor (rootComponent, dbHub) {
    this.root = rootComponent;
    this.db = dbHub;
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

const TaskList = (_, {hub}) => (
  <div>
    <Task.repeat model={hub.getTasks()} />
  </div>
);

TaskList.methods = {
  render(_, hub) {
    this.hub = new TaskHub(this, hub);
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
    <stub.animation />
    <stub.text />
  </div>
);
```

And defined on the `stub` property of the component definition:

```tsx
MyComponent.stub.animation: () => <div>...</div>;
MyComponent.stub.text: MyTextComponent;
```

Stubs are inherited and can be overridden, which means you can either:

- Set the DOM structure in the base, and implement/override stubs on the child.
- Set the DOM structure in the child, and use/override stubs from the base.

So long as the rendered component has all its stubs defined somewhere, it will work.

Notes:

- Stubs are separate components, so cannot access methods on the containing component
  through `self` (use the hub for that kind of thing).

## 9. TypeScript

There are two types you can use to annotate components:

### Takes

Lets you annotate a component's model and hub (both optional). It must be placed
right after the component name (not inside the parameters):

```tsx
import { Takes } from 'wallace';

interface iTask {
  text: string
}

const Task: Takes<iTask> = ({text}) => <div>{text}</div>;
```

This ensures you pass correct model during mounting, nesting and repeating:

```
const TaskList: Takes<iTask[]> = (tasks) => (
  <div>
    First task:
    <Task model={tasks[0]} />
    <Task.repeat model={tasks.slice(1)} />
  </div>
);

mount("main", TaskList, [{test: 'foo'}]);
```

If you require no model, pass `null`:

```tsx
const Task: Takes<null> = () => <div>Hello</div>;
```

### Uses


Lets you annotate model, hub and other things the component uses. It is used in the same
way as `Takes` except you pass types as an object rather than sequentially, whose fields
are all optional:

```tsx
import type { Uses } from 'wallace';

const Task: Uses<{
  model: Model,
  hub: Hub,
  methods: Methods,
  stub: Stub
}> = () => <div></div>;
```

#### Methods

Custom methods of the component are available `self`:

```tsx
import type { Uses } from 'wallace';

interface TaskMethods () {
  getName(): string;
}

const Task: Uses<{methods: TaskMethods}> = (_, { self }) => (
  <div>{self.getName()}</div>
));

Task.methods = {
  getName() { return 'wallace' },
  render(model, hub) {  // types are already known
    this.model = { ...model, notallowed: 1 };  // type error
  }
};
```

The type will pass into the object passed into `methods` so it recognises custom methods
in addition to standard methods like `render`, which are already typed for you.

#### Stubs

You can specify the model and hub of each stub:

```tsx
import type { Takes, Uses } from 'wallace';

interface ParentTypes {
  hub: Hub;
  stub: {
    foo: Takes<iDay>;
    bar: Takes<iDay, Hub}>;
  };
}

const Parent: Uses<ParentTypes> = (_, { stub }) => (
  <div>
    <stub.foo model={data[0]} /> 
    <stub.foo.repeat model={data} /> 
  </div>
);
```

### Inheritance

The `extendComponent` function transfers the types specified on the base:

```tsx
const Child = extendComponent(Parent);
```

You may specify different types:

```tsx
const Child = extendComponent<newModel, Hub, Methods>(Parent);
```

However:

1. You must specify all those that are specified on base - as omitted types default
   to `any`.
2. Each type must extend its corresponding type on base.

### Other types:

Wallace defines some other types you may use:

 - `Component<Model, Hub, Methods>` - the base component class (it is a 
    constructor, not a class)
 - `ComponentInstance<Model, Hub, Methods>` - a component instance.

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
mount("elementId", MyComponent, model, hub);
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

## 11. Flags

You can toggle flags in your babel config to disable certain features for cutting edge
performance and bundle size:

1.  `allowBase` - allows use of `base` in components.
2.  `allowHub` - allows use of `hub` in components.
3.  `allowDismount` - allows components to handle dismounting.
4.  `allowMethods` - allows use of `methods` helper to components.
5.  `allowParts` - allows use of parts.
6.  `allowRepeaterSiblings` - allows repeaters to have siblings.
7.  `allowStubs` - allows use of stubs.

These flags default to true, unless you specify `flags` in the plugin config, in which
case they default to false and you need to explicitly enable those you want:


```tsx
module.exports = {
  plugins: [
    [
      "babel-plugin-wallace",
      {
        flags: {
          allowHub: true,
          allowStubs: false
        },
      }
    ],
    "@babel/plugin-syntax-jsx"
  ],
  presets: ["@babel/preset-typescript", ...]
};
```

The types (and therefore tool tips) are unaffected by these flags, and will treat them
all as being true.

---
Report any issues to https://github.com/wallace-js/wallace

*/

declare module "wallace" {
  type StubDefinition = {
    [key: string]: ComponentFunction;
  };

  type StubInterface<Stubs> = {
    [K in keyof Stubs]: Stubs[K] extends ComponentFunction ? Stubs[K] : never;
  };

  /**
   * A component function.
   */
  interface ComponentFunction<
    Model = any,
    Hub = any,
    Methods extends object = {},
    Stubs extends StubDefinition = {}
  > {
    (
      model?: Model,
      xargs?: {
        hub: Hub;
        model: Model;
        self: ComponentInstance<Model, Hub, Methods>;
        stub: StubInterface<Stubs>;
        event: Event;
        element: HTMLElement;
      }
    ): JSX.Element;
    repeat?({
      model,
      hub,
      part,
      key
    }: {
      model: Array<Model>;
      hub?: Hub;
      part?: string;
      key?: keyof Model | ((item: Model) => any);
    }): JSX.Element;
    methods?: ComponentMethods<Model, Hub, Methods> &
      ThisType<ComponentInstance<Model, Hub, Methods>>;
    readonly prototype: ComponentInstance<Model, Hub>;
    readonly stub?: Stubs;
  }

  type ComponentMethods<Model, Hub, Methods extends object = {}> = {
    render?(this: ComponentInstance<Model, Hub, Methods>, model: Model, hub: Hub): void;
    update?(this: ComponentInstance<Model, Hub, Methods>): void;
    [key: string]: any;
  };

  /**
   * A type which annotates the model and hub (both optional) which the component takes.
   *
   * It must be placed as shown:
   *
   * ```tsx
   * import type { Takes } from 'wallace';
   * const Task: Takes<iTask> = ({text}) => <div>{text}</div>;
   * ```
   *
   * If you require no model, set it to `null`:
   *
   * ```tsx
   * const Task: Takes<null> = () => <div>Hello</div>;
   * ```
   */
  type Takes<Model = unknown, Hub = unknown> = ComponentFunction<Model, Hub>;

  /**
   * A type which annotates the model, hub, methods and stubs (all optional) which the
   * component uses.
   *
   * It must be placed as shown:
   *
   * ```tsx
   * import type { Uses } from 'wallace';
   *
   * const Task: Uses<{
   *    model: Model,
   *    hub: Hub,
   *    methods: Methods,
   *    stub: Stub
   * }> = () => <div></div>;
   * ```
   */
  type Uses<T = any> = T extends object
    ? T extends { model: any } | { hub: any } | { methods: any } | { stub: any }
      ? ComponentFunction<
          T extends { model: any } ? T["model"] : any,
          T extends { hub: any } ? T["hub"] : any,
          T extends { methods: any } ? T["methods"] : {},
          T extends { stub: any } ? T["stub"] : {}
        >
      : ComponentFunction<T>
    : ComponentFunction<T>;

  interface Part {
    update(): void;
  }

  /**
   * The type for a component instance.
   */
  type ComponentInstance<Model = any, Hub = any, Methods extends object = {}> = {
    el: HTMLElement;
    model: Model;
    hub: Hub;
    ref: { [key: string]: HTMLElement };
    part: { [key: string]: Part };
    base: Component<Model, Hub>;
    dismount(): void;
  } & Component<Model, Hub> &
    Methods;

  /**
   * The component constructor function (typed as a class, but isn't).
   */
  class Component<Model = any, Hub = any> {
    /**
     * The base render method looks like this:
     *
     * ```
     * render(model?: Model, hub?: Hub) {
     *   this.model = model;
     *   this.hub = hub;
     *   this.update();
     * }
     * ```
     *
     * You can override like so:
     *
     * ```
     * render(model?: Model, hub?: Hub) {
     *   // do your thing
     *   this.base.render.call(this, model, hub);
     * }
     * ```
     */
    render(model?: Model, hub?: Hub): void;
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
   * @param model
   * @param hub
   */
  function createComponent<Model, Hub, Methods extends object = {}>(
    def: ComponentFunction<Model, Hub, Methods>,
    model?: Model,
    hub?: Hub
  ): ComponentInstance<Model, Hub, Methods>;

  /**
   * Use to define a new component which extends another component, meaning it will
   * inherit its prototye and stubs.
   *
   * If componentFunc is omitted, the new component inherits the base's DOM structure.
   *
   * @param base The component definition to inherit from.
   * @param componentFunc A JSX function to override the DOM.
   */
  function extendComponent<Model = any, Hub = any, Methods extends object = {}>(
    base: ComponentFunction<Model, Hub, Methods>,
    componentFunc?: ComponentFunction<Model, Hub, Methods>
  ): ComponentFunction<Model, Hub, Methods>;

  /**
   * *Replaces* element with an instance of componentDefinition and renders it.
   *
   * Note that the original element is removed along with its attributes (class, id...).
   */
  function mount<Model = any, Hub = any, Methods extends object = {}>(
    element: string | HTMLElement,
    componentDefinition: ComponentFunction<Model, Hub, Methods>,
    model?: Model,
    hub?: Hub
  ): ComponentInstance<Model, Hub, Methods>;

  /**
   * Returns a Proxy of an object which throws an error when it, or its nested objects
   * are modified:
   *
   * ```js
   * const protectedObj = protect([]);
   * watchedObj[0] = 'foo';  // throws error.
   * ```
   */
  function protect<T>(target: T): T;

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
  function watch<T>(target: T, callback: WatchCallback): T;

  type RouteData = {
    args: { [key: string]: any };
    params: URLSearchParams;
    url: string;
  };

  function route<Model>(
    path: string,
    componentDef: ComponentFunction<Model>,
    converter?: RouteConverter<Model>,
    cleanup?: RouteCleanup<Model>
  ): Route<Model>;

  type RouteConverter<Model> = (routedata: RouteData) => Model;
  type RouteCleanup<Model> = (component: ComponentInstance<Model>) => void;

  type Route<Model> = [
    string,
    ComponentFunction<Model>,
    RouteConverter<Model>?,
    RouteCleanup<Model>?
  ];
  type RouterModel = {
    routes: readonly Route<any>[];
    atts?: Record<string, any>;
    error?: (error: Error, router: Router) => void;
  };

  type Router = ComponentFunction<RouterModel> & {
    mount(component: Component<any>): void;
  };

  const Router: Router;
}

type OptionalExpression<T> = T | boolean;
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
   * ## Wallace directive: assign
   *
   * Assigns the component instance to a value during `render`, typically on the model
   * or the hub.
   *
   * You can either use an expression:
   *
   * ```
   * const MyComponent = ({ id }, { hub }) => (
   *   <div assign={hub.register[id]}>
   *   </div>
   * );
   * ```
   *
   * Or use a qualifier, which is read as being a field on the model:
   *
   * ```
   * const MyComponent = () => (
   *   <div assign:c>
   *   </div>
   * );
   * ```
   *
   * Be careful not to assign to a watched property which updates this component or a
   * parent, as that will create an infinite loop.
   *
   * May only be used on the root element. Modifies the `set` method.
   */
  assign?: ComponentInstance;

  /**
   * ## Wallace directive: bind
   *
   * Sets up two way binding between an input and data:
   *
   * ```
   * <input type="text" bind={name} />
   * ```
   *
   * Is the equivalent of this:
   *
   * ```
   * <input type="text" value={name} onChange={name = event.target.value} />
   * ```
   *
   * By default it watches the `change` event, but you can specify a different one using
   * the `event` directive:
   *
   * ```
   * <input type="text" bind={name} event:keyup />
   * ```
   *
   * By default it binds to `value` but you can set a different property:
   *
   *```
   * <input type="number" bind:valueAsNumber={name} />
   * ```
   */
  bind?: MustBeExpression;

  /**
   * ## Wallace directive: bind-as
   *
   * Set input type and binding to the property you likely want for that input type:
   *
   * ```
   * <input bind-as:checkbox={foo} />
   * <input bind-as:date={foo} />
   * <input bind-as:number={foo} />
   * <input bind-as:range={foo} />
   * ```
   *
   * Is the equivalent of this:
   *
   * ```
   * <input type="checkbox" bind:checked={foo} />
   * <input type="date" bind:valueAsDate={foo} />
   * <input type="number" bind:valueAsNumber={foo} />
   * <input type="range" bind:valueAsNumber={foo} />
   * ```
   *
   * Other types like `month`, `time` and `datetime-local` are not supported as they
   * don't use the properties you'd expect.
   *
   * Like `bind` it watches the `change` event, but you can specify a different one with
   * the `event` directive:
   *
   * ```
   * <input bind-as:range={foo} event:input />
   * ```
   */
  "bind-as"?: MustBeExpression;

  /**
   * ## Wallace directive: class
   *
   * Without a qualifier this acts as a normal attribute:
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
   * ## Wallace directive: hub
   *
   * Specifies alternative `hub` for stubs, nested or repeated components.
   *
   * ```
   * <MyComponent hub={altHub} />
   * ```
   */
  hub?: any;

  /**
   * ## Wallace directive: event
   *
   *
   * Must be used with the `bind` directive, and causes it do watch a different event
   * (the default is `change`)
   *
   * ```
   * <input type="text" bind={name} event:keyup />
   * ```
   */
  event?: string;

  /**
   * ## Wallace directive: fixed
   *
   * Sets the value of an attribute from an expression at point of component definition,
   * as such the expression may not access model or xargs. See also `css` directive.
   *
   * Requires a qualifer, which is the name of the attribute to set.
   *
   * ```
   * <div fixed:class={foo} ></div>
   * ```
   */
  fixed?: string;

  /**
   * ## Wallace directive: help
   *
   * Does nothing other than show this tooltip.
   *
   * ### Directives:
   *
   * - `apply` runs a callback to modify an element.
   * - `assign` assigns the component instance to a value.
   * - `bind` updates a value when an input is changed.
   * - `class:xyz` defines a set of classes to be toggled.
   * - `css` shorthand for `fixed:class`.
   * - `hub` specifies hub for nested/repeated components.
   * - `event` changes the event which `bind` reacts to.
   * - `fixed:xyz` sets a attribute from an expression at definition.
   * - `hide` sets an element or component's hidden property.
   * - `html` Set the element's `innnerHTML` property.
   * - `if` excludes an element from the DOM.
   * - `key` specifies a key for repeated components.
   * - `on[EventName]` creates an event handler (note the code is copied).
   * - `part:xyz` saves a reference to part of a component so it can be updated.
   * - `model` specifies model for stubs, nested or repeated components.
   * - `ref:xyz` saves a reference to an element or nested component.
   * - `show` sets and element or component's hidden property.
   * - `style:xyz` sets a specific style property.
   * - `toggle:xyz` toggles `xyz` as defined by `class:xyz` on same element, or class
   *   `xyz`.
   * - `unique` can be set on components which are only used once for better performance.
   * - `watch` watches the model or the hub.
   *
   * See more by hovering on a specific directive.
   * Qualifiers like `class:danger` break the tool tip. Try `class x:danger`.
   *
   * ### Nesting syntax:
   *
   *   ```
   *   <MyComponent model={singleModel} />
   *   <MyComponent.repeat model={arrayOfModel} />
   *   <MyComponent.repeat model={arrayOfModel} key="id"/>
   *   <MyComponent.repeat model={arrayOfModel} key={(i) => i.id}/>
   *   ```
   */
  help?: boolean;

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
  part?: string | null;

  /**
   * ## Wallace directive: model
   *
   * Specifies model for a stub, nested or repeated component - in which case it means
   * an Array of the model used by the component.
   *
   */
  model?: MustBeExpression;

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
  ref?: string | null;

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
   *
   * May only be used on the root element.
   */
  unique?: boolean;

  /**
   * ## Wallace directive: watch
   *
   * Wraps the model in a `watch` call which updates the component by overriding the
   * `set` method:
   *
   * ```
   * function set(model, hub) {
   *   this.model = watch(model, () => this.update());
   *   this.hub = hub;
   * }
   * ```
   *
   * You can provide a different callback to `watch`:
   *
   * ```
   * const MyComponent = () => (
   *   <div watch={(target, key, value) => foo()}></div>
   * );
   * ```
   *
   * For more complex use cases, import the `watch` function and use it in an overriden
   * `render` method.
   *
   * May only be used on the root element. Modifies the `set` method.
   */
  watch?: OptionalExpression<CallableFunction>;
}

// This makes this a module, which is needed to declare global, which is needed to make
// LibraryManagedAttributes work.
export {};

type NativeIntrinsicElements = {
  [K in keyof HTMLElementTagNameMap]: DirectiveAttributes & {
    style?: string;
    class?: string;
    [attr: string]: any;
  };
};

// WARNING - check that your changes here don't break standard html autocomplete
// in JSX. The following should autocomplete button and allow style:
//
// <button style="width:20px" >

declare global {
  namespace JSX {
    // This allows <Foo model={x} if={y} />
    type Wrapper<Model> = Model | { model: Model; if?: boolean; part?: string };

    type LibraryManagedAttributes<C, P> =
      C extends ComponentFunction<infer Model, any, any, any> ? Wrapper<Model> : P;

    interface IntrinsicElements extends NativeIntrinsicElements {
      [elemName: string]: DirectiveAttributes & Record<string, any>;
    }
    interface Element {}
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
}

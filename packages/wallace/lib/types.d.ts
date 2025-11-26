// This module lies about several definitions in order to make TypeScript work with JSX.
// Note that docstrings will appear in most IDE tooltips, but only the latest overload.
// These may use Markdown syntax.

/**

# Wallace cheat sheet

 1. Components
 2. JSX
 3. Directives
 4. Utilities
 5. Rendering
 6. Inheritance
 7. TypeScript

## 1. Components

A component function:

1. Must be an arrow function which implicitly returns a JSX statement.
2. Must be assigned to a const that starts with a capital letter.
3. Uses `props` as its first argument, then any extra arguments.

The props argument can be destructured (but only to one level) and the names must not
match the name of any extra argument, even if unused.

The extra argument, destructured:

- `ctrl` the controller.
- `self` the component.
- `e` the event arg in an event callback, just for TypeScript support.

The extra arguments may not be desctructured.

Example:

```
const MyComponent = ({title}, {ctrl, self, e)) => (
  <button onClick={ctrl.doSomething(self, e)}>
    {title}
  </button>
);
```

## 2. JSX

JSX is only permitted as the implicit return of an arrow function, which must be either:

1. A component definition (as described in **1. Components**).
2. A stub (as described in **6. Inheritance**).

You cannot put JavaScript expressions before, within or around JSX, except inside
placeholders so long as it does not return JSX. 

Other than that, its standard JSX, except for three special cases:

1. Directives (attributes with special meanings, see **3. Directives**).
2. Nesting.
3. Stubs, for inheritance.

### 2.1 Nesting

Use `ComponentName.nest` and `ComponentName.repeat` to nest components:

```tsx
const Task: Uses<iTask> = (task) => (<div></div>);

const TopTasks: Uses<iTask[]> = (tasks) => (
  <div>
    <Task.nest props={tasks[0]} />
    <Task.nest props={tasks[1]} />
  </div>
);

const TaskList: Uses<iTask[]> = (tasks) => (
  <div>
    <Task.repeat props={tasks} />
  </div>
);
```

Notes:

  - TypeScript will adjust `props` to require `iTask` or `iTask[]` accordingly.
  - You may not nest the root element.
  - Repeat must not have siblings.
  - You may not use `if` directive - use `show` and `hide` instead.

### 2.2 Stubs

You can define a `stub`

```jsx
const BaseComponent = () => (
    <div>
      hello
      <stub:display />
    </div>
  );
  const SubComponent = extendComponent(BaseComponent);
  SubComponent.prototype.display = ({ name }) => <span>{name}</span>;
```

## 3. Directives

- `base` specifies a base class to inherit from.
- `bind` updates a value when an input is changed.
- `class:xyz` defines a set of classes to be toggled. 
- `hide` sets and element or component's hidden property.
- `if` excludes an element from the DOM.
- `on[EventName]` creates an event handler (note the code is copied)
- `props` specifes props for a nested or repeated component, in which case it must be an array.
- `ref` saves a reference to an element or nested component.
- `show` sets and element or component's hidden property.
- `style:xyz` sets a specific style property.
- `toggle:xyz` toggles `xyz` as defined by `class:xyz` on same element, or class `xyz`.

## 4. Utilities

A sentence woth `code` inside

```
const Task: Uses<iTask> = ({ text, done }, ctrl) => (
  <div>
    <input type="checkbox" bind={done} />
    <label onClick={console.log(ctrl)} style:color={done ? "grey" : "black"}>
      {text}
    </label>
  </div>
);
```

## 5. Rendering

The `render` method looks like, and can be overriden like this:

```
MyComponent.prototype.render = function(props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
}
```

This is the only place where Wallace calls `update` - but you may call it from anywhere
you like.

## 6. Inheritance

To extend without changing the DOM use `extendComponent`:

```
const Parent = () => <div></div>;
const Child = extendComponent(Parent);
```

To change the DOM use `base` directive:

```
const Child = () => (
  <div base={Parent}>
  </div>
);
```

Either way the new component definition inherits the parent prototype, including stub
implementations.

Stubs can be defined or implemented on Child or Parent:

```
const Parent = () => (
  <div>
    <stub:stub1 />
    <stub:stub2 />
  </div>
);
Parent.prototype.stub1 = () => <span>Red</span>;
Parent.prototype.stub2 = () => <span>Yellow</span>;
Parent.prototype.stub3 = () => <span>Green</span>;

const ChildA = extendComponent(Parent);
ChildA.prototype.stub1 = () => <span>Blue</span>;
// ChildA renders: Blue Yellow

ChildB = () => (
  <div base={Parent}>
    <stub:stub2 />
    <stub:stub3 />
  </div>
)
ChildB.prototype.stub2 = () => <span>Orange</span>;
// ChildB renders: Orange Green
```

## 7. TypeScript

The `Uses` type can control props, controller and prototype.

### Props

```
import { Uses } from 'wallace';

interface iTask {
  text: string
}

// Here `text` will be of type string:
const Task: Uses<iTask> = ({text}) => <div>{text}</div>

// also restricts the props you can pass when nesting or mounting.
```


### Controller

```
import { Uses } from 'wallace';

class TaskController () {
  getName() {}
}

// Here `ctrl` will be of type TaskController:
const Task: Uses<any, TaskController> = (_, {ctrl}) => (
  <div>{ctrl.getName()}</div>
)
```

### Prototype

```
import { Uses } from 'wallace';

interface Methods () {
  getName() {}
}

// The properties will be available on `self`:
const Task: Uses<any, TaskController> = (_, {self}) => (
  <div>{self.getName()}</div>
)
```

---
---
Help make Wallace better by giving it a star: https://github.com/wallace-js/wallace
*/

declare module "wallace" {
  /**
   * For internal use. Ensures a component can be nested in JSX, and also sets the types
   * for the args.
   */
  interface ComponentFunction<
    Props = any,
    Controller = any,
    Methods extends object = {},
  > {
    (
      props: Props,
      other?: {
        ctrl: Controller;
        self: Component<Props, Controller, Methods>;
        e: Event;
      }
    ): JSX.Element;
    nest?({
      props,
      show,
      hide,
    }: {
      props?: Props;
      show?: boolean;
      hide?: boolean;
    }): JSX.Element;
    repeat?({
      props,
      show,
      hide,
    }: {
      props: Array<Props>;
      show?: boolean;
      hide?: boolean;
    }): JSX.Element;
  }

  type PrototypeExtras<Props, Controller> = {
    render?(props: Props, ctrl: Controller): void;
  } & Record<string, any>;

  /**
   * Defines a component with optional properties to add to its prototype.
   *
   * @param component An arrow function which returns JSX.
   * @param prototypeExtras An object with properties to be added to the prototype.
   *
   * If you specify <iProps, Controller> types, then
   * All the parameters will have the corresponding types:
   *
   * ```
   * const MyComponent = uses<iProps, ControllerClass>(
   *   (props, {ctrl}) => <div></div>,
   *   {
   *     render(props, ctrl){},
   *     otherMethod(){}
   *   }
   * );
   */
  export function define<Props, Controller>(
    component: ComponentFunction<Props, Controller, typeof prototypeExtras>,
    prototypeExtras?: PrototypeExtras<Props, Controller> &
      ThisType<Component<Props, Controller>>
  ): Uses<Props, Controller, typeof prototypeExtras>;

  export type Uses<
    Props = any,
    Controller = any,
    Methods extends object = {},
  > = ComponentFunction<Props, Controller, Methods>;

  export type Component<
    Props = any,
    Controller = any,
    Methods extends object = {},
  > = {
    update(): void;
    render(props: Props, ctrl?: Controller): void;
    el: HTMLElement;
    props: Props;
    ctrl: Controller;
  } & Methods;

  export function mount<
    Props = any,
    Controller = any,
    Methods extends object = {},
  >(
    element: string | HTMLElement,
    component: Uses<Props, Controller, Methods>,
    props?: Props,
    ctrl?: Controller
  ): Component<Props, Controller, Methods>;

  export function watch<T>(obj: T, callback: CallableFunction): T;

  export function extendComponent<
    Props = any,
    Controller = any,
    Methods extends object = {},
  >(
    base: Uses<Props, Controller, Methods>,
    extras?: { [key: string]: any }
  ): Uses<Props, Controller, Methods>;
}

type MustBeExpression = Exclude<any, string>;

/**
 * Custom JSX directives available on any intrinsic element.
 * We can't make it work with qualifiers - that requires a VSCode plugin.
 */
interface DirectiveAttributes extends AllDomEvents {
  /**
   * ## Wallace directive: base
   *
   * Specifies a base component definition to inherit from.
   *
   * This allows you to inherit methods and override stubs.
   * Must be an expression returning a component definition.
   */
  base?: MustBeExpression;

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
   * const MyComponent = ({name}, {e}) => (
   *   <input type="text" onChange={name = e.target.value} value={name}/>
   * );
   * ```
   *
   * In the case of a checkbox it uses `checked` instead of `value`, so is the equivalent of this:
   *
   * ```
   * const MyComponent = ({done}, {e}) => (
   *   <input type="checkbox" onChange={done = e.target.checked} checked={done}/>
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
   * Unfortunately you lose the tooltip in that format.
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
   *
   * Unfortunately you lose the tooltip in that format.
   */
  class?: any;

  /** ## Wallace directive: hide
   *
   * Set the element's `hidden` property and if true, does not render dynamic elements
   * underneath.
   */
  hide?: MustBeExpression;

  /** Wallace excludes this element from the DOM if the condition is false,
   * and does not render dynamic elements underneath. */
  if?: MustBeExpression;

  /**
   * ## Wallace directive: props
   *
   * Specifies props for a nested or repeated component.
   *
   * If it is a repeated component, the props should be an array of whatever type it
   * accepts.
   */
  props?: MustBeExpression;

  /**
   * ## Wallace directive: ref
   *
   * Saves a reference to the element on the component, allowing it to be accessed.
   *
   * ```
   * <div ref:title></div>
   * ```
   *
   * ```
   * component.ref.title.textContent = 'hello';
   * ```
   *
   * Requires a qualifier, but you lose the tooltip in that format.
   */
  ref?: string;

  /*
  - `style:xyz` sets a specific style property.
  - `toggle:xyz` toggles `xyz` as defined by `class:xyz` on same element, or class `xyz`.
  */

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
   * Foo
   */
  "class-a"?: string;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
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
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onAbort?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onAnimationCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onAnimationEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onAnimationIteration?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onAnimationStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onAuxClick?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onBeforeInput?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onBlur?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onCanPlay?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onCanPlayThrough?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onClick?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onClose?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onContextMenu?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onCopy?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onCueChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onCut?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDblClick?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDrag?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDragEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDragEnter?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDragLeave?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDragOver?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDragStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDrop?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onDurationChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onEmptied?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onEnded?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onError?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onFocus?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onFormData?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onGotPointerCapture?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onInput?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onInvalid?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onKeyDown?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onKeyPress?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onKeyUp?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onLoad?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onLoadedData?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onLoadedMetadata?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onLoadStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onLostPointerCapture?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onMouseDown?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onMouseEnter?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onMouseLeave?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onMouseMove?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onMouseOut?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onMouseOver?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onMouseUp?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPaste?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPause?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPlay?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPlaying?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerDown?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerEnter?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerLeave?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerMove?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerOut?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerOver?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onPointerUp?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onProgress?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onRateChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onReset?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onResize?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onScroll?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onSecurityPolicyViolation?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onSeeked?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onSeeking?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onSelect?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onSlotChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onStalled?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onSubmit?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onSuspend?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTimeUpdate?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onToggle?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTouchCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTouchEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTouchMove?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTouchStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTransitionCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTransitionEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTransitionRun?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onTransitionStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onVolumeChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onWaiting?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, { e }) => (
   *    <button onClick={clickHandler(e)} />
   * );
   * ```
   */ onWheel?: any;
}

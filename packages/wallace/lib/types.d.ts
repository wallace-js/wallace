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
3. Accepts `props` as its first argument, then any extra arguments.

The props argument can be destructured, but the names must not match the 
name of any extra argument, even if unused.

The extra arguments can any of the following, in any order:

- `ctrl` the controller.
- `_component` the component.
- `_event` the event arg in an event callback.
- `_element` the element arg in an event callback.

The extra arguments may not be desctructured.

Example:

```
const MyComponent = ({title, callback}, ctrl, _event) => (
  <button onClick={callback(_event)}>
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
const Task: Accepts<iTask> = (task) => (<div></div>);

const TopTasks: Accepts<iTask[]> = (tasks) => (
  <div>
    <Task.nest props={tasks[0]} />
    <Task.nest props={tasks[1]} />
  </div>
);

const TaskList: Accepts<iTask[]> = (tasks) => (
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
const Task: Accepts<iTask> = ({ text, done }, ctrl) => (
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

Use `Accepts` to specify the props type a component accepts:

```
import { Accepts } from 'wallace';

interface iTask {
  text: string,
  done: boolean
}

const Task: Accepts<iTask> = ({text, done}) => <div></div>
```

Use `AcceptsExtends` for components with custom methods:

```
import { AcceptsExtends } from 'wallace';

interface Methods {
  someFunction: () => void;
}

const Task: AcceptsExtends<any, Methods> = () => (
  <div></div>
);
const root = mount('root', Task);
root.someFunction();
```

Use `Component` if you need a type for component instances:

//TODO: complete later...
```
Component<iTask>
```

---

Help make Wallace better by giving it a star: https://github.com/wallace-js/wallace
 */
declare module "wallace" {
  interface ComponentFunction<Type> {
    (props: Type, ...rest: Array<any>): JSX.Element;
    nest?({
      props,
      show,
      hide,
    }: {
      props?: Type;
      show?: boolean;
      hide?: boolean;
    }): JSX.Element;
    repeat?({
      props,
      show,
      hide,
    }: {
      props: Array<Type>;
      show?: boolean;
      hide?: boolean;
    }): JSX.Element;
  }

  export type Accepts<Type> = ComponentFunction<Type>;
  export type AcceptsExtends<Type, Proto> = ComponentFunction<Type>;

  export interface Component<T> {
    update(): void;
    render(props: T): void;
    el: HTMLElement;
    props: T;
    ctrl: any;
  }
  export type ComponentExtends<Proto> = Component<any> & Proto;

  export function mount<T, Proto>(
    element: string | HTMLElement,
    component: Accepts<T> | AcceptsExtends<T, Proto>,
    props?: T,
    ctrl?: any
  ): Component<T> & Proto;

  export function watch<T>(obj: T, callback: CallableFunction): T;

  export function extendComponent<T>(
    base: Accepts<T>,
    extras?: { [key: string]: any }
  ): Accepts<T>;
}

type MustBeExpression = Exclude<any, string>;

/**
 * Custom JSX directives available on any intrinsic element.
 * We can't make it work with qualifiers - that requires a VSCode plugin.
 * */
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
   * const MyComponent = ({name}) => (
   *   <input type="text" onChange={name = _element.value} value={name}/>
   * );
   * ```
   *
   * In the case of a checkbox it uses `checked` instead of `value`, so is the equivalent of this:
   *
   * ```
   * const MyComponent = ({done}) => (
   *   <input type="checkbox" onChange={done = _element.checked} checked={done}/>
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
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onAbort?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onAnimationCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onAnimationEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onAnimationIteration?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onAnimationStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onAuxClick?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onBeforeInput?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onBlur?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onCanPlay?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onCanPlayThrough?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onClick?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onClose?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onContextMenu?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onCopy?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onCueChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onCut?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDblClick?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDrag?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDragEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDragEnter?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDragLeave?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDragOver?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDragStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDrop?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onDurationChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onEmptied?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onEnded?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onError?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onFocus?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onFormData?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onGotPointerCapture?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onInput?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onInvalid?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onKeyDown?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onKeyPress?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onKeyUp?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onLoad?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onLoadedData?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onLoadedMetadata?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onLoadStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onLostPointerCapture?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onMouseDown?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onMouseEnter?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onMouseLeave?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onMouseMove?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onMouseOut?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onMouseOver?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onMouseUp?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPaste?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPause?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPlay?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPlaying?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerDown?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerEnter?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerLeave?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerMove?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerOut?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerOver?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onPointerUp?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onProgress?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onRateChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onReset?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onResize?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onScroll?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onSecurityPolicyViolation?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onSeeked?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onSeeking?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onSelect?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onSlotChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onStalled?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onSubmit?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onSuspend?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTimeUpdate?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onToggle?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTouchCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTouchEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTouchMove?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTouchStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTransitionCancel?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTransitionEnd?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTransitionRun?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onTransitionStart?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onVolumeChange?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onWaiting?: any;
  /**
   * Wallace runs the expression when the event fires.
   *
   * Use xargs to access the event or element:
   * ```
   * const MyComponent = (_, _event, _element) => (
   *    <button onClick={clickHandler(_event, _element)} />
   * );
   * ```
   */ onWheel?: any;
}

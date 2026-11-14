## INSTRUCTIONS FOR AGENTS

Wallace is a front-end framework which:

1. Uses JSX to define components.
2. Must be compiled using `babel-plugin-wallace`.
3. Has strong TypeScript support.

The key points to understand are that:

1. Wallace works _very_ differently to React, and is also used very differently, and that you should therefore not assume _any_ similarity whatsoever.
2. The Babel plugin _replaces_ component definition functions with completely different functions (not just the JSX expressions, but the entire function) which requires some wrangling to make TypeScript play nice, but can also throw users and agents who don't take this into account.

Read the hard rules and the React comparison below before writing any code.

## Hard rules

Most of these are enforced by the compiler, but some fail **silently**, so follow them all.

1. **A component is a function whose body is a single JSX expression.** No statements, no hooks, no early returns. Prefer arrow functions with parentheses: `() => (<div></div>)`. Regular functions also work, so long as the body is only `return <div></div>;`. `() => { <div></div> }` is invalid (it returns nothing), as is any code before the `return`.
2. **No JSX inside `{}` placeholders.** Never use `.map()` to create elements: use `<Item.repeat models={items} />`. Never use `&&` or a ternary to choose elements: use the `if` directive. Placeholders may contain any JavaScript that doesn't produce JSX, like `{items.map(i => i.name).join(", ")}`.
3. **Event handlers take the call, not a function.** The expression is copied into the listener. `onClick={hub.save()}` is correct. `onClick={() => hub.save()}` and `onClick={hub.save}` compile but **silently do nothing**. Use the `event` and `element` xargs to access the event or element: `onSubmit={hub.add(event)}`.
4. **Components receive one "model", not props.** Nest with `<Item model={x} />` and repeat with `<Item.repeat models={xs} />`. Nested components accept no regular attributes (`id`, `class`, etc.) and no children.
5. **No literal objects in placeholders**: `model={{a: 1}}` and `style={{color: 'red'}}` are compile errors. Use a variable, or `style:color={x}`.
6. **Nothing updates by itself.** The DOM only changes when `update()` (or `render()`) is called on a component or one of its ancestors, or when a `watch`ed model is modified. Calling `update()` on a component updates its whole subtree.
7. **Use xargs, not `this`.** The second parameter must be destructured and may only contain `hub`, `model`, `self`, `event`, `element` and `stub`: `(task, { hub, self }) => (...)`.
8. **The root element must be a normal element**, not a nested or repeated component, and may not have `if`. The `watch`, `assign` and `unique` directives may only go on the root element.
9. **Nested components accept `if` but not `show`/`hide`. Repeated components accept neither.** Wrap them in an element and put the directive on that.

## React → Wallace

| React                                            | Wallace                                                        |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `props`                                          | A single `model` (any value): `<Item model={x} />`             |
| `{items.map(i => <Item {...i} />)}`              | `<Item.repeat models={items} />`, or `key="id"` for keyed      |
| `{cond && <Foo />}`, `{cond ? <A /> : <B />}`    | `<Foo if={cond} />`, `<A if={cond} /><B if={!cond} />`         |
| `onClick={() => doThing(x)}`                     | `onClick={doThing(x)}`                                         |
| `onClick={e => doThing(e)}`                      | `(_, { event }) => ... onClick={doThing(event)}`               |
| `className="a"`                                  | `class="a"`                                                    |
| `className={cond ? 'a' : ''}`                    | `toggle:a={cond}`                                              |
| `style={{ color: c }}`                           | `style:color={c}`                                              |
| `value={v} onChange={e => setV(e.target.value)}` | `bind={model.v}`                                               |
| `useState`, `setState`                           | Plain data on the model, then call `update()` on the component |
| `useRef`                                         | `ref:name` then `component.ref.name`                           |
| `useEffect`, lifecycle hooks                     | Override `render` via `MyComponent.methods`                    |
| Context                                          | A controller passed down as the `hub` (see Patterns)           |
| `<>...</>` fragments                             | Not supported, use a single root element                       |
| `children` prop                                  | Not supported, use stubs (see `lib/types.d.ts`)                |
| `ReactDOM.createRoot(el).render(<App />)`        | `mount("elementId", App, model, hub)` (hub defaults to model)  |

## Complete example

A small but complete app using active models (see Patterns below). Use it as a reference for syntax.

```tsx
import { mount } from 'wallace';
import type { ComponentInstance, Takes } from 'wallace';

class Task {
  component: ComponentInstance;
  done = false;

  constructor(
    public id: number,
    public text: string,
    public list: TaskList
  ) {}

  toggle() {
    this.done = !this.done;
    this.component.update();
    this.list.updateSummary();
  }

  remove() {
    this.list.remove(this);
  }
}

class TaskList {
  component: ComponentInstance;
  tasks: Task[] = [];
  draft = '';
  nextId = 1;

  get remaining() {
    return this.tasks.filter((t) => !t.done).length;
  }

  add(event: Event) {
    event.preventDefault();
    if (!this.draft.trim()) return;
    this.tasks.push(new Task(this.nextId++, this.draft, this));
    this.draft = '';
    this.component.update();
  }

  remove(task: Task) {
    this.tasks = this.tasks.filter((t) => t !== task);
    this.component.update();
  }

  updateSummary() {
    this.component.part.summary.update();
  }
}

const TaskRow: Takes<Task> = (task) => (
  <li assign:component toggle:done={task.done}>
    <input
      type="checkbox"
      checked={task.done}
      onChange={task.toggle()}
    />
    <span>{task.text}</span>
    <button onClick={task.remove()}>x</button>
  </li>
);

const TaskApp: Takes<TaskList> = (list, { event }) => (
  <div assign:component>
    <form onSubmit={list.add(event)}>
      <input type="text" bind={list.draft} event:input />
      <button>Add</button>
    </form>
    <p if={list.tasks.length === 0}>Nothing to do.</p>
    <ul>
      <TaskRow.repeat models={list.tasks} key="id" />
    </ul>
    <p part:summary>{list.remaining} remaining</p>
  </div>
);

mount('main', TaskApp, new TaskList());
```

Notes:

- `assign:component` sets `model.component` to the component instance, so each model can update its own component.
- Each task holds a reference to its list because its own `toggle` method needs to update the summary. Components can reach the list through the hub without this (see Patterns).
- Toggling a task only updates that task's row and the summary (using `part:summary`), not the whole app.
- `bind={list.draft}` keeps the input and `list.draft` in sync, and `event:input` makes it update on every keystroke rather than on `change`.
- `key="id"` makes the repeater keep each component tied to the same item. Without a key, components are reused by position, which is faster, but can confuse focus, CSS transitions or any state held in the DOM.

## Referencing `lib/types.d.ts`

The file `lib/types.d.ts` (in an app that's `node_modules/wallace/lib/types.d.ts`) is your best guide to Wallace's API, as it:

1. Contains an abridged user guide in the overall module doc string.
2. Documents all the library functions and directives (special attributes used in JSX).
3. Has many examples and snippets that can be directly copied.

It is written so that users can get a decent level of documentation through tool tips directly in their IDEs.

However, the types defined there are convoluted and confusing because they bridge the gap between the source code as the user sees it and what it will be transformed into, so don't feel you have to understand them fully.

For example, TypeScript would normally complain that `Greeting.repeat` doesn't exist below, because it doesn't know these functions will be transformed into something completely different during compilation:

```tsx
const GreetingList = (users) => (
  <div>
    <Greeting.repeat models={users} />
  </div>
);
```

To satisfy TypeScript we use custom types which "lie" about the types, so that TypeScript:

1. Doesn't see it as an error.
2. Warns the user if they pass an incompatible type when nesting the `Greeting` component.

These types are `Takes<Model, Hub>` (both optional) and `Uses<{model, hub, methods, stub}>` (all optional):

```tsx
import type { Takes } from 'wallace';

interface User {
  name: string;
}

const Greeting: Takes<User> = ({ name }) => (
  <div>
    <h1>Hello {name}</h1>
  </div>
);

const GreetingList: Takes<User[]> = (users) => (
  <div>
    <Greeting.repeat models={users} />
  </div>
);
```

The type information carries through to the parameters, so there is no need to repeat it there. Use `Takes<null>` for a component which takes no model.

The custom type system cannot bridge the gap between code as-seen and as-would-be-transformed in all cases, but for regular use it works fine and can be relied on.

What you will not gather from `lib/types.d.ts` is:

1. How Wallace actually works.
2. What patterns to use when developing applications.
3. Which features should be favoured and which should be viewed as an alternative.

These points are covered below.

## How Wallace works

### Components

During compilation, the babel plugin replaces every function containing JSX with a call whose arguments are generated from the parsed function, which is completely removed:

```js
const Greeting = defineComponent(/*...*/);
```

The call returns a new function that is designed to be used as a constructor:

```js
const componentInstance = new Greeting();
```

Users don't normally do this. It happens inside `mount` and when components create nested components.

During creation, the component instance creates its initial DOM, and traverses it to obtain references to dynamic elements, which it then updates when you call its methods:

```js
componentInstance.render({ name: 'Alice' });
componentInstance.update();
componentInstance.el; // The div element it created.
```

At run time all that exists is a tree of component instances, each of which knows how to update its own DOM, and tracks its nested components to which it cascades calls to `render`. There is no special "root" or virtual DOM engine: each component is independent.

The point of this architecture is that any component definition can override its methods to work differently, so the user is never trapped by a framework engine they cannot control.

### Restrictions

The original function defined by the user will not exist at run time, so it never gets called. It is arguably not a real function: we just use function syntax to create a scope for the JSX expression.

During compilation, the JSX expression is stripped of its directives and placeholders, and what remains is used as an HTML string which components use to create their initial DOM, which they then update according to instructions extracted from directives and placeholders.

The JSX is therefore not "executed" at run time like it is in virtual DOM frameworks. It must be static in shape, which is why the hard rules above exist. For example, none of this is allowed:

```tsx
// ❌ INVALID
const Greeting = ({ name }) => {
  // Block body and code before JSX not allowed.
  const upper = name.toUpperCase();
  return (
    <div>
      <h1>Hello {upper}</h1>
      {/* JSX inside placeholders not allowed. */}
      {name.length === 0 && <span>No name</span>}
    </div>
  );
};
```

This is the valid equivalent:

```tsx
const Greeting = ({ name }) => (
  <div>
    <h1>Hello {name.toUpperCase()}</h1>
    <span if={name.length === 0}>No name</span>
  </div>
);
```

### Nesting

Wallace has special syntax for nesting and repeating:

```tsx
const TwoGreetings = (users) => (
  <div>
    <Greeting model={users[0]} />
    <Greeting model={users[1]} />
  </div>
);

const GreetingList = (users) => (
  <div>
    <Greeting.repeat models={users} />
  </div>
);
```

Wallace components do not receive "props" (individual properties), instead they receive a "model" which can be any value.

Nested components accept these attributes only: `model`, `hub`, `if`, `ref:x` and `part:x`. Repeated components accept: `models`, `hub`, `key` and `part:x`.

### Directives

Directives are attributes which are picked up during compilation. See `lib/types.d.ts` for the full list.

Some operate on the element itself, such as `html` which sets the `innerHTML` of the element during an update:

```tsx
<div html={getDivInnerHtml()}></div>
```

Some act on the component overall, such as `watch` which replaces the model with a proxy which updates the component when it changes:

```tsx
const Greeting = ({ name }) => (
  <div watch>
    <h1>Hello {name}</h1>
  </div>
);
```

Some accept or expect a qualifier (the part after `:`) which adds further instruction, such as `bind-as:range` which binds a value and sets the input type to `range`:

```tsx
<input bind-as:range={count} />
```

The above is the equivalent of:

```tsx
<input type="range" bind:valueAsNumber={count} />
```

Others complement other directives, such as `event` which changes the event which `bind` listens to (the default is `change`):

```tsx
<input bind-as:range={count} event:input />
```

Some control whether elements are shown:

- `if` removes the element (or nested component) from the DOM.
- `show` and `hide` set the element's `hidden` property.

In both cases the dynamic content inside is not updated while hidden.

```tsx
const Greeting = ({ name }) => (
  <div>
    <h1>Hello {name.toUpperCase()}</h1>
    <span if={name.length === 0}>No name</span>
  </div>
);
```

Components generally change their DOM structure using a combination of `if` and nesting.

### Rendering

The model passed to `render` (which is called by `mount` and when nesting) is stored on the component instance:

```tsx
import { mount } from 'wallace';

const Greeting = ({ name }) => (
  <div>
    <h1>Hello {name}</h1>
  </div>
);

const model = { name: 'Alice' };
const greeting = mount('main', Greeting, model);
greeting.model === model; // true
```

This means we can modify the model then call `update`, without passing it back in:

```js
greeting.model.name = 'Bob';
greeting.update(); // Updates the DOM
```

The `render` method sets the model and hub, then calls `update`. A component only calls `render` on nested components, never `update` directly.

## Patterns

Components take two inputs, and each has its own job:

- **model** is what the component shows. It differs for each instance, e.g. each repeated item.
- **hub** is the app the component lives in. It is shared, and passed down to nested components automatically. Put state and behaviour which isn't specific to one item on the hub.

Follow this rule unless there is a good reason not to. It avoids having to decide how to get the controller to each component, and works with models which are plain data, such as types shared with an API.

### Controller as hub (standard)

Create a controller class with the app's state and behaviour, and mount the root component with it. `mount` uses the model as the hub when you don't pass one, so the root receives the controller as its model, and every nested component receives it as its hub:

```tsx
import { mount } from 'wallace';
import type { ComponentInstance, Takes } from 'wallace';
import type { Ticket } from './schemas';

class Controller {
  component: ComponentInstance;
  tickets: Ticket[] = [];
  editing = false;
  close(ticket: Ticket) {
    ticket.closed = true;
    this.component.update();
  }
}

const TicketRow: Takes<Ticket, Controller> = (ticket, { hub }) => (
  <li>
    {ticket.title}
    <button if={hub.editing} onClick={hub.close(ticket)}>
      Close
    </button>
  </li>
);

const TicketList: Takes<Controller> = (ctrl) => (
  <ul assign:component>
    <TicketRow.repeat models={ctrl.tickets} />
  </ul>
);

mount('main', TicketList, new Controller());
```

Notes:

1. Don't pass `hub={ctrl}` to nested components, they get it automatically.
2. Components don't need models to hold a reference to the controller, as they have the hub. Only add one if the models' own methods need it.
3. If the root's model is something else, pass the hub explicitly: `mount('main', TicketList, tickets, new Controller())`.

### Active Models

Make a model active when an item needs behaviour of its own, or should update without updating its parent. This involves implementing setters or methods on models, and giving them a reference to the component instance they are attached to, which can be done using the `assign` directive:

```tsx
import type { ComponentInstance, Takes } from 'wallace';

class User {
  component: ComponentInstance;
  #name: string;
  constructor(name: string) {
    this.#name = name;
  }
  get name() {
    return this.#name;
  }
  set name(value: string) {
    this.#name = value;
    this.component.update();
  }
}

const Greeting: Takes<User, Controller> = ({ name }, { hub }) => (
  <div assign:component>
    <h1>Hello {name}</h1>
    <input bind={name} />
    <button onClick={hub.saveChanges()}>Save</button>
  </div>
);
```

This gives more granular control over updates, e.g. renaming a user only updates its own component. Active models work alongside a controller hub: components still receive the hub, so only give models a reference to the controller if the models themselves need it.

### Watch

A third approach is the `watch` directive, which makes a component "reactive", meaning it updates whenever its model is changed by itself or by any nested component.

It does this by creating a proxy of the model during `render` and storing that instead, which means it is not the same object:

```tsx
const Greeting = ({ name }) => (
  <div watch>
    <h1>Hello {name}</h1>
  </div>
);

const model = { name: 'Alice' };
const greeting = mount('main', Greeting, model);
greeting.model === model; // false
```

The proxy calls `update` on the component instance when it (or any nested object) is modified through the proxy:

```js
greeting.model.name = 'Bob'; // Updates the DOM & model
model.name === 'Bob'; // true
model.name = 'Joe'; // Doesn't update the DOM
greeting.model.name === 'Joe'; // true, as the proxy sees the change
```

The point is that it responds to data being modified by the UI:

```tsx
const Greeting = ({ name }) => (
  <div>
    <h1>Hello {name}</h1>
    <input bind={name} />
  </div>
);

const GreetingList = (users) => (
  <div watch>
    <Greeting.repeat models={users} />
  </div>
);
```

Notes on the above snippet:

1. The models which `Greeting` receives are also proxies, which trigger `update` on `GreetingList`.
2. The `{ name }` in the parameters will appear as `this.model.name` in the compiled code, so it's perfectly fine to assign to `name`, which the `bind` directive does.

You can pass a callback to the `watch` directive, or use the `watch` helper function (which is what the directive does internally) to control what happens when the model is modified, such as:

- Persist changes when data changes.
- Perform a more selective or granular update.
- Store state for undo/redo.

Note that a callback _replaces_ the default behaviour, so call `self.update()` in it if you still want the component to update.

This approach is most useful for cases where you just want to update the UI, such as validation, table sorting and filtering etc. But for prototyping or apps under a certain size, you can make the whole application reactive by placing a `watch` high up in the component tree.

These patterns can be combined: a controller hub for the app, active models for items which need their own behaviour, and `watch` for UI-only updates.

Wallace is designed to:

1. Produce very small bundles.
2. Encourage clean code.
3. Avoid confusing the user.
4. Provide simple high-level syntax and patterns, but with the option of dropping progressively lower if they need more control.

Bear these points in mind when making decisions.

## Checking

To check how something truly works, you can run the file through babel (provided `babel.config.cjs` is set up correctly) and inspect the output:

```
npx babel src/index.tsx
```

This shows the generated JavaScript, which can be cross-referenced against whatever it imports from the wallace library (which is very simple), so that you can understand the application logic in terms of plain JavaScript without the framework.

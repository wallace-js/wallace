# Wallace

_The tiny framework that brings you FREEEDOM!!!_

[![nmp](https://img.shields.io/badge/npm-wallace-blue)](https://npmjs.com/package/wallace) [![npm](https://img.shields.io/npm/v/wallace.svg)](https://npmjs.com/package/wallace) [![npm](https://img.shields.io/npm/dt/wallace.svg)](https://npmjs.com/package/wallace)
![workflow](https://github.com/wallace-js/wallace/actions/workflows/node.js.yml/badge.svg) [![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)

## About

Wallace is a front end JavaScript framework for building:

- Web apps of any size.
- Mobile apps - using tools likes [Capacitator](https://capacitorjs.com/).
- Desktop apps - using tools like [Tauri](https://v2.tauri.app/).

What sets Wallace apart from the likes of [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/), [Solid](https://www.solidjs.com/) are its:

1. **Performance**
2. **Productivity**
3. **Freedom**

### 1. Performance

Wallace is perhaps the smallest (and hence fastest loading) framework out there. Here are the bundle sizes of some implementations of the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) app:

![Bar chart of bundle sizes](./assets/size-compressed.jpg)

This makes Wallace ideal for:

- Landing pages that need to load fast.
- Situations where processing power or connectivity are limited.
- Apps where users switch pages frequently (Service worker + small bundles works better than a SPA).

And its DOM operations are pretty fast too. Here is the time\* in milliseconds to create 1000 rows on the benchmark app:

![Bar chart of times to create 1000 rows](./assets/run1k.jpg)

But you rarely need _fast_. You just need to avoid _slow_ - which creeps in on more complex scenarios than a benchmark can replicate. And the only _real_ protection against that is **freedom**.

_\* Times are taken from local runs, using non-keyed implementations where available. Will submit for an official run soon. Bundle sizes would be identical._

### 2. Productivity

Wallace helps you develop faster by being:

#### Sensible

- No weird syntax, just plain JavaScript + JSX.
- No awkward patterns like React hooks 🤢
- No confusing magic - everything from reactivity to DOM updates is easy to *follow* and easy to *control*.

#### Powerful

- Use controllers to separate display from logic and keep code clean as your app grows.
- Extend and reuse components using the stubs system.

Here are stubs in action:

```jsx
import { extendComponent } from "wallace";

const BaseDialog = ({ title }, { ctrl }) => (
  <div>
    <button onClick={ctrl.closeDialog()}>X</button>
    <h3>{title}</h3>
    <stub:content />
    <stub:buttons />
  </div>
);

BaseDialog.stubs.buttons = (_, { ctrl }) => (
  <div>
    <button onClick={ctrl.confirmDialog()}>OK</button>
    <button onClick={ctrl.closeDialog()}>Cancel</button>
  </div>
)

const MyDialog = extendComponent(BaseDialog);
MyDialog.stubs.content = ({ text }) => <div>Very cool {text}</div>;
```

> `MyDialog` implements its own `content` but uses the default `buttons`. `ctrl` is just an object of your making which gets passed down the tree of components.

#### Helpful

- Deep TypeScript support.
- Tool tips everywhere (works in every modern IDE - no plugin required).

There's even a full cheat sheet on the module tool tip:

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

So you hardly ever need to leave your IDE - just hover, read and keep coding!

All this makes Wallace ideal for:

- Learning and teaching.
- People who don't touch the (front end) code very often.
- People who'd rather develop features than learn a new framework.

### 3. Freedom

Most frameworks severely restrict your freedom (e.g. once React controls a tree of DOM, you can only update it through React) which creates two problems:

1. You have to accept unnecessary churn (React renders entire trees to update a single DOM element, reactive frameworks fire twice the updates you actually need etc...)
2. If the framework performs poorly, or prevents you from pulling off a useful trick (like reparenting) there might be nothing you can do about it, other than sink ever more time confirming this is the case.

Wallace uses a very sophisticated compiler to create very simple run time objects whose operations you can fully customise and interact with. All run time behaviour can be overridden, which possibly makes Wallace the only fully open framework that doesn't restrict your freedom.

This freedom lets you:

- Be more specific about which components update.
- Update select elements/attributes inside components.
- Change how any given component behaves (DOM updates or otherwise).

This lets you cleanly achieve maximum DOM performance, and many other things. But most importantly it protects you from performance bottlenecks, and the time you'd waste trying to fix them in a more restrictive framework.

#### It's all in the name

Wallace is named after [William Wallace](https://en.wikipedia.org/wiki/William_Wallace) - or rather his fictional portrayal in the film [Braveheart](https://www.imdb.com/title/tt0112573/), who made it impossible to mention freedom of any kind in Scotland without the risk of someone reenacting this scene:

![Mel Gibson shouting FREEDOM in Braveheart](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

## Tour

This tour covers all of Wallace's features in enough detail for you to go forth and build awesome apps. You can code along:

- In your browser using StackBlitz (choose [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx))
- Locally with `npx create-wallace-app`

There are also [examples](https://github.com/wallace-js/wallace/tree/master/examples) which all have a [StackBlitz](https://stackblitz.com) link in their README so you can edit it online, then download it as a fully working project.

### Compilation

Wallace uses its own Babel plugin to replace functions that hold JSX, like this:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

With constructor functions that allow us to create objects like this:

```tsx
const component = new Counter();
```

These objects (called components) control their own DOM, which can be updated like this:

```tsx
component.render({ count: 1 });
```

However you don't normally create components yourself. Instead you use `mount` which:

1. Creates the root component (which creates its initial DOM).
2. Calls its `render` method, during which it:
   1. Updates its DOM.
   2. Creates nested components and calls their `render` method.

3. Replaces the specified element with the component's DOM.
4. Returns the component.

For example:

```tsx
import { mount } from "wallace";

const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);

const CounterList = counters => (
  <div>
    <Counter.repeat items={counters} />
  </div>
);

const component = mount("main", Counter, [
  { count: 0 },
  { count: 0 }
]);
```

> You can specify an actual element instead of an id string if you prefer.

##### Important

Key points to understand:

1. There is no central engine coordinating things.
2. Components control their own DOM and manage their directly nested components.
3. `mount` does nothing special and the root component works just like other components.

This makes things very easy to *follow* and very easy to *control* - both core principles of Wallace. On that note: clicking the buttons doesn't do anything yet, because Wallace is deliberately not reactive until you tell it to be.

### JSX

Instead of placing logic _around_ elements, you control it from _within_ elements using directives (attributes with special behaviour) like `if` which conditionally excludes an element from the DOM:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button if={count > 2} onClick={(count = 0)}>
      X
    </button>
  </div>
);
```

And special syntax for nesting and repeating:

```tsx
const CounterList = counters => (
  <div>
    <Counter.nest props={counters[0]} />
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```

But you don't need to remember all this. JSX elements have a tool tip which reminds you and lists the available directives, which have their own tool tips detailing their usage:

![Tool tip on JSX element](./assets/div-tooltip.jpg)

This form of JSX has several advantages over JSX mixed with JavaScript:

- It is much clearer and easier to read.
- It preserves natural indentation.
- It is far more compact (~40% the lines of React equivalent).

##### Important

The JSX and its containing function never *runs*. It is only *read* during compilation, and reassembled as something else. There is no virtual DOM at play.

The functions are just placeholders for a single JSX expression, which is all that's allowed in the function body. The only JavaScript allowed anywhere inside these functions is inside JSX `{placeholders}`. 

These snippets are copied during compilation, with some modification of props access. So the button click event handler ends up looking like this:

```tsx
function (event) {
  this.props.count++;
}
```

The JSX mostly ends up as an HTML string with dynamic bits stripped out:

```tsx
html = "<div><button></button><button>X</button></div>";
```

### TypeScript

TypeScript support comes mostly from the `Uses` type, which defines a component's props (and other things as we'll see later). You're best using an interface for clarity and reuse:

```tsx
import { mount, Uses } from "wallace";

interface iCounter {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button if={count > 2} onClick={(count = 0)}>
      X
    </button>
  </div>
);

const CounterList: Uses<iCounter[]> = counters => (
  <div>
    <Counter.nest props={counters[0]} />
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);

const component = mount("main", CounterList, [
  { count: 0 },
  { count: 0 }
]);
component.render([{ count: 0 }, { count: 1 }]);
```

TypeScript now warns you if you attempt to pass incorrect props at any point.

##### Important

Don't annotate the props like this:

```tsx
const Counter = (props: iCounter) => (
  <div>
    <button onClick={props.count++}>{props.count}</button>
  </div>
);
```

As that only works within that function, not when nesting or mounting the component elsewhere.

### Rendering

For present purposes, the `render` method we've been calling does this:

```tsx
function render(props) {
  this.props = props;
  this.update();
}
```

This tells us we can do things like this:

```jsx
const component = mount("main", Counter, { count: 0 });
component.props.count = 1;
component.update();
```

React devs may have a seizure upon seeing this, but what React overlooks is that there are really two types of component:

1. **Dumb** components (like `Counter`) which only render data and fire events. In Wallace you only call `render` on these, which overwrites the props each time, so they work exactly as if they were stateless.
2. **Coordinating** components (like `CounterList`) from which you detect changes to data or state and trigger update, which is where the complexity lives and where mistakes happen.

It is these coordinating components that React struggles with, having to come up with awkward patterns like "hooks" which require hidden magic which 90% of devs don't fully understand, which adds confusion and weird restrictions, which wastes time and increases mistakes.

With Wallace you just override the `render` method of a coordinating component, and use `update` from then on:

```tsx
CounterList.methods = {
  render(counters) {
    const update = () => this.update();
    this.props = counters.map(c => ({ ...c, update }));
    this.update();
  }
};
```

> `methods` lets you set fields on `prototype` with less typing and less risk of accidentally deleting other fields.

Nested components can use this callback to update the `CounterList` without calling its `render` method, which in this case works as the `Counter` also modifies the data in place:

```tsx
const Counter: Uses<iCounter> = ({ count, update }) => (
  <div>
    <button onClick={(count++, update())}>{count}</button>
  </div>
);
```

> Clicking on buttons now updates the display, but we can't really call it "reactive" yet.

Of course this is a really ugly React-like way of doing things, and we'll look at nicer ways shortly. The point is to understand the relationship between `render`, `update` and `props` before continuing.

If you're worried about accidentally modifying data that shouldn't be modified, you can make it immutable like this:

```tsx
import { protect } from "wallace";

CounterList.methods = {
  render(counters) {
    this.props = protect(counters);
    this.update();
  }
};
```

> Clicking on buttons now throws an error.

##### Important

Wallace only calls `update` from inside the `render` method as shown. At all other times (mounting, nesting components, and updating nested components) it calls `render`. So essentially:

- `render` is called from *above*, passing props.
- `update` is called *internally* without props, as they are already set.

But your code can call `update` from anywhere you like, which bypasses `render`, which makes that a good place to set things up for the life cycle of a coordinating component.

It doesn't look like much, but this little arrangement goes a long way towards keeping your code easy to *follow* and easy to *control*, which lets you develop faster, with fewer mistakes.

### Updates

Most frameworks keep their DOM operations hidden, probably for the best. Wallace does too, but it's actually so simple that you can follow exactly what's happening.



Upon creation, a component creates its initial DOM, stores references to all the dynamic elements, and matches them to two callbacks:

1. A _query_ to read a value, like `() => props.count`
2. An _action_ to apply the change, like `(el, newValue) => el.textContent = newValue`

During `update`, the component:

- Iterates through all the dynamic elements, and:
  - Unless cancelled out by a visibility toggle (`show`, `hide` `if`) it:
    - Calls the *query*, and,
    - If the value differs from value from last update:
      - Applies the *action* and stores the value for next update.

That's it. So if we take the following component:

```tsx
const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <div class="button-container">
      <button onClick={count++}>{count}</button>
    </div>
    <button if={count > 2} onClick={(count = 0)}>
      <span style:color={count > 3 ? "red" : "black"}>
        X
      </span>
    </button>
  </div>
);

const component = mount("main", Counter, {count: 3});
component.render({count: 1});
component.render({count: 2});
```

Here is what will happen:

1. First render:
   1. Set the first button's `textContent` to "3".
   2. Set the 2nd button's color to "red".
2. Second render:
   1. Set the first button's `textContent` to "1".
   2. Detach the 2nd button
   3. Skip setting color as the parent is detached.
3. Third render:
   1. Set the first button's `textContent` to "2".
   2. Reattach the 2nd button
   3. Skip setting the 2nd button's color, as the query `count > 3 ? "red" : "black"` returns.







The action is either:

- An element manipulation.
- An instruction to render a nested component.
- An instruction to a repeater to patch the `childNodes` of its parent div.

It's dead simple, extremely fast, and resilient: if you rearrange these elements, the component will still update them.

You can use references yourself too, which is useful in certain scenarios:

```tsx
const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <button ref:btn onClick={count++}>
      {count}
    </button>
  </div>
);

Counter.methods = {
  update() {
    this.refs.btn.style.color =
      this.props.count > 2 ? "red" : "black";
    this.base.update.call(this);
  }
};
```

Here we "manually" set the style, and "Wallace" sets the text of the same element, without affecting the style, because it works exactly the same way: a single operation on an element accessed by (internal) reference.

Some of the few cases where you'd actually do this include:

- The logic would make a mess of the JSX.
- Libraries like [chart.js](https://www.chartjs.org/) which require the element to be attached to the DOM (which it won't be in first render) so you could use a timeout or callback.

In this case it's definitely neater doing it in the JSX using the `style` directive:

```tsx
<button style:color={count > 2 ? "red" : "black"} onClick={count++}>
  {count}
</button>
```

##### Important

If you're going to manually update the DOM, do it inside `update` not `render`, and remember that:

1. The component will likely be reused with different props later.
2. The DOM remembers its state, so avoid conditionally setting elements.

### Reactivity

To make things more interesting let's display a total of all the counters:

```tsx
const CounterList: Uses<iCounter[]> = counters => (
  <div>
    <span>Total: {counters.reduce((t, c) => t + c.count, 0)}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```

To make it all reactive we're going to use `watch` which returns a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the provided object (arrays are objects too) which fires a callback whenever it, or any nested object, is modified:

```tsx
import { watch } from "wallace";

CounterList.methods = {
  render(props) {
    this.props = watch(props, () => this.update());
    this.update();
  }
};
```

> Clicking on a button now updates its count and the total.

Reactivity often involves inputs, which we can `bind` to a value, which will be set when the input's `change` event is fired, but we can specify a different event with a "qualifier" like `bind:keyup`.

Let's show this by naming the things we're counting:

```tsx
const CounterList = ({ counters, things }) => (
  <div>
    <span>
      Total {things}: {counters.reduce((t, c) => t + c.count, 0)}
    </span>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <input type="text" bind:keyup={things} />
  </div>
);

CounterList.methods = {
  render(counters) {
    this.props = watch({ counters, things: "sheep" }, () =>
      this.update()
    );
    this.update();
  }
};
```

> The UI displays `Total sheep: 0` but changes as you type in the input.





One issue with this is that you're updating the `Counter.repeat` at every keyup event. Although there is no DOM change, it's still unnecessary churn.

Wallace makes it very easy to target updates



```tsx
import { watch } from "wallace";

const CounterList = ({ counters, total, things }) => (
  <div>
    <span ref:things></span><span>{total}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <input type="text" bind:keyup={things.value} />
  </div>
);

CounterList.methods = {
  render(counters) {
    this.props = {
      total: 0,
      counters: watch(counters, () => this.update()),
      things: watch({ value: "sheep" }, () => this.updateThings())
    };
    this.update();
  },
  updateThings() {
    const { refs, props } = this;
    refs.things.textContent = `Total ${props.things.value}: `;
  },
  update() {
    const { base, props } = this;
    props.total = props.counters.reduce((t, c) => t + c.count, 0)
    base.update.call(this);
    this.updateThings();
  }
};
```





---



Note that you don't have to watch the entire props object, you can watch different parts and protect others:

```tsx
import { protect, watch } from "wallace";

// Must change JSX to <input type="text" bind:keyup={state.things} />

CounterList.methods = {
  render(counters) {
    this.props = {
      counters: protect(counters),
      state: watch({ things: "sheep" }, () => this.update())
    };
    this.update();
  }
};
```

> Clicking on buttons now throws an error, as they modify the protected object.

##### Important

Reactive behaviour (especially with two-way binding) yields a whole new category of bugs and confusion. Frameworks which hide the mechanism (or worse, bake it into the framework) might look impressive, but that _always_ comes back to bite you.

Wallace forces you to supply the callback which feels like an extra step, but has two advantages:

- You can clearly see why and when your component updates, and you know that the "watching" part has nothing to do with components, compilation or the "framework" as such. This will save you a lot of headaches.
- It is very easy to make the callback do something else, whether that's debugging, accessing services or updating a distant component.

### Controllers

We lied about the `render` function earlier. It actually looks like this:

```tsx
Component.prototype.render = function (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
};
```

The `ctrl` argument comes either from a 4th argument to `mount` or in nested components, from the parent component's `ctrl` field. So the value essentially propagates to all nested components during render.

Let's set `ctrl` to an object with a function which set all counters to the same value:

```tsx
CounterList.prototype.render = function (counters) {
  this.props = watch(counters, () => this.update());
  this.ctrl = {
    setAllCountersTo: (count) => {
      counters.forEach(c => (c.count = count));
      this.update();
    };
  };
  this.update();
}
```

Each nested `Counter` component's `ctrl` will point to that same object, and can access it through the second argument to component function, called "xargs" which provides a few useful variables:

```tsx
const Counter: Uses<iCounter> = ({ count }, { ctrl }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button onClick={ctrl.setAllCountersTo(count)}>...</button>
  </div>
);
```

> Clicking the button with "..." updates all other counters to the value of this counter.

This is a lot cleaner than shoehorning a function or hook into the props which requires:

- Making a mess of the `iCounter` interface.
- Running a `map` over the counters.

Use props for data, and the controller for everything else. In fact you are encouraged to move everything (logic, calculations, formatting etc) into the controller. At this point it's easier turning the controller into a class:

```tsx
import { ComponentInstance, watch } from "wallace";

interface iCounterList {
  counters: iCounter[];
  total: number;
}

class Controller {
  root: ComponentInstance<iCounterList>;
  counters: iCounter[];
  constructor(
    root: ComponentInstance<iCounterList>,
    counters: iCounter[]
  ) {
    this.root = root;
    this.counters = watch(counters, () => this.update());
  }
  update() {
    const { root, counters } = this;
    root.props = {
      counters,
      total: counters.reduce((t, c) => t + c.count, 0)
    };
    root.update();
  }
  setAllCountersTo(count) {
    this.counters.forEach(c => (c.count = count));
  }
}
```

> Using `Component<iCounterList>` gives us type support when setting `root.props`.

So all you need to do in the component is this:

```tsx
CounterList.prototype.render = function (counters) {
  this.ctrl = new Controller(this, counters);
  this.ctrl.update();
};
```

Notice how the controller now creates the props for the component, which makes the component neater:

```tsx
const CounterList: Uses<iCounterList> = ({ counters, total }) => (
  <div>
    <span>Total: {total}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```

Another advantage of a class is that it defines its own type, which you can pass into the 2nd slot in `Uses` which then adds type support for `ctrl`:

```tsx
const Counter: Uses<iCounter, Controller> = ({ count }, { ctrl }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button onClick={ctrl.setAllCountersTo(count)}>...</button>
  </div>
);
```

##### Important

The whole point of controllers is to move all your logic out of components (which are framework constructs) into classes (which are normal JavaScript - nothing to do with the framework) because:

1. Your components end up so dumb and simple that they're hard to break, easy to test and unlikely to hide bugs.
2. All your logic sits in plain JavaScript classes that are nothing to do with the framework, meaning:
   1. You won't suspect framework interference when things go wrong (no matter how mechanical the framework, your mind still thinks there's magic, and it readily suspects it).
   2. You have total freedom in how you compose, extend, inject and organise your controllers, so you get less duplication, which means fewer bugs and lighter bundles.

### Methods

Some things do belong on the component, not the controller, such as DOM related stuff. Let's revisit our example with the text input, and change it to only update `things` when we hit enter:

```tsx
const CounterList: Uses<iCounterList> = (
  { counters, things },
  { self, event }
) => (
  <div>
    <span>
      Total {things}: {counters.reduce((t, c) => t + c.count, 0)}
    </span>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <input
      type="text"
      bind={self.tmpThings}
      onKeyUp={self.thingsKeyUp(event as KeyboardEvent)}
    />
  </div>
);

CounterList.methods = {
  render(counters) {
    this.tmpThings = "";
    this.props = watch({ counters, things: "sheep" }, () =>
      this.update()
    );
    this.update();
  },
  thingsKeyUp(event: KeyboardEvent) {
    if (event.key !== "Enter") return;
    const newthings = this.tmpThings;
    this.tmpThings = "";
    this.props.things = newthings;
  }
};
```

There's a lot of new bits:

1. We access two new variables in xargs:
   1. `self` which is the component instance (we can't use `this` in arrow functions).
   2. `event` which refers to the DOM event and can only be used in event callbacks. You use the same variable in each callback
   3. like `element` adapts to mean the event in that callback, so you could use them in multiple places and they would point to different things. Remember this isn't a real function with real arguments.
2. We put `tmpThings` on the component instead of the props, because we don't want to update the component every time it changes. It is reset during render so it's pretty safe.

Getting type support for methods is a bit more long-winded than for controllers. You need to create an interface listing your additional methods, then pass that into the 3rd slot for `Uses` :

```tsx
interface CounterListMethods {
  componentMethod(): string;
}

class Controller {
  ctrlMethod(): string;
}

const CounterList: Uses<iCounterList, Controller, CounterListMethods> (
  _, { self, ctrl }
) => (
  <div>{self.componentMethod() + ctrl.ctrlMethod()} </div>
);
```

If you are not using props or a controller, then the corresponding slot should be set to `null`:

```tsx
Uses<iCounterList, null, CounterListMethods>;
```

##### Important

You might be tempted to omit `bind` and `tmpThings` and just read the value from the element:

```tsx
thingsKeyUp(event) {
  if (event.key !== 'Enter') return;
  this.props.things = event.target.value;
  event.target.value = '';
}
```

Which works, but you run into problems if you re-use or re-render the component before hitting enter, as the value remains attached to the element. So it's best to always `bind` an input to a value which gets reset on render.

### Extending

You can extend a component definition, which creates a new component definition that inherits the base component's methods, which you can redefine or add to:

```tsx
import { extendComponent } from "wallace";

const SpecialCounterList = extendComponent(CounterList);

SpecialCounterList.methods = {
  thingsKeyUp(event) {
    if (event.key !== "Enter" || !this.isThingsValid()) return;
    const newthings = this.tmpThings;
    this.tmpThings = "";
    this.props.things = newthings;
  },
  isThingsValid() {
    return this.tmpThings.length > 2;
  }
};
```

> This inherits the `render` method as `CounterList`.

You can also specify a new DOM structure, perhaps to display the highest counter instead of the total:

```tsx
const HighestCounterList = extendComponent(
  CounterList,
  ({ counters }) => (
    <div>
      <span>Highest: {Math.max(...counters.map(c => c.count))}</span>
      <div>
        <Counter.repeat items={counters} />
      </div>
    </div>
  )
);
```

By default the new component definition will use the same props, controller and method types as the base, but you can specify new ones:

```tsx
const MyComponent = extendComponent<Props, Controller, Methods>(Base);
```

TypeScript will only let you specify types which are compatible with (or extend) the corresponding type for its base.

##### Important

The Babel plugin modifies the `extendComponent` call if you specify the 2nd argument, so you must put the JSX directly in the 2nd argument:

```jsx
extendComponent(CounterList, () => <div></div>);
```

And not elsewhere like so:

```jsx
// WRONG
const Foo = () => <div></div>;
extendComponent(CounterList, Foo);
```

### Stubs

Stubs let you implement parts of the DOM in derived components, or vice versa:

```tsx
const CounterList: Uses<iCounterList> = ({ counters }) => (
  <div>
    <stub:stats />
    <stub:counters />
  </div>
);

CounterList.stubs = {
  stats: ({ counters }) => (
    <span>Total: {counters.reduce((t, c) => t + c.count, 0)}</span>
  ),
  counters: ({ counters }) => (
    <div>
      <Counter.repeat items={counters} />
    </div>
  )
);

const HighestCounterList = extendComponent(CounterList);

HighestCounterList.stubs.stats = ({ counters }) => (
  <span>Highest: {Math.max(...counters.map(c => c.count))}</span>
);
```

Component definitions inherit stubs much like prototype methods, and can override them, so `HighestCounterList` gets the same `counters` stub, but overrides the `stats` stub.

A base component does not have to implement all the stubs it references, though this makes it an abstract component definition.

A base component may also implement stubs it doesn't reference, and leave it to specific implementations to decide which it uses and where:

```tsx
const BaseCounterList = () => <div>OVERRIDE ME</div>;

BaseCounterList.stubs = {
  highest: ({ counters, highest }) => <span>Highest: {highest}</span>,
  total: ({ counters, total }) => <span>Total: {total}</span>,
  counters: ({ counters }) => (
    <div>
      <Counter.repeat items={counters} />
    </div>
  )
};

const HighestCounterList = extendComponent(BaseCounterList, () => (
  <div>
    <stub:counters />
    <hr />
    <stub:highest />
  </div>
));
```

> So long as the final component definition has an implementation (its own or inherited) for each stub it references, it will work.

Stubs are a flexible way to organise reusable component skeletons or parts, which again, helps reduce duplication, errors and bundle size.

##### Important

A stub receives the same props as its enclosing component.

### Performance

Another advantage of components being objects is that you can store references to them, so you can run more targeted updates, which is usually the first step in performance tuning.

Say you had a large table displaying servers with dozens of rows dozens of a dozen columns, one of which shows the number of connected users, which updates every second. You don't want to update the whole table every second, even though there's minimal DOM change, there's still a fair bit of operations involved.

Ideally we'd update just the cells which need to, which is easily done by keeping a register of those components on the controller:

```tsx
class DataGridCtrl {
  update() {
    this.register = []; // reset register at every full table update.
    this.root.update();
  }
  updateConnectedUsersCells(freshStats) {
    const serverIds = freshStats.map(stat => stat.serverId);
    this.register.forEach(cell => {
      const props = cell.props;
      if (freshStats.hasOwnProperty(props.serverId)) {
        cell.props.connectedUsers = freshStats[props.serverId];
        cell.update();
      }
    });
  }
}

const ServerTable = ( rows ) => (
  <table>
    <tbody>
      <ServerTableRow.repeat items={rows} />
    </tbody>
  </table>
);

const ServerTableRow = ( serverDetails ) => (
  <tr>
    {# ... #}
    <ConnectedUsersCell.nest props={serverDetails} />
    {# ... #}
  </tr>
);

const ConnectedUsersCell = ({ connectedUsers, serverId }) => (
  <td>
    <span>{connectedUsers}</span>
    <button onClick={showUserStatsDetail(serverId)}>...</button>
  </td>
);

ConnectedUsersCell.methods = {
  render(props, ctrl) {
    ctrl.register.push(this);
    this.base.render.call(this, props, ctrl);
  }
};
```

You can also go a step further and target specific elements inside the components using refs:

```tsx
const ConnectedUsersCell = ({ connectedUsers, serverId }) => (
  <div>
    <span ref:userData></span>
    <button onClick={showUserStatsDetail(serverId)}>...</button>
  </div>
);

ConnectedUsersCell.methods = {
  render(props, ctrl) {
    ctrl.register.push(this);
    this.base.render.call(this, props, ctrl);
  },
  update() {
    this.updateConnectedUsers();
    this.base.update.call(this);
  },
  updateConnectedUsers() {
    this.refs.userData.textContent = this.props.connectedUsers;
  }
};
```

A ref points to the actual DOM element, so changing it updates the DOM directly.

References are essentially how components update their own DOM normally. So with a simple component like this, you could even override `update` method:

```tsx
ConnectedUsersCell.methods = {
  update() {
    this.refs.userData.textContent = this.props.connectedUsers;
  }
};
```

And the component would work exactly as it did before, except it no longer checks whether `connectedUsers` has changed since last update before updating the element. It would also break if you added visibility or nested components.

##### Important

You need to remember that components may be be:

1. Re-rendered - so you must ensure your targeted change would be preserved.
2. Recycled - so you must ensure that renders clear any targeted changes.

The simplest way to avoid problems is by:

1. Doing everything via props (so functions like `updateConnectedUsers` should not accept data).
2.

If you're doing this kind of thing, you presumably have good reason to.

You need to be careful not to leave the component or its DOM in a state

## Status

Wallace is still in early development, and hasn't been very widely used, however:

1. There's not much framework at run time, and what little there is very simple, mechanical and close to the DOM.
2. You can override any behaviour.

These two points mean that you can very easily work around any situation where Wallace is either unable to do something you want, or has an error that hasn't yet been fixed.

You can help make Wallace battle-ready by:

1. Using it ✔️
2. Filing bugs 🐞
3. Giving it a ★\*

_\* Every ★ brings us closer to a world no longer dominated by 2 frameworks from corporations that steal our focus and sell our data. Go star [Svelte](https://svelte.dev/) and [Solid](https://www.solidjs.com/) while you're at it._

## Issues

Please open a ticket for any issue, including usage questions, as everything should be documented in tool tips and I'd want to know if its not.

## License

MIT.

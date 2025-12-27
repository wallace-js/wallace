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

![Bar chart of bundle sizes](./assets/size-compressed.png)

This makes Wallace ideal for:

- Pages that need to load fast.
- Situations where processing power or connectivity are limited.
- Apps where users switch pages frequently (less need for SPA).

And its DOM operations are pretty fast too. Here is the time\* in milliseconds to create 1000 rows on the same [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) app:

![Bar chart of times to create 1000 rows](./assets/run1k.png)

But you rarely need _fast_. You just need to avoid _slow_ - which creeps in on more complex scenarios than what benchmarks can reasonably cover. And the only _real_ protection against that is **freedom**.

_\* Times are taken from local runs, using non-keyed implementations where available. Will submit for an official run soon. Bundle sizes would be identical._

### 2. Productivity

Wallace helps you develop faster by being:

#### Sensible

- No weird syntax, just plain JavaScript + JSX.
- No awkward patterns like signals, hooks, context providers etc...
- No confusing magic - everything from reactivity to DOM updates are easy to *follow* and easy to *control*.

#### Powerful

- Use controllers to keep your code simple and clean as your app grows.
- Easily run targeted updates for a smoother UI.
- Extend and override parts of components using the stubs system.

#### Helpful

- Deep TypeScript support.
- Compile time error-detection system.
- Tool tips everywhere (works in every modern IDE - no plugin required).

There's even a full cheat sheet on the module tool tip so you need never need to leave your IDE:

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

All this makes Wallace ideal for:

- Learning and teaching.
- People who don't touch the (front end) code very often.
- People who'd rather develop apps than learn a new framework.

### 3. Freedom

Most frameworks are completely closed: they work the way they work and that's that, with the only backdoor being direct DOM manipulation. This situation creates a major risk:

> If the framework performs poorly on a particular view, or prevents you from doing something really useful (like reparenting) you might be totally stuffed.

Of course you'll come up with some solution or other, but you pay for it in time (sometimes an awful lot of it) and code quality, which you then pay for again later on.

Wallace doesn't have this problem for two reasons:

1. You can override all run time behaviour at a granular level (making Wallace possibly the only fully open framework of its kind).
2. It updates DOM elements directly.

So you effectively have total freedom to make components and the DOM do whatever you like, which can get you out of a tight spot, or help you achieve the same performance as vanilla, minus the mess.

Having said that, most of the things you'd probably do with that unlimited freedom are already easy and catered for, such as:

- Only updating a subset of deeply nested components.
- Only updating certain sections within components.
- Changing how a component updates its entire DOM, or part of it.

And if you do need the backdoor, Wallace's is as clean as it gets:

```tsx
<canvas apply={doStuff(element, props)} ></canvas>
```

#### It's all in the name

Wallace is named after [William Wallace](https://en.wikipedia.org/wiki/William_Wallace) - or rather his fictional portrayal in the film [Braveheart](https://www.imdb.com/title/tt0112573/), who made it impossible for people in Scotland to talk at any length about "freedom" without someone reenacting this scene:

![Mel Gibson shouting FREEDOM in Braveheart](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

## Tour

This tour covers Wallace in enough detail for you to go forth and build awesome apps. You can code along:

- In your browser using StackBlitz (choose [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx))
- Locally with `npx create-wallace-app`

There are also [examples](https://github.com/wallace-js/wallace/tree/master/examples) which all have a [StackBlitz](https://stackblitz.com) link in their README so you can play around online, then download a fully working project.

### Components

Wallace controls the DOM with components, which you define as functions that return JSX:

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

const root = mount("main", CounterList, [{ count: 0 }, { count: 0 }]);
```

> The UI now displays two buttons with 0, which don't do anything yet.

You might think these functions get called and return virtual DOM like React, but that's not the case. Wallace uses its own Babel plugin to *replace* them with very different functions that are used to create objects:

```tsx
const component = new Counter();
```

These objects (called component *instances* or just *components*) have methods, like `render` which updates its DOM instantly:

```tsx
component.render({ count: 99 });
console.log(component.el); // <div><button>99</button></div>
```

You don't normally create components yourself, instead you use `mount` which:

1. Creates a component of the specified type.
2. Calls its `render` method.
3. Replaces the specified element (or element with specified id string) with `el` .
4. Returns the component instance.

The `render` method updates that component's DOM and mounts and render any nested components. So each component manages its own DOM and own nested components, there is no extra hidden engine coordinating them.

Even the root component doesn't know its the root, and behave exactly like other components. We have a reference to it, so we can use that to update the DOM:

```tsx
root.render([{ count: 1 }, { count: 2 }, { count: 3 }]);
```

Here the `CounterList` instance reuses the existing two `Counter` instances from its own pool and creates one more to make it up to three. These pools get garbage collected when the parent component is no longer accessible, so you don't need to worry about them, however you can control pooling for performance tweaking as we'll see later.

We'll see just how useful it is having real objects to work with shortly, but first, some syntax basics.

### JSX

Instead of placing logic _around_ elements, you control it from _within_ elements using directives (attributes with special behaviour) like `if` which conditionally excludes an element from the DOM:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button if={count > 2} onClick={(count = 0)}>
      reset
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

But you don't need to remember all this. JSX elements have a tool tip which reminds you of syntax rules and lists the available directives, which have their own tool tips detailing their usage:

![Tool tip on JSX element](./assets/div-tooltip.jpg)

This JSX format has several advantages over JSX mixed with JavaScript:

- It is much clearer and easier to read.
- It preserves natural indentation.
- It is far more compact (~40% the lines of React equivalent).

And the advantages of interpreting syntax during compilation over executing virtual DOM at run time are:

- Much of the computation is done at compilation, leaving the bare minimum to be done at run time, making it insanely fast and efficient.
- We can add as many new directives, syntax features, checks, warnings as we like without it affecting bundle size.

#### Important

The function is just a placeholder for the JSX defining the component, and is completely replaced at compilation, so it never *runs*, it is only *parsed*.

The function body may only contain a single JSX expression, and nothing else. The only JavaScript allowed is inside JSX `{placeholders}`. These snippets are *copied* during compilation, with some modification of props access. 

So the button click event handler ends up looking something like this:

```tsx
function (event) {
  this.props.count++;
}
```

### TypeScript

The `Uses` type specifies a component's props (and other things as we'll see later) which are best defined as a separate an interface for clarity and reuse:

```tsx
import { mount, Uses } from "wallace";

interface iCounter {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
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

const root = mount("main", CounterList, [
  { count: 0 },
  { count: 0 }
]);
root.render([{ count: 0 }, { count: 1 }]);
```

TypeScript now warns you if you attempt to pass incorrect props at any point.

#### Important

Don't annotate the props like this:

```tsx
const Counter = (props: iCounter) => (
  <div>
    <button onClick={props.count++}>{props.count}</button>
  </div>
);
```

As that only works within that function, but not when nesting or mounting the component elsewhere.

### Rendering

For present purposes, the `render` method we've been calling does this:

```tsx
function render(props) {
  this.props = props;
  this.update();
}
```

So instead of calling `render` with props we could just modify props in place, then call `update`:

```jsx
const component = mount("main", Counter, { count: 0 });
component.props.count = 1;
component.update();
```

React tells us components should be stateless, but what React overlooks is that there are really two kinds of component:

1. **Dumb** components (like `Counter`) which only display data and fire events. These should be stateless.
2. **Coordinating** components (like `CounterList`) from which we coordinate updating of nested components based on changes to state/data. These turn messy if you force them to be stateless.

Working with state in stateless components requires awkward hacks like hooks, which require hidden magic (90% of React devs don't understand how they work) which creates more scope for mistakes.

With Wallace you get the best of both worlds:

- If you only ever call `render` (as you would for dumb components) then the component is as good as stateless.
- With coordinating components you override the `render` method to set things up for its life cycle, and use `update` from then on.

Here is a very ugly React-like way of creating a callback which nested components can use to update the coordinating component:

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

If you're worried about accidentally modifying data that shouldn't be modified, you can make it immutable using `protect`:

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

#### Important


Wallace only calls `update` from inside the `render` method as shown. At all other times (mounting, nesting components, and updating nested components) it calls `render`. So essentially:

- `render` is called from *above*, passing props.
- `update` is called *internally* without props, as they are already set.

But your code can call `update` from anywhere you like, which bypasses `render`, which makes that a good place to set things up for the life cycle of a coordinating component.

It doesn't look like much, but this little arrangement goes a long way towards keeping your code easy to *follow* and easy to *control*, which lets you develop faster, with fewer mistakes.

### Reactivity

To better demonstrate reactivity, let's add a display of the total across all counters:

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

We make things reactive by telling the coordinating component to `update` whenever the props (or some other object) is modified, which we can do with `watch`:

```tsx
import { watch } from "wallace";

CounterList.methods = {
  render(props) {
    this.props = watch(props, () => this.update());
    this.update();
  }
};
```

> Our example is now reactive: clicking on a button updates its count and the total.

The `watch` function simply returns a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) of the provided object (arrays are objects too) which fires a callback whenever it, or any nested object, is modified. It's that simple.

#### Notes

Reactive behaviour (especially with two-way binding) yields a whole new category of bugs and confusion. Frameworks which hide the mechanism (or worse, bake it into the framework) might look impressive, but that _always_ comes back to bite you.

Wallace forces you to do it in a more manual way, but this has advantages:

- You can clearly see why and when your component updates,
- It is separate. you know that the "watching" part has nothing to do with components, compilation or the "framework" as such. This will save you a lot of headaches.
- It is very easy to make the callback do something else, whether that's debugging, accessing services or updating a distant component.

### Binding

Reactivity often involves inputs, which we can `bind` to a value, which will be set when the input's `change` event is fired, but we can specify a different event with a "qualifier" like `bind:keyup`.

Let's show this by naming the things we're counting:

```tsx
interface iCounterList {
  counters: iCounter[];
  things: string;
}

const CounterList: Uses<iCounterList> = ({ counters, things }) => (
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

CounterList.methods = {/* as before */};

mount("main", CounterList, {
  things: 'sheep',
  counters: [
  { count: 0 },
  { count: 0 }
]});
```

> The UI displays `Total sheep: 0` but changes as you type in the input.

#### Notes

There's a slight problem with our design: the entire `CounterList` updates after every `keyup` event the text box. Although each update only results in a small DOM change, that's still unnecessary churn as it renders every counter.

Unwanted updates are a recurring issue with reactivity in any framework, and prickly one: its not exactly a bug, you wouldn't notice it in small examples, but it might be noticeable (or at least drain the battery faster than it should) with more components and if updates fire in rapid succession - as they would when typing.

### Refs

You might expect "refs" to give you direct access to DOM elements, which they do, but they also do something far smarter: they let you update all the dynamic elements underneath them. This lets you update part of a component, and overcome the problem we had with keyup:

```tsx
const CounterList: Uses<iCounterList> = ({ counters, things }) => (
  <div>
    <span ref:things>Total {things}: </span>
    <span>{counters.reduce((t, c) => t + c.count, 0)}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <input type="text" bind:keyup={things} />
  </div>
);

CounterList.methods = {
  render(props) {
    this.props = watch(props, (target, key) => {
      key === "things" ? this.refs.things.update() : this.update();
    });
    this.update();
  }
};
```

> Typing in the text box updates the span with things, but not the rest of the component.

You can access the raw DOM element:

```
this.refs.things.element
```

However, you probably don't want to do that. If you do need to access the DOM element (and there are a handful of reasons you might want to) then you are better using the `apply` directive:

```tsx
const Counter: Uses<iCounter> = ({ count }, { element }) => (
  <div>
    <button apply={btnApply(element, count)} onClick={count++}>
      {count}
    </button>
  </div>
);

const btnApply = (element, count) => element.disabled = count > 3;
```

Explain xargs....

The advantage of using `apply` instead of doing this in the `render` with a ref is that it runs during `update` and won't fire if the element is not visible due to `if`, `show` or `hide`.

Refs are not aware of their parent node's visibility, if you tell them to update, they will update.

Apply explains how Wallace works internally.





```tsx
import { watch } from "wallace";

interface iCounterList {
  counters: iCounter[];
  things: { value: string };
}

const CounterList: Uses<iCounterList> = ({ counters, things }) => (
  <div>
    <span ref:things>Total {things.value}: </span>
    <span>{counters.reduce((t, c) => t + c.count, 0)}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <input type="text" bind:keyup={things.value} />
  </div>
);

CounterList.methods = {
  render({ counters, things }) {
    this.props = {
      counters: watch(counters, () => this.update()),
      things: watch(things, () => this.refs.things.update())
    };
    this.update();
  }
};

mount("main", CounterList, {
  things: {value: 'sheep'},
  counters: [
  { count: 0 },
  { count: 0 }
]});


/// Or


```







Old

```tsx
import { watch } from "wallace";

interface iCounterList {
  counters: iCounter[];
  things: { value: string };
}

const CounterList: Uses<iCounterList> = ({ counters, things }) => (
  <div>
    <span>
      Total <span ref:things></span>: {counters.reduce((t, c) => t + c.count, 0)}
    </span>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <input type="text" bind:keyup={things.value} />
  </div>
);

CounterList.methods = {
  render({ counters, things }) {
    this.props = {
      counters: watch(counters, () => this.update()),
      things: watch(things, () => this.updateThings())
    };
    this.update();
  },
  updateThings() {
    const { refs, props } = this;
    refs.things.textContent = props.things.value;
  },
  update() {
    const { base, props } = this;
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

- 

### Xargs

### Controllers

We lied about the `render` function earlier. It actually looks like this:

```tsx
function render (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
};
```

This `ctrl` field is intended for a "controller" which can be any object. You can set it in `mount`:

```tsx
const ctrl = {};
mount("main", CounterList, [], ctrl);
```

But it is more common to set it in `render` as the controller often needs a reference to the component:

```tsx
CounterList.prototype.render = function (counters) {
  this.props = watch({ counters, things: "sheep" }, () =>
    this.update()
  );
  this.ctrl = {
    setAllCountersTo: (count) => {
      counters.forEach(c => (c.count = count));
      this.update();
    };
  };
  this.update();
}
```

During `update`, a component calls `render(props, this.ctrl)` on all nested components, effectively propagating the `ctrl` field down the tree.

The component definition function uses a special 2nd argument which gives easy access to `ctrl` and other bits as we'll see later:

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

In Wallace you use props for data, and the controller for everything else. In fact you are encouraged to move most of the logic, calculations and props formatting into the controller, leaving the component to contain the bare minimum:

At this point it's easier using class syntax:

```tsx
import { ComponentInstance, watch } from "wallace";

class Controller {
  counters: iCounter[];
  constructor(
    root: ComponentInstance<iCounterList>,
    counters: iCounter[]
  ) {
	root.props = watch({ counters, things: "sheep" }, () =>
      root.update()
    );
  }
  setAllCountersTo(count) {
    this.props.counters.forEach(c => (c.count = count));
  }
}
```

> Using `Component<iCounterList>` gives us type support when setting `root.props`.

And here is all we need in the `render` method:

```tsx
CounterList.prototype.render = function (counters) {
  this.ctrl = new Controller(this, counters);
  this.update();
};
```

A nice advantage of using a class is that it defines its own type, which you can pass into the 2nd slot in `Uses` which then adds type support for `ctrl`:

```tsx
const Counter: Uses<iCounter, Controller> = ({ count }, { ctrl }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button onClick={ctrl.setAllCountersTo(count)}>...</button>
  </div>
);
```

So controllers help:

- Coordinate event callbacks across the whole tree.
- Keep your data in its original format.
- Keep your components simple.
- Move your logic away from the framework.

That last point it really interesting, because we all make mistakes. But when the mistake happens in code that's close the framework, our brains naturally suspect that we made a framework-related mistake, or that the framework itself has a bug.

Simply moving your logic to a class which clearly has nothing to do with the framework removes that suspicion, and helps you identify the problem quicker.

The components and the controllers are also easier to test.





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

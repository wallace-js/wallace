# Wallace

_The tiny framework that brings you FREEEDOM!!!_

[![nmp](https://img.shields.io/badge/npm-wallace-blue)](https://npmjs.com/package/wallace) [![npm](https://img.shields.io/npm/v/wallace.svg)](https://npmjs.com/package/wallace) [![npm](https://img.shields.io/npm/dt/wallace.svg)](https://npmjs.com/package/wallace)
![workflow](https://github.com/wallace-js/wallace/actions/workflows/node.js.yml/badge.svg) [![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)

## About

Wallace is a front end JavaScript framework for building:

- Web apps of any kind.
- Mobile apps - using tools likes [Capacitator](https://capacitorjs.com/).
- Desktop apps - using tools like [Tauri](https://v2.tauri.app/).

It stands apart from [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/), [Solid](https://www.solidjs.com/) etc on three points:

1. **Performance**
2. **Productivity**
3. **Freedom**

### 1. Performance

Wallace is perhaps the smallest and fastest loading framework out there. Here is the bundle size for different framework implementations of the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) app:

![Bar chart of bundle sizes](./assets/size-compressed.jpg)

This makes Wallace ideal for:

- Landing pages that need to load fast.
- Use cases where resources or connectivity are limited.
- Large apps where you switch pages frequently (there's less need for an SPA if you have tiny bundles, especially if when combined with a PWA app skeleton).

And its DOM updates are pretty fast too. Here is the time\* in milliseconds to create 1000 rows on the benchmark app:

![Bar chart of times to create 1000 rows](./assets/run1k.jpg)

Benchmarks are cute, but A UI doesn't need to be *fast*, it needs to not be *slow*. And the only way to protect your app from bottlenecks is picking a framework gives you the freedom needed to implement workarounds to the curve balls that cause them. We'll get back to that.

_\* Times are taken from local runs, using non-keyed implementations where available. Will submit for an official run soon. Bundle sizes would be identical._

### 2. Productivity

Frameworks speed up certain tasks, then add their own mess of weird syntax, awkward conventions and ugly patterns which creates:

1. More bits to learn.
2. More bits that cause bugs.
3. More bits that could have caused the bug, but didn't, but still wasted your time making you question whether it did before realising it didn't.

Wallace makes you more productive simply by doing less of that. A lot less. So much less that the entire documentation fits comfortably in the tool tips (including a cheat sheet on the module itself) so you never have to leave your IDE, which also makes you more productive:

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

Not only is Wallace simple and obvious in itself, but the code you write ends up being equally simple and obvious - which is the biggest productivity asset you can get in the long run.

It also has really great TypeScript support, which further boosts productivity.

All this makes Wallace ideal for:

- Learning and teaching.
- People who don't touch the (front end) code very often.
- People who prefer developing features over solving framework problems.

But despite its simple directness, Wallace also offers far more power and flexibility in organising and reusing your code, simply by embracing OOP, so it scales far better on larger projects, while keeping bundle size in check.

### 3. Freedom

Wallace is perhaps the world's only _fully open_ framework, meaning you can override _all_ behaviour, easily and at a granular level. This gives you full freedom, which you could use to do things like:

- Change how a component updates all or part of its DOM.
- Run partial updates deep in the tree, cleanly and safely.
- Optimise further than any other framework - making Wallace the best option for performance-critical apps.
- Solve performance bottlenecks (which can hit any framework) with relative ease - making it the safest option all round.
- Use parts of Wallace as a skeleton for something else.

No other framework offers this. In fact most restrict you so severely that a minor curve ball could cause a performance bottleneck you can't solve, at least without your productivity and code quality taking a hit.

Though you many not need it often, freedom protects your performance and your productivity. And the problem with freedom is that you often don't realise you gave it away until you need it back, by which time it's too late.

This unique feature gives Wallace its name, after [William Wallace](https://en.wikipedia.org/wiki/William_Wallace) - or rather his fictional portrayal in the film [Braveheart](https://www.imdb.com/title/tt0112573/) who made it tricky for people in Scotland to say "freedom" too many times at the risk of someone spontaneously reenacting this scene:

![Mel Gibson shouting FREEDOM in Braveheart](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

## Tour

This tour covers all of Wallace's features in enough detail for you to go forth and build awesome apps. You can code along:

- In your browser using StackBlitz (choose [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx))
- Locally with `npx create-wallace-app`

There are also [examples](https://github.com/wallace-js/wallace/tree/master/examples) which have a link in their README to open it in [StackBlitz](https://stackblitz.com) so you can play around online, or download as a project that will run locally.

### Compilation

Wallace uses its own Babel plugin to replace functions that hold JSX, like this:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
  </div>
);
```

With constructor functions that allow us to create component objects like this:

```tsx
const component = new Counter();
```

The objects control their own DOM, which can be updated like this:

```tsx
component.render({ count: 1 });
```

However you don't normally create components yourself. Instead you use `mount` which:

1. Creates the component.
2. Calls its `render` method.
3. Replaces the specified element (in this case the one with id "main") with the component's DOM
4. Returns the component.

Like so:

```tsx
import { mount } from 'wallace';

const CounterList = ( counters ) => (
  <div>
    <Counter.repeat items={counters} />
  </div>
);

const component = mount('main', Counter, [{ count: 0 }, { count: 0 }]);
```

This component will then create two `Counter` components, called their `render` method passing one `{ count: 0 }` to each, and attach their DOM at the correct location.

If you were to call render again:

```tsx
component.render([{ count: 1 }, { count: 2 }]);
```

It would reuse the two `Counter` components it created first time.

##### Important

The DOM is controlled entirely by components, which are normal objects. There is no hidden engine coordinating things in the background. This makes things very simple and easy to control.

The function with the JSX (aka the component definition) is read during compilation then replaced, so it never runs, because it doesn't exist at run time. Therefore its cannot contain *any* JavaScript, only a single JSX expression which must be returned for TypeScript reasons.

### JSX

Instead of placing logic *around* your JSX elements, you control it from *within* elements using special syntax for nesting and repeating:

```tsx
const CounterList = ( counters ) => (
  <div>
    <Counter.nest props={counters[0]} />
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```

And *directives*, which are attributes with special behaviour:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count ++}>{count}</button>
    <button if={count > 2} onClick={count = 0}>X</button>
  </div>
);
```

There are 15 directives, but you don't need to memorise them as JSX element display a tool tip which lists them all:

![Tool tip on JSX element](./assets/div-tooltip.jpg)

This approach to JSX has several advantages over JSX mixed with JavaScript:

- It is much clearer and easier to read.
- It preserves natural indentation.
- It is far more compact (~40% the lines of React equivalent).

##### Important

The only JavaScript allowed in inside JSX `{placeholders}` which gets *copied* to other functions during compilation, with any destrutcured props reassembled. So the button click event handler ends up like this:

```tsx
function (event) {
  component.props.count++;
}
```

### TypeScript

You get amazing TypeScript support with the `Uses` type, which defines the data a component expects, and more as we'll see later:

```tsx
import { mount, Uses } from "wallace";

interface iCounter {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button if={count > 2} onClick={count = 0}>X</button>
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

const component = mount("main", CounterList, [{ count: 0 }, { count: 0 }]);
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

You will get type support on the props in that function, but not on props passed when nesting or mounting, whereas `Uses` takes care of all of that.

### Rendering

For present purposes, the `render` method we've been calling does this:

```tsx
Component.prototype.render = function (props) {
  this.props = props;
  this.update();
};
```

That code tells us we could do this:

```jsx
const component = mount("main", CounterList, [{ count: 0 }, { count: 0 }]);
component.props.pop();
component.update();
```

Which may seem unsafe, but firstly we can protect data that shouldn't be modified, which we could do in `mount` or in a custom (or "overridden") `render` method:

```tsx
import { protect } from 'wallace';

CounterList.prototype.render = function (props) {
  this.props = protect(props);
  this.update();
};
```

> Clicking on buttons now throws an error, as they modify the object in place.

And secondly it makes working with data that should be modified really easy:

```tsx
CounterList.prototype.render = function (props) {
  const update = () => this.update();
  this.props = props.map(c => ({ ...c, update}));
  this.update();
};
```

The `Counter` can now `update` the `CounterList` without calling `render`:

```tsx
const Counter: Uses<iCounter> = ({ count, update }) => (
  <div>
    <button onClick={(count++, update())}>{count}</button>
  </div>
);
```

This is really ugly (and introduces a subtle behaviour change) and we'll be looking at better ways shortly. The point is to understand the relationship between `render`, `update` and `props` before moving on to new concepts.

##### Important

Using `update` means `render` is only called from above, so rather infrequently for high level components like `CounterList` (just once in our example) which makes it a good place to set things up for the life cycle of the component. 

You wouldn't do this for the likes of `Counter` whose `render` method is called whenever we call `update` on the `CounterList`. You move setup to the highest component possible.

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

CounterList.prototype.render = function(props) {
  this.props = watch(props, () => this.update());
  this.update();
}
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

CounterList.prototype.render = function(counters) {
  this.props = watch({ counters, things: "sheep" }, () => this.update());
  this.update();
}
```

> The UI displays `Total sheep: 0` but changes as you type in the input.

##### Important

Reactive behaviour (especially with two-way binding) yields a whole new category of bugs and confusion. Frameworks which hide the mechanism (or worse, bake it into the framework) might look impressive, but that *always* comes back to bite you.

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
import { ComponentInstance, watch } from 'wallace';

interface iCounterList {
  counters: iCounter[];
  total: number;
}

class Controller {
  root: ComponentInstance<iCounterList>;
  counters: iCounter[];
  constructor(root: ComponentInstance<iCounterList>, counters: iCounter[]) {
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
CounterList.prototype.render = function(counters) {
  this.ctrl = new Controller(this, counters);
  this.ctrl.update();
}
```

Notice how the controller now creates the props for the component, which makes the component neater:

```tsx
const CounterList: Uses<iCounterList>  = ({ counters, total }) => (
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
const CounterList: Uses<iCounterList> = ({ counters, things }, { self, event }) => (
  <div>
    <span>
      Total {things}: {counters.reduce((t, c) => t + c.count, 0)}
    </span>
    <div>
      <Counter.repeat items={counters} />
    </div>
    <input type="text" bind={self.tmpThings} onKeyUp={self.thingsKeyUp(event as KeyboardEvent)} />
  </div>
);

CounterList.methods({
  render(counters) {
    this.tmpThings = "";
    this.props = watch({ counters, things: "bananas" }, () => this.update());
    this.update();
  },
  thingsKeyUp(event: KeyboardEvent) {
    if (event.key !== "Enter") return;
    const newthings = this.tmpThings;
    this.tmpThings = "";
    this.props.things = newthings;
  }
});
```

There's a lot of new bits:

1. We access two new variables in xargs:
   1. `self` which is the component instance (we can't use `this` in arrow functions).
   2. `event` which refers to the DOM event and can only be used in event callbacks. You use the same variable in each callback
   3.  like `element` adapts to mean the event in that callback, so you could use them in multiple places and they would point to different things. Remember this isn't a real function with real arguments.
2. We used `CounterList.methods` which is just a nicer way of setting keys on `CounterList.prototype`.
3. We put `tmpThings` on the component instead of the props, because we don't want to update the component every time it changes. It is reset during render so it's pretty safe.

Add interface

##### Important

You might be tempted to omit `bind` and `tmpThings` and just read the value from the element:

```tsx
thingsKeyUp(event) {
  if (event.key !== "Enter") return;
  this.props.things = event.target.value;
  event.target.value = '';
}
```

Which works, but you run into problems if you re-use or re-render the component before hitting enter, as the value remains attached to the element. So it's best to always `bind` an input to a value which gets reset on render.

### Extending

You can extend a component definition, which creates a new component definition that inherits the base component's methods, which you can redefine or add to:

```tsx
import { extendComponent } from 'wallace';

const SpecialCounterList = extendComponent(CounterList);

SpecialCounterList.methods({
  thingsKeyUp(event) {
    if (event.key !== "Enter" || ! this.isThingsValid()) return;
    const newthings = this.tmpThings;
    this.tmpThings = "";
    this.props.things = newthings;
  },
  isThingsValid() {
     return this.tmpThings.length > 2;
  }
});
```

> This inherits the `render` method as `CounterList`.

You can also specify a new DOM structure, perhaps to display the highest counter instead of the total:

```tsx
const HighestCounterList = extendComponent(
  CounterList, ({ counters }) => (
  <div>
    <span>Highest: {Math.max(...counters.map(c => c.count))}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
));
```

TypeScript will only let an extended component use a compatible controller (which extends the base controller).

TODO: types

##### Important

Mention compiler.

Only use it like this:

```jsx
extendComponent(CounterList, () => <div></div>);
```

And **not** like this:

```jsx
const Foo = () => <div></div>;
extendComponent(CounterList, Foo);
```

### Stubs

But if you're planning on allowing that, you can use stubs:

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

const CounterList = extendComponent(BaseCounterList, () => (
  <div>
    <stub:counters />
    <hr/>
    <stub:highest />
    <stub:total />
  </div>
));
```

> So long as the final component definition has an implementation (its own or inherited) for each stub it references, it will work.

Stubs are a flexible way to organise reusable component skeletons or parts, which again, helps reduce duplication, errors and bundle size.

##### Important

A stub receives the same props as its enclosing component.



## Status

Wallace is rather young, and hasn't been fully battle tested but:

1. You can override all behaviour at a granular level, which offers a degree of safety.
2. It is based on previous (unreleased) frameworks used in production for years on sites like [healthmatters.io](https://healthmatters.io) and [yourstreet.org](https://www.yourstreet.org).

You can help make Wallace battle-ready by:

1. Using it ✔️
2. Filing bugs 🐞
3. Giving it a ★\*

_\* Every ★ brings us closer to a world no longer dominated by 2 frameworks from corporations that steal our focus and sell our data. Go star [Svelte](https://svelte.dev/) and [Solid](https://www.solidjs.com/) while you're at it._

## Issues

Please open a ticket for any issue, including usage questions, as everything should be documented in tool tips and I'd want to know if its not.

## License

MIT.

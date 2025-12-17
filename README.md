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

But benchmarks aren't the same as the real world, where performance is really down to how much _freedom_ you have to find workarounds to bottlenecks.

_\* Times are taken from local runs, using non-keyed implementations where available. Will submit for an official run soon. Bundle sizes would be identical._

### 2. Productivity

Wallace is simple, direct and easy to use, with delightfully clean syntax:

```tsx
const Task = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label>{text}</label>
  </div>
);

const TaskList = tasks => (
  <div>
    <Task.repeat items={tasks} />
  </div>
);
```

Your JSX remains clear, uncluttered and compact, leaving your code base with ~40% fewer lines of JSX than React.

You don't even need to remember the syntax rules or what's available as there are tool tips everywhere, including the full cheat sheet on the module import:

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

Wallace also offers:

1. Deep TypeScript support (if you want it).
2. Flexible inheritance & composition patterns.
3. A simple controller system that keeps logic out of your components.

All these features help you work faster, but where Wallace really saves time is by not doing things which kill productivity in other frameworks:

#### No lock in

You are never trapped by the framework. If you wanted to update certain components (or parts thereof) with jQuery instead, you could.

#### No hidden magic

You know exactly why, when and how everything updates, even on reactive components (Wallace has opt-in reactivity, which is the only sane way).

```tsx
const watchedTasks = watch(tasks, () => root.update());
const root = mount("main", TaskList, watchedTasks);
```

#### No awkward patterns

No hooks, portals, signals, providers, state handlers, context managers etc... It's just objects calling methods on other objects - as simple as can be.

All this makes Wallace ideal for:

- Learning/teaching.
- People who don't touch the (front end) code very often.
- Teams that enjoy shipping on Thursday morning instead of Friday evening.

### 3. Freedom

Wallace is perhaps the world's only _fully open_ framework, meaning you can override _all_ run time operations at a granular level if you need to.

This gives you freedom to do anything, such as:

- Change how a component updates (all or part of) its DOM.
- Run partial updates deep in the tree, cleanly and safely.
- Optimise further than any other framework - making Wallace the best option for performance-critical apps.
- Solve performance bottlenecks (which can hit any framework) with relative ease - making it the safest option all round.

No other framework offers this. In fact most restrict you so severely that any curve ball could cause a performance bottleneck you can't solve without sacrificing your productivity or your sanity.

The thing about freedom is that you often don't realise you gave it away, until you need it back, by which time it's too late.

#### Name

This framework is named after [William Wallace](https://en.wikipedia.org/wiki/William_Wallace) (or rather his fictional portrayal in the film [Braveheart](https://www.imdb.com/title/tt0112573/)) who made it very difficult for people in Scotland to utter the word "freedom" too freely, at the risk of someone offering their rendition of this scene:

![Mel Gibson shouting FREEDOM in Braveheart](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

## Tour

You can code along if you like, either:

- In your browser using StackBlitz (choose [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx))
- Locally with `npx create-wallace-app` (requires node 18 or above).

### Overview

Wallace uses a Babel plugin (which runs while compiling your bundle) which replaces functions that return a single JSX expression like this:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={null}>{count}</button>
  </div>
);
```

With a generated function, which is used as a constructor to create an object we call a component:

```tsx
const counter = new Counter();
```

A component wraps a tree of elements (often called DOM) which can be attached to the document:

```tsx
document.getElementById('main').appendChild(counter.root);
```

And provides a method which updates its tree:

```tsx
counter.render({ count: 0 });
```

You don't normally create components yourself, instead you a helper functions Wallace called `mount`:

```tsx
import { mount } from 'wallace';

/*...*/

mount('main', Counter, { count: 0 });
```

Which does exactly what we just saw except:

1. It *replaces* the specified* element rather than append a child.
2. It calls render *before* doing that.
3. It returns the component.

_\* You can pass an element or a string, in which case it will find the element with matching id._

And nested components are created for you too. So all Wallace really "does" is transform your JSX functions into constructor functions, and provide (four) helper functions.

Things worth pointing out:

1. The entire function (not just the body) is completely replaced, so it doesn't exist at run time, and therefore never runs. Its only purpose is to contain a JSX expression (and nothing else) used to generate the constructor function.
2. The component does everything, there is no central coordinator (like React's "root" object) and this will stay the case even as we nest components.

The counter now display its button, but clicking it doesn't do anything yet.

### JSX

Wallace has its own JSX dialect. Instead of weaving JavaScript into it and making a mess, you use directives (attributes with special behaviour) like `if` which conditionally adds or removes an element:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={null}>{count}</button>
    <button if={count > 2} onClick={null}>X</button>
  </div>
);
```

To display all the directives, simply hover over any element like `div` to display a tool tip:



In addition to directives there is a special syntax for nesting and repeating:

```tsx
const CounterList = ( counters ) => (
  <div>
    <Counter.next props={counters[0]} />
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```

Remember that Wallace doesn't *run* your JSX, or its containing function, so you're not allowed any JavaScript before or around JSX. You're only allowed JavaScript within expressions, and these must not return further JSX elements. 

You are not allowed JSX anywhere other than in the return value of a function, which will then be treated as a component function and replaced.

### TypeScript

Wallace exports a handful of types, the main one being `Uses` which specifies the shape of the data a component takes:

```tsx
import { mount } from "wallace";

interface iCounter = {
  count: number;
}

const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <button onClick={null}>{count}</button>
    <button if={count > 2} onClick={null}>X</button>
  </div>
);

const CounterList: Uses<iCounter[]> = counters => (
  <div>
    <Counter.next props={counters[0]} />
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);

const root = mount("main", CounterList, [{ count: 0 }, { count: 0 }]);
root.render([{ count: 0 }, { count: 1 }]);
```

TypeScript now warns you if you attempt to pass incorrect props at any point, and a lot more, as we'll see later.

### Rendering

Here is the `render` method:

```tsx
Component.prototype.render = function (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
};
```

As you can see it just sets two fields, then calls `update` (which does all the heavy lifting) and this means you could essentially modify the props object in place, then call `update`:

```jsx
const counters = [{ count: 0 }, { count: 0 }];
const root = mount("main", CounterList, counters);
counters[0].count = 2;
root.update();
root.props[1].count = 3;
root.update();
```

And this is extremely useful, although you normally do it in a far more controlled manner as we'll see in the next section.

The second really useful bit is knowing when Wallace calls each method:

- `update` is only called from `render` (so from *within*) - but you may call it anywhere.
- `render` is used everywhere else: mounting, nesting or updating components (so from *above*).

So if you override the methods of both our components to add some logging:

```tsx
Counter.prototype.render = function (props, ctrl) {
  console.log('Rendering Counter');
  this.base.render.call(this, props, ctrl);
};

CounterList.prototype.render = function (props, ctrl) {
  console.log('Rendering CounterList');
  this.base.render.call(this, props, ctrl);
};
```

You will see that:

- `Rendering CounterList` is printed *once* for duration of the session, because we only mount on instance.
- `Rendering Counter` is printed twice each time the CounterList `update` is called, because the `update` method calls `render` on nested components.

And this means we can do stuff inside `render` that lasts for the life cycle of the component, then call `update` throughout its life cycle.

Note that `base` is a Wallace feature which points to the unmodified method on the base `Component` not like `super` which is only available in classes which calls the closest override.

### Reactivity

First we're going to populate the `Counter` button callbacks and display the total in `CounterList`:

```tsx
const Counter: Uses<iCounter> = ({ count }) => (
  <div>
    <button onClick={count ++}>{count}</button>
    <button if={count > 2} onClick={count = 0}>X</button>
  </div>
);

const CounterList: Uses<iCounter[]> = counters => (
  <div>
    <span>Total: {counters.reduce((t, c) => t + c.count, 0)}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);
```

The button callbacks may be confusing for two reasons:

1. It seems like it is being invoked immediately whereas normal JSX would require a function like `() > count ++.`
2. It seems like we're updating a primitive number `count`, which implies there's some magic going on if we're making that reactive.

But there is no magic in Wallace, just a very clever compiler:

1. Anything inside a JSX expression gets *copied* somewhere else during compilation.
2. Destructured props are restructured.

So if you were to inspect the output, which you can do with `npx babel path/to/file` you'd see something like this:

```tsx
onEvent(element, "click", function (event) {
  component.props.count++;
});
```

Our buttons now modify the data in place, but this doesn't update the DOM just yet, because that would be magic. The closest thing Wallace has to magic is the `watch` helper function, which returns a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object which calls a callback whenever it (or any object within it) is modified.

You can use it anywhere you like, and make the callback do whatever you like, but most of the time you'd do something like this:

```tsx
import { watch } from "wallace";

/*...*/

CounterList.prototype.render = function(props, ctrl) {
  const watchedProps = watch(props, () => this.update());
  this.base.render.call(this, watchedProps, ctrl);
}
```

Our example is now reactive, so the `CounterList` component will update when the `Counter` buttons are clicked.

This may feel like a long-winded way of going about it compared to frameworks which are reactive by default, but there are three very good reasons why Wallace does it this way.

##### Confusion

Reactive behaviour in the DOM is incredibly prone to firing over itself and causing very confusing glitches and bugs. With Wallace the reactive behaviour comes from the proxy, which has nothing to do with components or compilation (or the "framework" if you like) and this really helps you see how and when updates fire, or bisect the origin of any issue.

(and avoid going all superstitious )

If in doubt, add logging. The callback accepts arguments to make this easier:

```tsx
watch(props, (target, key, value) => {
  console.log(target, key, value);
  this.update();
);
```

##### Extension

You often end up doing more than just updating the component, in which case you just add to the callback as shown, or change it. You'll be glad you were made to provide an explicit callback in the first place.

Calling different callbacks when different parts of the data change is easy too.

##### Exclusion

The majority of components display data that is not to be modified, and therefore have no need to be reactive (in fact its better they are not) so reactivity should be opt-in, not built-in.

In such cases you can use the `protect` helper function, which throws an error if the object (or any nested object) is modified:

```tsx
import { protect } from "wallace";

CounterList.prototype.render = function(props, ctrl) {
  this.base.render.call(this, protect(props), ctrl);
}
```

Clicking the buttons now throws an exception, because your data can't reactive *and* immutable.

But you can make different parts of your data reactive or immutable:

```tsx
DataGrid.prototype.render = function(data) {
  this.props = {
    filters: watch(new DataGridFilter(data), () => this.filtersChanged()),
    data: protect(data);
  }
  this.update();
}
```

We used this last example to show that you can:

- Omit `ctrl` if its not being used (we'll get to what this does very soon)
- Assemble props for the component's life cycle however you like.
- Call something other than `this.update` in a callback.

Let's see how we would add that `filtersChanged` method.

### Methods

```tsx
const DataGrid = ({ data, filters }, { self }) => (
  <div>
    <div>
      Add filter controls here...
      <button onClick={self.resetFilters()}>Reset</button>
    </div>
    <table>...</table>
  </div>
)

DataGrid.methods({
  render(data) {
      this.props = {
        filters: watch(new DataGridFilter(), () => this.filtersChanged()),
        data: protect(data);
      }
      this.update();
  },
  filtersChanged() {
     // update filter controls somehow...
  },
  resetFilters() {
     this.props.filters = new DataGridFilter();
     this.update();
  }
});
```



### Controllers

React JSX ends up so cluttered with JavaScript that it no longer delivers one of its major potential benefits: to convey the structure of the DOM (as represented in HTML) you are working with.

Wallace goes to great lengths to restore this benefit with its directives and nesting syntax, which you may initially find inconvenient as you only have one expression slot for props:

```tsx
<Counter.nest props={counters[0]} />
<Counter.repeat items={counters} />
```

While you *could* do your modifications inside the JSX expressions, you are encouraged not to, as that adds clutter to the JSX. Additionally, the way Wallace uses controllers means there's a whole lot less need to do so!

To introduce controllers, we're going to target another bit of clutter in the JSX, that big long `recude` call:

```tsx
<span>Total: {counters.reduce((t, c) => t + c.count, 0)}</span>
```

We could move it out to a function, or even add method to `CounterList` 

```tsx
CounterList.methods({
  render(props) {
    const watchedProps = watch(props, () => this.update());
    this.base.render.call(this, watchedProps, ctrl);
  }
});
```



but instead we're going to move _all_ the logic out to a controller:

```tsx
const CounterList = ({ counters, total }) => (
  <div>
    <span>Total: {total}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);

CounterList.methods({
  render(props) {
    this.ctrl = new Controller(this, props);
  }
});

class Controller {
  constructor(component, counters) {
    this.component = component;
    this.counters = watch(counters, () => this.update());
    this.update();
  }
  update() {
    const { component, counters } = this;
    component.props = {
      counters,
      total: counters.reduce((t, c) => t + c.count, 0)
    };
    component.update();
  }
}
```

Wallace doesn't know anything about your controllers. All that happens is that components pass their `ctrl` to the `render` method of nested components, which assigne it to themselves. Here is the unadulterated render function:

```tsx
Component.prototype.render = function (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
};
```

It's as dumb as that. But to see how clean this makes our code, let's add a button to`Counter` which sets all other counters to the same value.

Here's the method on the controller:

```tsx
class Controller {
  /*...*/
  setAllCountersTo(count) {
    this.counters.forEach(c => (c.count = count));
  }
}
```

And here's how we access it in the component:

```tsx
const Counter = ({ count }, { ctrl }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button onClick={ctrl.setAllCountersTo(count)}>X</button>
  </div>
);
```

The only issue is that this calls `update` once for each counter, but there's an easy fix (see docs in tool tips).

In summary, Wallace components:

- Have two separate methods: `render` and `update`.
- Pass two objects to nested components: `props` and `ctrl`.

And this has far reaching implications:

1. You do everything with very simple, natural code - without magic or bits you don't understand (like hooks) and this saves immeasurable time.
2. As you add complexity (storage, fetching, undo/redo etc) all of that stays inside your controllers, leaving your components to focus solely on display and firing UI events.
3. Your props only contain data, no need to pollute them with functions or other stuff (this makes types a lot nicer too).
4. Because the controllers are not "framework" code, there's less confusion, which makes debugging so much easier. And all the "framework" code (components) end up pretty simple too.
5. Organise how you like. Inheritance (base class controller for async loading) this reduces duplication and bundle size too.

### Extending

Talking of inheritance, you can do that with components too:

```tsx
const CounterList = ({ counters }) => (
  <div>
    <stub.stats />
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);

const HighestCounterList = extendComponent(CounterList);

HighestCounterList.stub.stats = ({ counters }) => (
  <span>Highest: {Math.max(...counters.map(c => c.count))}</span>
);
```

Alternatively you can define stubs on the base class and use those you want in the child component:

```tsx
const BaseCounterList = () => <div>Please override</div>;

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
    <stub.counters />
    <hr/>
    <stub.highest />
    <stub.total />
  </div>
));
```



### Summary



1. one class and 4 helper functions
2. Simple as fuck
3. no hooks
4. List all fields and methods.

---





Sequence options

1. A 
   1. you define components as functions
   2. counter with if
   3. JSX with extras, called directives
   4. also has its own syntax for repeat
   5. you're not allowed logic
   6. wallace is a compiler
   7. you could new it like this
   8. but normally use mount
   9. one class and 4 helper functions
   10. here is the full listing with typescript
   11. Its not reactive but first we need to understand render
   12. reactive
   13. controller
   14. extend
2. B
   1. wallace is a compiler
   2. counter with one btn with null
   3. into constructor
   4. you could new it like this
   5. but normally use mount
   6. now displays but is not reactive
   7. jsx - directives then repeat
   8. show everything with typescript
   9. it looks like react, but these are objects, not functions, and why this matters is because the render happens with two methods (show render) so we can do things inside render.
   10. reactivity (show standalone) and explain ++
   11. controllers
   12. extend



Wallace uses components

Here is a click counter with a reset button which only shows after 3 clicks:

```tsx
const Counter = ({ count }) => (
  <div>
    <button onClick={count++}>{count}</button>
    <button if={count > 2} onClick={count = 0}>X</button>
  </div>
);
```

As you can see, Wallace uses JSX with extra bits, like `if` - these are called directives.





Here is the repeat syntax:

```tsx
const CounterList = counters => (
  <div>
    <span>Total: {counters.reduce((t, c) => t + c.count, 0)}</span>
    <div>
      <Counter.repeat items={counters} />
    </div>
  </div>
);

```

There are 3 reasons:

- Cleaner JSX
- Stubs (see )
- 

so you can

but you normally use a the mount helper function.

```tsx

mount("main", CounterList, [{ count: 0 }, { count: 0 }]);
```

All together with TypeScript.

That's all there is to Wallace: one class and four helper functions.



It's not reactive for reasons we'll explore in a minute.





## Learn

You can learn Wallace in under ten minutes, after which you only need tool tips.

- In your browser using StackBlitz (choose [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx))
- By creating an app with `npx create-wallace-app`

But to really understand Wallace, read the [TUTORIAL](https://github.com/wallace-js/wallace/tree/master/TUTORIAL.md). It takes around 30 minutes, and covers everything there is to know.

You can also browse through the [examples](https://github.com/wallace-js/wallace/tree/master/examples), which you can open in [StackBlitz](https://stackblitz.com) (link in each example's README) which lets you play around and download it as a fully working project.

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

---

## Learn - old

You can probably learn Wallace by spinning up a demo and reading the tool tips, either:

- In your browser using StackBlitz (choose [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx))
- By creating an app with `npx create-wallace-app`

But to really understand Wallace, read the [TUTORIAL](https://github.com/wallace-js/wallace/tree/master/TUTORIAL.md). It takes around 30 minutes, and covers everything there is to know.

You can also browse through the [examples](https://github.com/wallace-js/wallace/tree/master/examples), which you can open in [StackBlitz](https://stackblitz.com) (link in each example's README) which lets you play around and download it as a fully working project.

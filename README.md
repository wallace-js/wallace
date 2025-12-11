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

Wallace is perhaps the smallest (and therefore fastest loading) framework out there. Here is the bundle size for different framework implementations of the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) app:

![Bar chart of bundle sizes](./assets/size-compressed.jpg)

This makes Wallace ideal for:

- Landing pages that need to load fast.
- Use cases where resources or connectivity are limited.
- Large apps where you switch pages frequently (there's less need for an SPA if you have tiny bundles, especially if when combined with a PWA app skeleton).

And its DOM updates are pretty fast too. Here is the time* in milliseconds to create 1000 rows on the benchmark app:

![Bar chart of times to create 1000 rows](./assets/run1k.jpg)

But benchmarks aren't the same as the real world, where performance is really down to how much *freedom* you have to find workarounds to bottlenecks.

*\* Times are taken from local runs, using non-keyed implementations where available. Will submit for an official run soon. Bundle sizes would be identical.*

### 2. Productivity

Wallace is delightfully simple, direct and easy to use. Here's what you'll be dealing with most of the time:


```tsx
import { mount } from 'wallace';

const Task = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done}/>
    <label>{text}</label>
  </div>
);

const TaskList = ( tasks ) => (
  <div>
    <Task.repeat items={tasks} />
  </div>
);

const tasks = [
  { text: 'Learn Wallace', done: true },
  { text: 'Star on github', done: false }
];

mount('main', TaskList, tasks);
```

This syntax helps keep your JSX uncluttered and compact, leaving your code base with ~40% fewer lines of JSX than React.

You don't even need to remember the syntax rules or what's available as there are tool tips everywhere, including the full cheat sheet on the module import:

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

Wallace also offers:

1. Deep TypeScript support (if you want it).
3. Flexible inheritance & composition patterns.
4. A simple but powerful way of handling non-display aspects (state, triggering updates, services etc...)

All these features help you work faster, but where Wallace really saves time is by not doing things which kill productivity in other frameworks:

#### No lock in

You are never trapped by the framework. If you want to update certain components (or parts thereof) with jQuery instead, there's nothing stopping you.

#### No hidden magic

You know exactly why, when and how everything updates, even on reactive components (Wallace has opt-in reactivity, which is the only sane way).

```tsx
const watchedTasks = watch(tasks, () => root.update());
const root = mount('main', TaskList, watchedTasks);
```

#### No awkward patterns

No hooks, portals, signals, providers, state handlers, context managers etc... It's just objects calling methods on other objects - as simple as can be.

All this makes Wallace ideal for:

- Learning/teaching.
- People who don't touch the (front end) code very often.
- Teams that enjoy shipping on Thursday morning instead of Friday evening.

### 3. Freedom

Wallace is perhaps the world's only *fully open* framework, in that you can override *all* run time operations at a granular level if you need to.

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

## Status

Wallace is rather young, and hasn't been fully battle tested but:

1. You can override all behaviour at a granular level, which offers a degree of safety.
2. It is based on previous (unreleased) frameworks used in production for years on sites like [healthmatters.io](https://healthmatters.io) and [yourstreet.org](https://www.yourstreet.org).

You can help make Wallace battle-ready by:

1. Using it ✔️
2. Filing bugs 🐞
3. Giving it a ★*

_\* Every ★ brings us closer to a world no longer dominated by 2 frameworks from corporations that steal our focus and sell our data. Go star [Svelte](https://svelte.dev/) and [Solid](https://www.solidjs.com/) while you're at it._

## Learn

You can probably learn Wallace by spinning up a demo and reading the tool tips, either:

- In your browser using StackBlitz (choose [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx))
- By creating an app with `npx create-wallace-app`

But to really understand Wallace, read the [TUTORIAL](https://github.com/wallace-js/wallace/tree/master/TUTORIAL.md). It takes around 30 minutes, and covers everything there is to know.

You can also browse through the [examples](https://github.com/wallace-js/wallace/tree/master/examples), which you can open in [StackBlitz](https://stackblitz.com) (link in each example's README) which lets you play around and download it as a fully working project.

## Issues

Please open a ticket for any issue, including usage questions, as everything should be documented in tool tips and I'd want to know if its not.

## License

MIT.

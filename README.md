# Wallace

_The tiny framework that brings you FREEEDOM!!!_

[![nmp](https://img.shields.io/badge/npm-wallace-blue)](https://npmjs.com/package/wallace) [![npm](https://img.shields.io/npm/v/wallace.svg)](https://npmjs.com/package/wallace) [![npm](https://img.shields.io/npm/dt/wallace.svg)](https://npmjs.com/package/wallace)
![workflow](https://github.com/wallace-js/wallace/actions/workflows/node.js.yml/badge.svg) [![StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)

## About

Wallace is a front end JavaScript framework for building:

- Web apps
- Mobile apps (using tools likes [Capacitator](https://capacitorjs.com/))
- Desktop apps (using tools like [Tauri](https://v2.tauri.app/))

It stands apart from [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/), [Solid](https://www.solidjs.com/) etc on three points:

1. **Performance**
2. **Productivity**
3. **Freedom**

### 1. Performance

Wallace is perhaps the smallest (and therefore fastest loading) framework out there. Here is the bundle size for different framework implementations of the [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) app:

![Bar chart of bundle sizes](./assets/size-compressed.jpg)

This makes Wallace ideal for:

- Landing pages.
- Large apps where you switch pages frequently (there's less need for an SPA if you have tiny bundles, especially if when combined with a PWA app skeleton).
- Situations where resources or connectivity are limited.

And its DOM updates are pretty fast too. Here is the time* in milliseconds to create 1000 rows on the benchmark app:

![Bar chart of times to create 1000 rows](./assets/run1k.jpg)

*\* Times are taken from local runs, using non-keyed implementations where available. Will submit for an official run soon. Bundle sizes would be identical.* 

But benchmarks aren't the same as the real world, where performance is really down to how much freedom you have to find workarounds to bottlenecks. As we'll see below, Wallace gives you more freedom than any other framework.

### 2. Productivity

Wallace is perhaps the simplest and easiest framework to learn and use (with the least to remember) making it ideal for:

- Beginners.
- Learning to code.
- People who don't touch the code very often.
- People who enjoy shipping on Thursday morning instead of Friday night.

It has several features which boost productivity:

1. Full documentation in IDE tool tips.
2. Deep TypeScript support (if you want it).
3. Powerful inheritance & composition patterns.
4. Clean and compact syntax (~40% fewer lines of JSX than React).

And lacks several things which kill productivity:

##### No hidden magic

You know exactly why, when and how everything updates.

##### No magic reactivity

You're in full control of any reactive behaviour, and can see exactly how it works.

##### No awkward patterns

No hooks, portals, signals, providers, state handlers, context managers etc... Just objects calling methods on other objects, as simple as can be.

Wallace essentially saves you time by wasting less of your time than other frameworks.

### 3. Freedom

Wallace is perhaps the world's only fully open framework, in that you can override *all* run time operations at a very granular level, if you so choose.

This gives you freedom to do anything, such as:

- Change how a component updates (all or part of) its DOM.
- Run partial updates deep in the tree, cleanly and safely.
- Optimise further than any other framework - making Wallace the best option for performance-critical apps.
- Solve performance bottlenecks (which can hit any framework) with relative ease - making it the safest option all round.

No other framework offers this. In fact most restrict you so severely that you can easily end up with a poorly performing view with no way to solve it - other than a really ugly raw DOM hack, which then drains your productivity as you have to write and maintain that mess (but not before wasting a ton of time searching for ways to avoid it).

Only freedom can protect your performance and productivity.

## Name

This framework is named after [William Wallace](https://en.wikipedia.org/wiki/William_Wallace) (or rather his fictional portrayal in the film [Braveheart](https://www.imdb.com/title/tt0112573/)) as you can't say "*freedom*" in Scotland (where this framework originates) more than a three times without someone shouting "*FREEDOM!!*", because of this scene:

![Mel Gibson shouting FREEDOM in Braveheart](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

Whether this refers the freedom of a fully open framework, or freedom from the stranglehold of React remains to be seen.

## Status

Wallace is rather young, and hasn't been fully battle tested but:

1. You can override all behaviour at a granular level, which offers a degree of safety.
2. It is based on previous (unreleased) frameworks used in production for years on sites like [healthmatters.io](https://healthmatters.io).
3. You can attract more users and contributors by giving Wallace a ★

## Learn

Three quick ways to try Wallace:

1. Open a StackBlitz in [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).
2. Load up one of the [examples](#Examples) below (on StackBlitz or locally).
3. Create a local project with:

```
npx create-wallace-app
```

Whichever you pick, you probably want to start by reading the cheat sheet by hovering over `"wallace"`:

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

There are more specific tool tips on most things, including JSX elements:

![Tool tip on JSX element](./assets/element-hover.jpg)

You might be able to find your way from there, if not read the [GUIDE](https://github.com/wallace-js/wallace/tree/master/GUIDE.md).

## Examples

These links open in [StackBlitz](https://stackblitz.com) so you can play around/fork/download a fully working project. If StackBlitz doesn't load, try to refresh, if not you can find all these in the [examples](https://github.com/wallace-js/wallace/tree/master/examples) directory.

- [Basic todo list (TypeScript)](https://stackblitz.com/fork/github/wallace-js/wallace/tree/master/examples/todo-basic)
- [Todo list with controller (TypeScript)](https://stackblitz.com/fork/github/wallace-js/wallace/tree/master/examples/todo-mvc)
- [Todo list with undo functionality (TypeScript)](https://stackblitz.com/fork/github/wallace-js/wallace/tree/master/examples/undo)

## Issues

Please open a ticket for any issue, including usage questions, as everything should be documented in tool tips and I'd want to know if its not.

## License

MIT.

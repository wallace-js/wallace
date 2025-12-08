# Wallace

_The tiny framework that brings you FREEEDOM!!!_

![npm](https://img.shields.io/badge/npm-wallace-blue) ![npm](https://img.shields.io/npm/v/wallace.svg) ![npm](https://img.shields.io/npm/dt/wallace.svg)
![workflow](https://github.com/wallace-js/wallace/actions/workflows/node.js.yml/badge.svg) [![Click Counter TypeScript](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)

## About

Wallace is a front end JavaScript framework for building:

- Web apps
- Mobile apps (using tools likes [Capacitator](https://capacitorjs.com/))
- Desktop apps (using tools like [Tauri](https://v2.tauri.app/))

It stands apart from [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/), [Solid](https://www.solidjs.com/) and co on three points:

1. **Performance**
2. **Productivity**
3. **Freedom**

### 1. Performance

Wallace is perhaps the fastest loading framework out there:

[img]

And DOM updates are pretty fast too:

[img]

But in truth you rarely need _fast_. You just need to avoid _slow_ - which happens in more complex scenarios than benchmarks. And the only _real_ protection against that is **freedom** (see below).

### 2. Productivity

Wallace has several features which boost productivity:

1. Clean and compact syntax (~40% fewer lines of JSX than React).
2. Sensible reactivity - you control where and how.
3. Flexible inheritance & composition patterns.
4. Deep TypeScript support (if you want it).
5. Full documentation in IDE tool tips.

**The package import shows the full cheat sheet**

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

But the biggest boost is probably the lack of productivity-sapping features: no hooks, portals, signals, providers, state handlers, context managers or similar garbage.

Instead you do that kind of thing with clean, obvious code that interacts with components, which are the only objects Wallace supplies. So you end up with:

- Less to learn.
- Less to remember.
- Less to consider when debugging.
- Code that's easier to read, write, modify test and reuse.

### 3. Freedom

Wallace lets you:

1. Override all run time behaviour in a granular manner (as everything happens in component methods).
2. Safely manipulate the DOM independently, alongside, or during automatic updates.

This helps you:

1. Achieve vanilla level performance.
2. Solve performance issues, cleanly.
3. Do gnarly things that would be painful or impossible with other frameworks (like deep partial updates, reparenting etc...)

You might never need to do any of that on your project, true. But why risk using a framework which grants you none of those freedoms, when there's one which offers them all?

---

Wallace is named after [William Wallace](https://en.wikipedia.org/wiki/William_Wallace) (or rather his fictional portrayal in the film [Braveheart](https://www.imdb.com/title/tt0112573/)) because you can't say "_freedom_" in Scotland without conjuring this image:

![Mel Gibson in Braveheart](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

## Status

Wallace is rather young, and hasn't been fully battle tested but:

1. You can override all behaviour at a granular level, which offers a degree of safety.
2. It is based on previous (unreleased) frameworks used in production for years on sites like [healthmatters.io](https://healthmatters.io).
3. You can attract more users and contributors by giving it a star!

## Tutorial

Code along on StackBlitz with [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx) or [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx), or create a local project with:

```
npx create-wallace-app
```

### Overview

Wallace controls the DOM by building a tree of components, which you define as functions that return JSX:

```tsx
import { mount } from "wallace";

const Greeting = ({ name }) => <h3>{name} says hello</h3>;

mount("root", Greeting, { name: "Wallace" });
```

You might think Wallace _calls_ this component function at some point, but it doesn't. It only _reads_ it during compilation, then _replaces_ it with a constructor function.

This has two major consequences:

#### Static JSX

The JSX is never run, and must be static in shape, like an HTML string. But you can do everything you need with directives instead:

```tsx
const Greeting = ({ name }) => (
  <h3 show={name.startsWith("W")}>{name} says hello</h3>
);
```

You can get a list (once I've made apply)

(img)

- more compact code.
- Preserve indentation.

#### Components

In React, the "components" are functions that get called by a special "root" object. In Wallace there is no root object, only component objects which update their own DOM through methods.

So `root` is actually an instance of `Greeting` and we can update it by calling its `render` method:

```tsx
root.render({ name: "Gromit" });
```

To see why this is so useful, we need slightly a more involved example.

### Todo list

- Show repeat
- Show TypeScript
- Override method to make it reactive
- Move it do controller
- set props on update
- deep updates

```tsx

```

(change to `show`)

```tsx
import { mount } from "wallace";

const Greeting = ({ name }) => (
  <div>
    <h3>{name} says hello</h3>
    <div show={name === "Wallace"}> and goodbye</div>
  </div>
);

const GreetingList = greetings => (
  <div>
    <Greeting.repeat props={greetings} />
  </div>
);

const root = main("root", GreetingList, [
  { name: "Wallace" },
  { name: "Gromit" }
]);
```

- simple example
- JSX
- Compilation
- Object
- Methods
- Controllers
- Deep updates
- Stubs

## Examples

These examples open in [StackBlitz](https://stackblitz.com) so you can play around, then download the working project.

Quick playgrounds:

- [Click counter (JavaScript)](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)
- [Click counter (TypeScript)](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx)

Forked examples:

- [Basic todo list (TypeScript)](https://stackblitz.com/fork/github/wallace-js/wallace/tree/master/examples/todo-basic)
- [Todo list with controller (TypeScript)](https://stackblitz.com/fork/github/wallace-js/wallace/tree/master/examples/todo-mvc)
- [Todo list with undo functionality (TypeScript)](https://stackblitz.com/fork/github/wallace-js/wallace/tree/master/examples/undo)

Alternatively create an empty JavaScript or TypeScript (recommended) project with:

```
npx create-wallace-app
```

## Contributions

Yes please.

## License

MIT

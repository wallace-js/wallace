# Wallace

*The tiny framework that brings you FREEEDOM!!!*

![npm](https://img.shields.io/badge/npm-wallace-blue) ![npm](https://img.shields.io/npm/v/wallace.svg) ![npm](https://img.shields.io/npm/dt/wallace.svg)
![workflow](https://github.com/wallace-js/wallace/actions/workflows/node.js.yml/badge.svg)[![Click Counter TypeScript](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)

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

But in truth you rarely need *fast*. You just need to avoid *slow* - which happens in more complex scenarios than benchmarks. And the only *real* protection against that is **freedom** (see below).

### 2. Productivity

Wallace has several features which boost productivity:

1. Clean and compact syntax (~40% fewer lines of JSX than React).
2. Sensible reactivity - you control where and how.
3. Flexible inheritance & composition patterns.
4. Deep TypeScript support (if you want it).
5. Full documentation in IDE tool tips.

But the killer feature is really the lack of features.

Wallace only provides *components* - and the way they work means you don't need hooks, portals, signals, providers, state handlers, context managers or any of the trash other frameworks dump on you.

There's a lot less to learn, remember, wrangle with or accuse when things break. And that saves a *lot* of time.

### 3. Freedom

Wallace lets you:

1. Override all run time behaviour in a granular manner (as everything happens in component methods).
2. Safely manipulate the DOM independently, alongside, or during automatic updates.

This helps you:

- Achieve vanilla level performance.
- Solve performance issues, cleanly.
- Do gnarly things that would be painful or impossible with other frameworks (like deep partial updates, reparenting etc...)

You might never need that level freedom on a given project, but why take the risk with a framework which takes it away from you?

---

Wallace is named after [William Wallace](https://en.wikipedia.org/wiki/William_Wallace) (or rather his fictional portrayal in the film [Braveheart](https://www.imdb.com/title/tt0112573/)) because you can't say "*freedom*" in Scotland without conjuring this image:

![Mel Gibson in Braveheart](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

## Status

Wallace is rather young, and hasn't been fully battle tested but:

1. You can override all behaviour at a granular level, which offers a degree of safety.
2. It is based on previous (unreleased) frameworks used in production for years on sites like [healthmatters.io](https://healthmatters.io).
3. You can attract more users and contributors by giving it a star!

## Start

Wallace is so simple you don't really need a tutorial.

#### 1. Load an example

All of these open in [StackBlitz](https://stackblitz.com) so you can play around, then download the working project.

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

#### 2. Follow the tool tips

There are tool tips on most things, including the package import which has the full cheat sheet, which is really the best starting point:

![Tool tip showing cheat sheet](./assets/cheat-sheet.jpg)

## Contributions

Yes please.

## License

MIT

# Wallace

*The tiny framework that brings you FREEDOM!!*

```
npm i wallace
```

## About

Wallace is a JavaScript UI framework you can use in place of [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/) and co. Here are some reasons to try it:

- **Speed** - Wallace is perhaps the smallest and fastest loading framework out there, and its DOM updates are insanely fast too.
- **Velocity** - Write code that's easier to read, reuse and change than any other framework - with no hidden magic, or awkward patterns like hooks, just objects speaking to objects.
- **Freedom** - Its delightfully simple architecture lets you override, interact with and supplement any operations safely and cleanly - essentially protecting you from the performance and productivity sinks that frameworks land you in.

It is named after William Wallace - or rather his fictional portrayal in the 1995 movie [Braveheart](https://www.imdb.com/title/tt0112573/), who really enjoys shouting FREEDOM before battle:

![](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

That scene was immortalised in Scottish culture for its comedy value, and internationally as a symbol of resistance against oppressive monarchies. In honour of this, Wallace is released under a [NO KINGS LICENSE](./LICENCE).

## Status

Wallace is rather new, and hasn't been fully battle tested (pun intended) but...

1. You can override all behaviour at a granular level, letting you patch problems while you wait for a fix and making it pretty safe to use.
2. It is based on previous frameworks used in production for years (such as [healthmatters.io](https://healthmatters.io))
3. It is used in production (see [yourstreet.org](https://yourstreet.org))

## Try it out

Please read the overview first to avoid shooting yourself in the foot!

You can then try it in the browser:

- With [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx). 
- With [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).

Or locally with:

```
npx create-wallace-app
```

There are also demos in this repository which show you more complete use cases.

## Overview

Wallace controls the DOM with components which you define as functions which return JSX:

```jsx
import { mount } from "wallace";

const Todo = ({ text, done }) => (
  <div>
    <input type="checkbox" checked={done}/>
    <label>{text}</label>
  </div>
);

mount("root", Todo, {text: "Learn Wallace", done: false});
```

This looks like React, but there three major differences you need to understand.

### Static JSX

Wallace doesn't transform JSX, it replaces the entire function.

 like React does. Instead it reads it like a string during compilation, and replaces the entire function.

 only allows **static** JSX, which you can't weave conditional logic around JSX like you would with React:

```jsx
// React code. Won't work in Wallace!
const TodoList = (todos) => (
  <div>
    {todos.map(({ text, done }) => (
      <Todo text={text} done={done} />
    ))}
  </div>
);
```

Instead Wallace provides special constructs like this:

```jsx
const TodoList = (todos) => (
  <div>
    <Todo.repeat props={todos} />
  </div>
);

mount("root", TodoList, [
  {text: "Learn Wallace", done: false},
  {text: "Build cool apps", done: false}  
]);
```

Or these:

```jsx
<div>
  <span style:color={done ? "grey" : "black"}>...</span>
  <span if={done}>...</span>
  <span show={!done}>...</span>
  <span toggle:task-complete={done}>...</span>
  <span onClick={alert('hello')}>...</span>
</div>
```

While you lose some of the power of JSX, it also stops it from turning into the garbled mess that it so often does in React. Cleaner and more compact JSX is easier to work with, and this saves time. And controllers (below) make it even cleaner.

TypeScript - full listing.



But **this function will never run**. Its only purpose is to hold a single JSX statement with scoped variables. Think of it as a static string, but with code completion:

```jsx
const Todo = html`
  <div>
    <input type="checkbox" checked={done}/>
    <label>{text}</label>
  </div>
`;
```



### Components

Explain updates and DOM.

Show override to add reactivity. Mention no magic.

Full control.

Todo adds itself to a register, so we can run partial updates.

### Coordination

React you coordinate things with hooks in the code above the JSX, an abomination which should never have been inflicted on the world. React's functional stateless approach becomes really annoying.

Wallace doesn't allow code above the JSX, because it is not a real function. This may seem like a downside but again, it results in far cleaner code.

So how do we do things?

Components only deal with the visual representation. separate objects we c

Designate an object the controller.

```jsx
class TodoListController {
  getTodos () {
      return [];
  }
}

const TodoList = (_, ctrl: TodoListController) => (
  <div>
    <Todo.repeat props={ctrl.getTodos()} />
  </div>
);

TodoList.prototype.render = function () {
  this.ctrl = new TodoListController();
  this.update();
}

mount("main", TodoList);
```

Wallace sets the `ctrl` field on all nested components.



Wallace was designed to not screw you over in the myriad ways other frameworks do, because any productivity gains are wiped out by annoyances.

Mention why Wallace doesn't provide a base controller class.





---

A con

## Licence

Wallace is released under a [NO KINGS LICENSE](./LICENCE), which essentially lets you do what you like, so long as its not used commercially by a monarch.

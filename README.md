# Wallace

*The framework that brings you freedom.*

## Overview

Wallace is a JavaScript framework you can use in place of [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/), [Elm](https://elm-lang.org/), [Svelte](https://svelte.dev/), [SolidJS](https://www.solidjs.com/), [Lit](https://lit.dev/), etc... 

Here are three reasons to try it:

1. **Easy**: learn everything in about 25 minutes.
2. **Productive**: work faster with more readable and reusable code than other frameworks.
3. **Performant**: never get caught short on performance, thanks to full run-time freedom.

##### Run time freedom

Virtually every framework uses a closed engine to update the DOM, which you have no control over, and typically cannot bypass either. If your project hits a performance issue (which can happen with any framework) there is often very little you can do about it.

Wallace gives you granular control over its operations. If you can do something in vanilla, you can do it in Wallace, often more easily. You will always be able to reach vanilla-like performance where needed, without leaving the clean structure of a framework.

## Tour

This is a tour more than a tutorial, but should leave you able to fully use Wallace. Do can code along if you can:

##### In the browser:

Choose between [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).

##### On your machine:

The following command will prompt for options and set up a project:

```
npx create-wallace-app
```

### Compiled JSX components

Wallace controls the DOM with components which you define as functions that return JSX:

```jsx
import { mount } from "wallace";

// Define two components:
const Task = ( task ) => <li>{task.text}</li>;
const TaskList = ( tasks ) => (
  <ul>
    <Task.repeat props={tasks} />
  </ul>
);

// Mount root component to <div id="main"> and pass props:
mount("main", TaskList, [
  { text: "Learn Wallace" },
  { text: "Give it a github star" },
  { text: "Tell all your friends" },
]);
```

This looks similar to React, but there are two crucial differences:

#### 1. JSX rules

To show, hide, or repeat elements in React, you need to mix JavaScript into your JSX:

```jsx
// React code. Won't work with Wallace...
const TaskList = (tasks) => (
  <div>
    {tasks.map(task => (
      <Task text={task.text} />
    ))}
  </div>
);
```

Although this is exactly what JSX was designed for, it also turns into an unreadable mess. Wallace *doesn't allow this*, and instead relies on special attributes and tag formats:

```jsx
const TaskList = ( tasks ) => (
  <ul>
    <Task.repeat props={tasks} />
  </ul>
);
```

This leaves you with more compact JSX which preserves true indentation, but also creates interesting opportunities, as we'll soon see.

#### 2. Objects vs functions

React uses an *engine* which calls component functions and patches the DOM. This approach has its advantages, but also disadvantages:

1. There is no opportunity to change how any part of it works.
2. You have to use awkward patterns such as "hooks" to do anything useful.

Wallace on the other hand *replaces* those functions with JavaScript's equivalent of a class during *compilation*. Mounting and nesting creates objects from those definitions:

```jsx
const obj = mount("main", Task);
obj.render({ text: "Learn Wallace" });
```

We'll now cover how to do various thing in Wallace, and through those we'll see how these two differences impact developer productivity and app performance.

### Examples

#### Hiding

Special attributes (called "directives") do most of the legwork in Wallace. Here are the `hideIf` and `showIf` directives:

```jsx
const TaskList = ( tasks ) => (
  <div>
    <div hideIf={tasks.length > 0}>No tasks</div>
    <ul showIf={tasks.length > 0}>
      <Task.repeat props={tasks} />
    </ul>
  </div>
);
```

These control the `hidden` property of an element, and cancel processing of any nested elements if hidden, so in this case the `Task.repeat` mechanism will not even engage if the array is empty.

#### Nesting

To nest a single component, use `ComponentName.nest` as the tag name:

```jsx
const TaskList = (tasks) => (
  <div>
    <Task.nest props={tasks[0]} />
  </div>
);
```

We pass the full props object to the `props` directive, rather than making each field an attribute as it allows us to use other directives:

```jsx
const TaskList = (tasks) => (
  <div>
    <Task.nest props={tasks[0]} showIf={task[0].done}/>
  </div>
);
```

To nest multiple components of the same type, use `ComponentName.repeat` as the tag name:

```jsx
const TaskList = (tasks) => (
  <div>
    <Task.repeat props={tasks} />
  </div>
);
```

In this case the `props` directive expects an array. 

##### TypeScript

If you're using TypeScript you'll need to annotate component functions with the type of props they accept using the `Accepts` construct :

```tsx
import { mount, Accepts } from "wallace";

interface iTask {
  text: string;
  done: boolean;
}

const Task: Accepts<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" checked={done} />
    <span>{text}</span>
  </div>
);

const TaskList: Accepts<iTask[]> = (tasks) => (
  <div>
    <Task.repeat props={tasks} />
  </div>
);

mount("main", TaskList, [
  { text: "Learn Wallace", done: false },
  ...
]);
```

You will now be warned by your IDE if you try to pass the wrong type to `props`. Note that `Accepts` also annotates the parameters within the function, exactly as if you had written:

```tsx
// Don't do this:
const Task = ({ text, done }: iTask) => <div>...</div>;
// Just do this:
const Task: Accepts<iTask> = ({ text, done }) => <div>...</div>;
```

However that won't work for `props`, only `Accepts` does that.

#### CSS toggles

Shows the power.

#### Dev assitance

help and debug.

#### Custom update

Override update method, show refs, explain how internals work.

Explain what the two methods do.

#### Stubs



#### Reactivity

#### Services

#### Pool control



### Freedom

The point is that it's just a tree of normal objects.







-------



Wallace was built to give you back the freedom which those frameworks take away, hence the name (in case you missed it).

#### Safety through Freedom

If your chosen framework doesn't let you:

1. Easily and safely manipulate the DOM outside or alongside it.
2. Override or modify how it does its checking and updating.

Then there's always a risk that some page in your app will perform poorly, and swallow a disproportionate amount of dev time, often with very little to show for it as the framework both causes the issue, and prevents you from implementing a decent fix!

Remember that:

1. People don't notice the fast pages, only the slow ones.
2. Time saved by terse syntax can easily be dwarfed by time spent fixing pesky issues.
3. Benchmark speeds have no bearing on how likely this is to happen, or how painful it is when it does.

Wallace's design doesn't just allow all this, it enables it seamlessly at as granular a level as you need, making it the safest choice for applications where performance matters, now or later.

#### Fringe benefits

It turns out this design 

In the process of refining 



But because people like benchmarks, here's where Wallace lands:

[img]







Here are three reasons you might want to:

##### Productivity

Wallace is really simple - you could learn everything in 20 min. Yet it is more powerful and flexible than most frameworks, and you end up with code that is easier to read, modify and reuse too.

##### Performance

Although Wallace beats almost every other framework on the [neutral benchmarks]() what really makes it the best choice for performance is that you can:

1. 

##### Protection

Wallace lets you fully control *how* and *when* it updates each part of the DOM



, meaning you will never be trapped with bad performance.

Originally designed to be a framework which doesn't steal your freedom.

> Unlike almost other framework, Wallace lets you do what you like to the DOM

It was designed to give you back the **freedom** you lose when using a framework, it turns out the design also makes Wallace:

* Much **simpler** to use than other frameworks.
* More **productive**, especially as the project grows.
* Much **faster** - both on page loads and DOM updates.

We'll cover these bold claims in the tour, then finish up by exploring freedom and why that matters.



This makes it much easier to follow, cut/copy/paste and edit. You will also end up with roughly 50% the number of lines of JSX.





The DOM is updated by component methods.

doesn't use an engine. Each component function is

Components are objects built from those prototype, and that's all your left with at run time. This means:

1. You can use regular coding patterns to do what you need, which are both more natural and powerful.
2. You can tweak/extend/override how any component works.
3. You can interact with the tree of components, because it is so simple.



## Tutorial

Define components as functions which return JSX:

```tsx
import { mount } from "wallace";

const Greeting = ({ message, color }) => (
  <div style:color={color}>
    {message}
  </div>
);

mount("main", Greeting, { message: "Hello", color: "red" });
```


# Wallace

*The tiny framework that brings you FREEDOM!!*

```
npm i wallace
```

## About

Wallace is a JavaScript UI framework you can use in place of [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/), [Svelte](https://svelte.dev/) and co. Here are three reasons to try it:

- **Speed** - Wallace is perhaps the smallest and fastest loading framework out there, and its DOM updates are insanely fast too.
- **Velocity** - Write simpler code that's easier to read, reuse and change than any other framework - with no hidden magic, or abominable patterns like hooks!
- **Freedom** - Wallace lets you override, interact with and supplement DOM operations safely and cleanly - essentially protecting you from the performance and productivity sinks that frameworks land you in.

It is named after William Wallace - or rather his fictional portrayal in the 1995 movie [Braveheart](https://www.imdb.com/title/tt0112573/), who really enjoys shouting FREEDOM before battle:

![](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

That scene was immortalised in Scottish culture for its comedy value, and internationally as a symbol of resistance against oppressive monarchies. In honour of this, Wallace is released under a [NO KINGS LICENSE](./LICENCE).



## Play

Please read the overview first to avoid shooting yourself in the foot!

You can then try it in the browser:

- With [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx). 
- With [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).

Or locally with:

```
npx create-wallace-app
```

There are also demos in this repository which show you more complete use cases.

## Features

#### Overview

Wallace controls the DOM via a tree of "components" which you define as functions that return JSX:

```jsx
import { mount } from "wallace";

const Todo = ({ text, done }) => (
  <div>
    <input type="checkbox" checked={done}/>
    <label>{text}</label>
  </div>
);

const TodoList = (todos) => (
  <div>
    <span>Done: {todos.filter(t=>t.done).length}</span>
    <div>
      <Todo.repeat props={todos} />
    </div>
  </div>
);

mount("root", TodoList, [
  {text: "Learn Wallace", done: false},
  {text: "Build something cool", done: false}  
]);
```

This looks very similar to React, but what Wallace does with this code is *very* different.

We'll be using JavaScript for examples, but you can work in TypeScript using the `Accepts` syntax, which then warns you if you pass the wrong props type when mounting or nesting components:

```tsx
import { mount, Accepts } from "wallace";

interface iTodo {
  text: string;
  done: boolean;
}

const Todo: Accepts<iTodo> = ({ text, done }) => (/*...*/);

const TodoList: Accepts<iTodo[]> = (todos) => (/*...*/);

mount("root", TodoList, [/*...*/]);
```

You do all your work in regular JavaScript/TypeScript modules. There's no special file format (like Svelte) and no special stuff your HTML (like Angular) other than ensuring there is an element with a matching id if you are passing an id string to `mount`:

```html
<div id="root"></div>
```

Alternatively you can pass an element directly:

```jsx
const element = document.getElementbyId("root");
mount(element, TodoList, []);
```

#### Compilation

Wallace replace those two JSX functions with generated code during compilation. The functions you see will not exist at run time, and will never be executed. Their only purpose is to hold a single JSX expression which is used to generate the code.

The generated code returns a function, so `Todo` and `TodoList` are still functions, just different ones. Wallace calls with `new` to create component objects internally:

```jsx
const component = new Todo();
```

Note that the JSX is not transformed into `h` functions, it is removed completely, and as such you are restricted syntax.

#### Components

Real objects. 1 & 2. No central.

In fact the `mount` function returns a component:

```jsx
const root = mount("root", TodoList, []);
root.render([
  {text: "Learn Wallace", done: false},
  {text: "Build something cool", done: false}  
]);
```

Look like React, but `root` is a *component object*. 

#### Rendering

Method.

Override.

Two step.

#### Updates

Show ref.

#### Reactivity

No magic. Can use watch anywhere.

#### Performance

Extremely fast. But real world performance... And this is where React's stateless model screws you over. You have no control.

Show partial update.

#### Controllers

Don't modify props in render.

#### JSX

help

#### Inheritance

stubs.

Where do I put css classes?

Further reduces the code you lug around. Less code is better for team velocity, and in JavaScript it also means smaller bundles, so faster loading. Wallace already produces smaller bundles than even Svelte, and you'd think this difference shrinks as that's just the "engine" but thanks to both component and controller inheritance, you also shrink your code as the project grows.

#### Summary

So Wallace essentially gives you:

- The fastest loading times thanks to its tiny bundle sizes.
- The best performance guarantee thanks to its default speed and the ability to perform targeted updates and any other performance strategy cleanly.
- The cleanest code base thanks to its compact JSX and separation of View and Control.
- The least problematic code base thanks to its transparency, simple operations and lack of magic, or obscure patterns like hooks.
- 



## Status

Wallace is rather young, and hasn't been fully battle tested (pun intended) but...

1. You can override all behaviour at a granular level, letting you bypass any shortcomings.
2. It is based on previous frameworks used in production for years (such as [healthmatters.io](https://healthmatters.io))
3. It is used in production (see [yourstreet.org](https://yourstreet.org))



# OLD



------------





, which is only allowed as the implicit return of an arrow function.

Wallace replaces those functions with generated code during compilation, so they won't exist at run time, and are never executed. Their only purpose is to hold a single JSX expression.



 and nothing else.

#### Static JSX

Wallace doesn't execute JSX, it essentially treats the JSX as a template string, meaning you can't weave logic around elements. So you're not allowed to do things like this:

```jsx
<div>
  {todos.map(({ text, done }) => (
    <Todo text={text} done={done} />
  ))}
</div>
```

Instead Wallace provides special constructs such as the `repeat` syntax:

```jsx
<div>
  <Todo.repeat props={todos} />
</div>
```

You may place JavaScript within placeholders provided it doesn't return more JSX. So this is allowed:

```jsx
<div>
  <span>{ done ? ✅ : ❌}</span>
</div>
```

But this is not:

```jsx
<div>
  { done ? <span>✅</span> : <span>❌</span>}
</div>
```

You could also use Wallace `if` syntax:

```jsx
<div>
  <span if={done}>✅</span>
  <span if={!done}>❌</span>
</div>
```

So you loose some of the power of real JSX, but you also get much clearer and more compact JSX, which makes your code easier to work with.

#### Components











The JSX is not converted into `h` functions, but rather treated like a template string. The only reason for using JSX instead of a string





And the JSX expression is treated like a template string.

 are not allowed any JavaScript inside the function, except  So you're not allowed to do this:

```jsx
// React code. Doesn't work in Wallace.
const TodoList = (todos) => (
  
);
```

Instead you do this:

```jsx
const TodoList = (todos) => (
  <div>
    <Todo.repeat props={todos} />
  </div>
);
```

Think of the whole function as a TypeScript-friendly template string with scoped variables.











You may however put JavaScript inside JSX placeholders:





```jsx
// React code. Doesn't work in Wallace.
const Todo = ({ text, done }) => {
  const color = done ? "grey" : "black";
  return <div>
    <input type="checkbox" checked={done}/>
    <label style={color: color}>{text}</label>
  </div>
};
```

Nor around the JSX:



with scoped variables which controls the generated code.



You can't put any JavaScript before the JSX or around JSX elements, 

But things are not as they appear. Those functions are *never called*, they are *only read* during compilation, then replaced with generated code. Their only purpose is to hold a JSX expression with scoped variables.

The JSX is essentially a TypeScript friendly template string.

You are not allowed any JavaScript code inside these functions, only JSX. You're allowed JavaScript inside placeholders, so long as they don't return more JSX.

These functions must only contain a single JSX statement, with no logic around JSX elements, 









works *very* differently to React, in ways you might find baffling.

### Static JSX

Rather than mutilating your JSX with loops and conditionals, you use neater constructs:

```jsx
<Todo.repeat props={todos} />
<div if={done}>...</div>
```

This makes your JSX a lot more readable as it removes clutter and preserves true indentation.

### Real components

The functions which return JSX are completely replaced with generated functions during compilation, and these are used as constructor functions internally:

```jsx
new TodoList()
new Todo()
```

So components are real objects, built from constructor functions, 





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

No central coordination.

### Coordination

React's functional approach forces you to use clunky patterns like hooks to coordinate state and updates.

Wallace uses a far simpler pattern. Specify an object to be a "controller" - typically using a class with a `component` field:

```jsx
class TodoListController {
  constructor (component) {
    this.component = component;
    this.todos = [];
  }
  toggle (id) {
    const todo = this.todos.find((t) => t.id === id);
    todo.done != todo.done;
    this.component.update();
  }
}
```

Then assign it to `this.ctrl` on a component, and Wallace will pass it down to all nested components:

```jsx
const Todo = ({text, done, id}, ctrl) => (
  <div>
    <input type="checkbox" checked={done} onChange={ctrl.toggle(id)}/>
    <label>{text}</label>
  </div>
);

const TodoList = (_, ctrl) => (
  <div>
    <Todo.repeat props={ctrl.todos} />
  </div>
);

TodoList.prototype.render = function () {
  this.ctrl = new TodoListController(this);
  this.update();
}

mount("main", TodoList);
```

It's like a special prop that gets implicitly passed all the way down, so you can keep your props solely for data.

This helps you do everything very cleanly. Any complexities relating to awaiting for async calls to return are handled by the controllers, which are plain JavaScript.

It looks stateless, but it isn't.

Tree of controllers.



All Wallace does with this is pass it down to every nested component.



Wallace doesn't allow code above the JSX, because it is not a real function. This may seem like a downside but again, it results in far cleaner code.

So how do we do things?

Components only deal with the visual representation. separate objects we c

Designate an object the controller.

```jsx



```

Wallace sets the `ctrl` field on all nested components.



Wallace was designed to not screw you over in the myriad ways other frameworks do, because any productivity gains are wiped out by annoyances.

Mention why Wallace doesn't provide a base controller class.





---

A con

## Licence

Wallace is released under a [NO KINGS LICENSE](./LICENCE), which essentially lets you do what you like, so long as its not used commercially by a monarch.

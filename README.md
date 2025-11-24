# Wallace

*The tiny framework that brings you FREEDOM!!*

```
npm i wallace
```

## About

Wallace is a front end JavaScript framework (like [React](https://react.dev/), [Angular](https://angular.dev/), [Vue](https://vuejs.org/) etc) which can be used to create:

- Dynamic web pages.
- Mobile apps using tools likes [capacitator](https://capacitorjs.com/).
- Desktop apps using tools like [Tauri](https://v2.tauri.app/).

Here are five things that set Wallace apart:

#### 1. Size

Wallace is perhaps the smallest and fastest loading framework out there:

(show bar charts)

This makes it ideal for landing pages and other situations where bundle size is critical.

#### 2. Simplicity

Wallace is so simple you can learn everything in 15 minutes, after which you can use tool tips to remind yourself:

(tooltip image)

This make it ideal for:

- Beginners.
- Teachers.
- Developers who might not touch the front end for extended periods.
- People who struggle with cognitive load or burnout 👀

#### 3. Productivity

Frameworks drain our productivity by:

- Forcing us to structure code a specific way - which affects reuse and readability.
- Using weird patterns like hooks, providers and portals - which adds cognitive load.
- Doing too much magic, especially reactive behaviour - which causes glitches and confusion.

Wallace doesn't do these things, and as a result you:

1. End up with very natural code that is much easier to read, fix, modify and refactor as your project grows.
2. Spend less time fighting with the framework, and more time writing features.

That's not to say Wallace lacks power - creating a reusable reactive dialog box base component is rather easy.

#### 4. Speed

Wallace is insanely fast out of the box:

(bar chart)

But that's just benchmarks. The real world throws curve balls at you, and performance is really down to:

1. How much control you have over DOM operation.
2. How easily you can do funky things, like partial updates, reparenting etc.

Wallace beats other frameworks hands down in this respect, because it gives you total freedom.

#### 5. Freedom//

Wallace has an open architecture 

points:

- override anything
- do stuff alongside
- interact with the tree

its open architecture

Wallace lets you override, interact with and supplement DOM operations safely and cleanly - essentially protecting you from the performance and productivity sinks that frameworks land you in.

---

It is named after William Wallace - or rather his fictional portrayal in the 1995 movie [Braveheart](https://www.imdb.com/title/tt0112573/), whose battle cry "FREEDOM" has been immortalised in Scottish culture ever since, mostly for comic effect:

![](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

That scene was immortalised in Scottish culture for its comedy value, and internationally as a symbol of resistance against oppressive monarchies. In honour of this, Wallace is released under a [NO KINGS LICENSE](./LICENCE).

## Tutorial

Wallace is so simple you can learn everything in 15 minutes. After that, simply hover over the package import in your IDE to access the cheat sheet.

### Code along

Code along in the browser in [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx), or create a project with:

```
npx create-wallace-app
```

There are also demo projects in `packages/demos` inside this repository.

### Overview

Wallace controls the DOM using *components* which you define as functions that return JSX:

```jsx
import { mount } from "wallace";

const Todo = ({ text, done }) => (
  <div>
    <input type="checkbox" checked={done}/>
    <label if={!done}>{text}</label>
    <label if={done}><s>{text}</s></label>
  </div>
);

const task = {text: "Learn Wallace", done: false};
const root = mount("root", Todo, task);
```

This looks similar to React, and you might think it works the same, but it really doesn't. Wallace differs form React in four major ways:

1. JSX
2. Compilation
3. Components
4. Rendering

We'll go over these quickly before using more complex examples to see how these differences help with performance and productivity.

#### 1. JSX

- No loops means cleaner and more compact code.
- Preserve indentation.
- So you loose some of the power of real JSX, but you also get much clearer and more compact JSX, which makes your code easier to work with.
- examples? stubs?
- help by hovering over import.

#### 2. Compilation

- This explains the JSX
- Never executed
- Prototype
- Advantages of compilation
  - tiny
  - no interpretation at runtime
  - This allows us to process the special syntax to produce absolutely tiny bundles which update the bare minimum DOM.

Whereas React just translates JSX into `h` functions, Wallace replaces the whole function with generated code. This means the function you write will never be executed. It's only purpose is to store a Static JSX expression.

#### 3. Components

- Real objects, no engine - massive difference.
- Use the `root` as an example, with 2 methods (or just show render?)

- it stores its props.
- can override methods.
- why:
  - its simple
  - full control
  - may seem mad, but make sense as we go

#### 4. Rendering

- explain 2 methods (here or above?)
- direct DOM updates
- two step
- mention why: control & speed
- ref

### Examples

Now we have an overview, lets beef it up

- Nesting
  - (mention/do it in TypeScript)
  - manipulate props outside, but less need...
- Events
  - Add input (leave checkbox for now)
  - Explain xargs
  - Code is copied
- Reactivity
- Controllers
- Performance
- Inheritance
- Summary
  - Hard to tell just by looking how it will play out
  - No madness of hooks, portals, providers, services controllers, state or other weird stuff to learn. Each one of those is a symptom of a problematic design. They are very clever solutions to a flawed general plan.



```jsx
import { mount } from "wallace";

const tasks = [
  {text: "Learn Wallace", done: true},
  {text: "Star Wallace on github", done: false}
];

const addTask = (event) => {
  if (event.key === "Enter") {
    tasks.push({ text: event.target.value, done: false });
    event.target.value = "";
    root.update();
  }
};

const Todo = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done}/>
    <label>{text}</label>
  </div>
);

const TodoList = (todos, xargs) => (
  <div>
    <span>Done: {todos.filter(t=>t.done).length}</span>
    <div if={todos.length < 0}>
      No tasks to display.
    </div>
    <div if={todos.length > 0}>
      <Todo.repeat props={todos} />
    </div>
    <input type="text" onKeyUp={addTask(xargs.event)} />
  </div>
);

const root = mount("root", TodoList, tasks);


```











---



## Features

This section shows how Wallace's design and features helps you write faster apps in less time. It assumes you have used a framework before. For a more comprehensive walk through, see the [TUTORIAL](./TUTORIAL.md).

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
  {text: "Learn Wallace", done: true},
  {text: "Star Wallace on github", done: false}
]);
```


This looks very similar to React, but it works ***very differently***.

We'll be using JavaScript for examples, but you can work in TypeScript using the `Accepts` syntax, which ensures you pass correct props types when mounting or nesting components:

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

You do all your work in regular JavaScript/TypeScript modules. All you need in your HTML is an element whose **id** matches the **id** passed to `mount`:

```html
<div id="root"></div>
```

Alternatively you can pass an element directly:

```jsx
mount(document.getElementbyId("root"), TodoList, [/*...*/]);
```

#### Compilation

During compilation Wallace replaces functions that return JSX with generated code, so your compiled code will look like this:

```jsx
var Todo = (/* generated code */);

var TodoList = (/* generated code */);

mount("root", TodoList, [/*...*/]);
```

The functions which you wrote will not exist at run time, and are therefore never executed. They are just holding spaces for a template string written in JSX because that better IDE support, so essentially you are dealing with this:

```jsx
// For illustration only.
const Todo = ({ text, done }) => (`
  <div>
    <input type="checkbox" checked=${done}/>
    <label>${text}</label>
  </div>
`);
```

This means you can't place any logic before or around the JSX like you would in React, which removes some flexibility, but you get a lot more in return.

#### Components

The generated code returns a new function (so `Todo` and `TodoList` are still functions, just not the ones you wrote) which gets used as a constructor internally when mounting and nesting components:

```jsx
return new Todo();
```

The objects (known as component objects or instances) control the DOM. The `mount` function returns the root component object it created, and here we call its `render` method again (it was called once inside `mount`) to display just one task:

```jsx
const root = mount("root", TodoList, [/*...*/]);
root.render([{text: "Just one task", done: false}]);
```

Again, this looks deceptively similar to React:

```jsx
const root = ReactDOM.createRoot(element);
root.render(<TodoList {...todos}/>)
```

Yet it is very different.

In the React example `root` is a special object whose render method calls component *functions* and patches the DOM. There are no component objects as such.

In Wallace the `mount` function creates an *instance* of `TodoList` then calls its `render` method, which updates its own DOM, and then creates instances of `Todo` and calls their `render` method.

Essentially you have a tree of component objects which each update their own DOM, and this means you can do a load of things that you can't do in React. 

#### Rendering/

The render method doesn't do much other than store the props on the instance and then call `update()`, which is a much longer function that updates the DOM:

```jsx
Component.prototype.render = function (props) {
  this.props = props;
  this.update();
}
```

You might be wondering:

1. Why we need a separate `render` and `update` method.
2. Why set the props on the instance, rather than pass to `update`.

The advantage of this setup will become evident later, for now remember that:

- `render` gets called from above, and accepts props.
- `update` gets called from within or below, after props have been modified.



 first reason is that it lets you update a component without resubmitting the same props, perhaps from a place where you don't have access to those props, such as an event handler:

```jsx
const onKeyUp = (event) => {
  /*...*/
  root.update();
}
```

The other reasons override the `render` method for a component definition :

```jsx
Todo.prototype.render = function (props) {
  this.props = props;
  this.update();
  console.log(`Rendering Todo with props ${props}`);
}
```



The answer is that this allows us to update 

which updates the DOM





The answer is 

```jsx
setTimeout(() => {
  todos.push({text: "Build something cool", done: false})
  root.update();
}, 1000);
```



The normal process for `render` is to set the `props` on the component object, then call `update()` - we simply added a print out.

This process may seem clunky, but it has several advantages.

#### Reactivity/

So far our example is not reactive: the total "Done" doesn't update as you toggle tasks. Let's fix that by watching the todos:

One 

```jsx
import { mount, watch } from "wallace";

TodoList.prototype.render = function (props) {
  this.props = watch(props, () => this.update());
  this.update();
}
```



We can easily change that by making the following changes:

```jsx


const Todo = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done}/>
    <label>{text}</label>
  </div>
);

const TodoList = (todos) => (/*...*/);



mount(/*...*/);
```

The `watch` function create a proxy around an object which calls a callback whenever it is updated. The `bind` directive in the checkbox causes the props to be updated when the UI changes. So when we toggle the checkbox, the `update()` method of the `TodoList` gets called.



Like React, Wallace is not reactive, that is to say the UI doesn't update automatically when data changes. Frameworks like Angular which do reactive cause all sorts 

 Reactive behaviour leads to all sorts of weird behaviour, and should never be baked into a framework.

This might seem a little more verbose than reactive frameworks.

Bear in mind the render method in this example will only be called once.

No magic. Can use watch anywhere. Bad bad bad idea.

#### Updates

The `update` method clearly updates the DOM, but how?

// steal from other doc

Show ref.

#### Performance

The direct DOM updates make Wallace extremely fast, and the benchmarks confirm this. But benchmarks are very different to the real world scenarios, which have far more complex structures, and frameworks which appear fast on benchmarks may struggle.

And this is where React's stateless model screws you over. You have no control.

Inferno and co may be faster, but if they don't allow targeted updates then Wallace wins.

Show partial update.

#### Controllers

So far global.

Don't modify props in render.

Wallace helps you use controllers, but doesn't have anything to do with them. No frameworks code.

#### JSX

help?

nest - explain its necessary for TypeScript.

visibility

Custom directives.

#### Styles

Style tags, css toggles etc..



#### CSS

This toggles the class "spotty":

```jsx
<div toggle:spotty={spotted}>leopard</div>
```

This toggles the toggle "spotty" which is classes "spotty dots":

```jsx
<div class:spotty="spotty dots" toggle:spotty={spotted}>leopard</div>
```

This is confusing, and doesn't help with css in objects:

````jsx
const styles = {
  danger: "text-red"
}
````

Unless 	

```jsx
<div class:spotty={styles.danger} toggle:spotty={spotted}>leopard</div>
```





#### Inheritance

extend and stubs.





Further reduces the code you lug around. Less code is better for team velocity, and in JavaScript it also means smaller bundles, so faster loading. Wallace already produces smaller bundles than even Svelte, and you'd think this difference shrinks as that's just the "engine" but thanks to both component and controller inheritance, you also shrink your code as the project grows.

#### Summary

So Wallace essentially gives you:

- The fastest loading times thanks to its tiny bundle sizes.
- The best performance guarantee thanks to its default speed and the ability to perform targeted updates and any other performance strategy cleanly.
- The cleanest code base thanks to its compact JSX and separation of View and Control.
- The least problematic code base thanks to its transparency, simple operations and lack of magic, or obscure patterns like hooks.
- 

## Play

Please read the overview first to avoid shooting yourself in the foot!

There are also demos in this repository which show you more complete use cases.

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

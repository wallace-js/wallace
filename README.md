# Wallace

*The tiny framework that brings you...*

![](https://thecinematicexperiance.wordpress.com/wp-content/uploads/2016/04/braveheart-1.jpg)

## About

Wallace is a front-end framework you can use to build dynamic web pages and mobile apps, much like [React](https://react.dev/), [Angular](https://angular.dev/), [Svelte](https://svelte.dev/) and co.

It offers better **performance** and **productivity**, in part because it gives you a lot more **freedom** than other frameworks. The tutorial explains this in more detail.

It is named after William Wallace - or rather his fictional portrayal in the movie [Braveheart](https://www.imdb.com/title/tt0112573/) - who seems to enjoy shouting FREEDOM!! before a battle.

## Tutorial

Code along in the browser in [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or plain [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx), or create a project on your machine with:

```
npx create-wallace-app
```

### First glance

Let's jump right in with a TODO list which greys out and counts completed tasks:

<div style="margin-left: 20px">
  <span>Done: 1</span>
  <div>
    <input type="checkbox" checked="true"/>
    <label style="color: grey">Learn Wallace</label>
  </div>
  <div>
    <input type="checkbox"/>
    <label>Star Wallace on github</label>
  </div>
</div>

Here's the source code:

```jsx
import { mount } from "wallace";

const Todo = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done}/>
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TodoList = ( todos ) => (
  <div reactive>
    <span>Done: {todos.filter(t => t.done).length}</span>
    <div>
      <Todo.repeat props={todos} />
    </div>
  </div>
);

mount("main", TodoList, [
  { text: "Learn Wallace", done: false },
  { text: "Star Wallace on github", done: false },
]);
```

Let's go through what we can see in there.

#### Strange JSX

The JSX has some unusual bits in it like `bind`, `style:color`, `reactive` and `<Todo.repeat ...>` and you might worry you need to learn this, but you don't.

All you need to learn is the `help` attribute, which displays the helper widget in your browser with the syntax rules:

```jsx
<div help>
   ...
</div>
```

One thing worth pointing out is that you end up with far more compact and readable JSX than React, which is full of clutter like this:

```jsx
<div>
  {todos.map({text, checked} => (
    <Todo text={text} done={done} />
  ))}
</div>
```

That makes a big difference to productivity.

#### Component definitions

The two arrow functions which return JSX are component *definitions*. This looks a lot like React but how Wallace uses these functions, and what you can do inside them, is very different. We'll cover this very soon.

#### Mounting

The `mount` function creates a component *instance* and links it to an element on the page, so that it now controls the DOM underneath it. 

You can:

- mount multiple root components to the page so long as their trees don't overlap.
- specify an element, or an element id.
- pass props at the point of mounting, or later.

To illustrate this, replace the call to `mount(...)` with the following code:

```jsx
const todos = [
  { text: "Learn Wallace", done: false },
  { text: "Star Wallace on github", done: false },
];
const todoList = mount(document.getElementById("main"), TodoList);
todoList.render(todos);
```

#### Reactivity

Notice the `reactive` attribute in the `TodoList` component definition. This tells us that components are not reactive by default (the UI does not automatically update in response to the data changing) but enabling this behaviour is easy.

The reason for this is that 

Reactivity (when the UI automatically updates every time the data changes) is very cool, but also causes a lot of bugs and performance issues. Most components don't need that

Reactive frameworks (like Angular and Svelte) suffer two issues:

- The DOM updates when you don't want it to.
- You're open to circular update bugs.

Both of these can sap a lot of dev time. Other frameworks like React are not reactive (go figure) which eliminates these problems, but makes things like forms a total pain.

Wallace gives you the best of both: it is only reactive where you want it to be. 

If you move the `reactive` attribute from **TodoList** to **Todo**.

### How it works

React and similar frameworks use an *engine* to call functions that return virtual DOM, compare that to a cached copy, and update the real DOM to match.

While it is a good idea, it has downsides:

- s extremely restrictive
- , forces you to use ugly patterns like hooks.
- reparenting

Wallace works very differently. Components are ordinary objects.

```jsx
todoList.render(todos);
```

It is simply calling the `render` function on the prototype.



### How it all works

Wallace uses a Babel plugin to find arrow functions which return JSX and *replaces the whole function* with generated code. So the function never makes it into the bundle, and hence is never called. Its only purpose is to hold JSX with scoped variables.

The generated code creates a prototype.

```jsx
//show override update with style.color
```





Simple objects.

What this means.

------------







##### Structure

Tree of objects. Each one has a prototype. There's no engine.



- Wallace controls the DOM via trees of components.
- It looks like React, but you're not allowed two things.
- 




Its a very normal object.

Wallace looks like React in that you define components as functions which return JSX:

```jsx
const Todo = ({text, checked}) => (
  <div>
    <input type="checkbox" checked={checked}/>
    <label>{text}</label>
  </div>
);
```

However, you do many things differently. This is how you nest repeated components for example:

```jsx
const TodoList = ( todos ) => (
  <div>
    <Todo.repeat props={todos} />
  </div>
);
```

Whereas in React it would look like this:

```jsx
const TodoList = ( todos ) => (
  <div>
    {todos.map({text, checked} => (
      <Todo text={text} checked={checked} />
    ))}
  </div>
);
```

That's not allowed in Wallace, and neither are some other 





we'll go over why in the next section. For now lets add the bits to make our example work:

```jsx
import { mount } from "wallace";

const Todo = ({text, checked}) => (
  <div>
    <input type="checkbox" checked={checked}/>
    <label>{text}</label>
  </div>
);

const TodoList = ( todos ) => (
  <div>
    <Todo.repeat props={todos} />
  </div>
);

const todos = [{ text: "Learn Wallace" }];
const root = mount("main", TodoList, todos);
```

This will attach a **TodoList** component to the element with id **main** (which must already exist on the page) and replace its DOM, resulting in this:

<div>
    <input type="checkbox"/>
    <label>Learn Wallace</label>
</div>


By default Wallace is non-reactive like React (go figure) meaning components do not automatically render when data has changed.

```jsx
todos.push({ text: "Star Wallace on github" });
setTimeout(() => root.update(), 2000);
```

<div>
    <input type="checkbox"/>
    <label>Learn Wallace</label>
</div>
<div>
    <input type="checkbox"/>
    <label>Star Wallace on github</label>
</div>
​	



Learn


In fact you can't put any code before or around JSX elements. This may feel extremely restrictive at first, but it will actually make you more productive in several ways. 

We'll get to those soon, but first let's go over the rules so you don't shoot yourself in the foot.

### Rules





1. JSX is only allowed in component definitions.
2. Component definitions must be arrow functions with a single JSX statement assigned to a variable.
3. 

You can't put any code before or around JSX elements.





 it quickly pays off and you'll become more productive than you were with React.





```jsx
// NOT ALLOWED IN WALLACE
const TodoList = ( todos ) => (
  const sortedTodos = todos.sort( compareFn );
  <div>
    <Todo.repeat props={todos} />
  </div>
);
```

But you can do this:

```jsx
const TodoList = ( todos ) => (
  <div>
    <Todo.repeat props={todos.sort( compareFn )} />
  </div>
);
```



These differences will sometimes feel like an inconvenience, however there are advantages:

##### Readability

Wallace code 







However it is not as it seems! Wallace uses a Babel plugin to find arrow functions which return JSX and replaces them with a generated component definition. The function never gets called. Its only purpose is to contain a single JSX statement.



with the juicy bits disabled.

### Basics

Wallace initially looks like React, and you might assume it works the same way, but it really doesn't.



 when you realise it doesn't, you might get very annoyed.



and people assume you do things the same way, get an error telling them they can't, and wonder what you're supposed to do instead.

If you run into trouble.

```jsx
import { HELP } from "wallace";
```





## Try it out

#### On your machine

Run this to create a minimal project:

```
npx create-wallace-app
```

#### In the browser

There is a stackblitz for [TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) and [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx).





### Walk through

Wallace initially looks so similar to React (they got some things right) that people assume it can be used the same way, and get frustrated 

- think its broken
- fail to grasp the genius

### Basics

Wallace is similar to React in that:

- You define a nested trees of *components* which control a section of the DOM.
- The root component is attached to an element on the page.
- Updates cascade down the tree.
- You can attached multiple trees on your page, which are totally separate.

But differs:

- How it uses JSX.
- Internal operations.

```jsx
import { mount } from "wallace";

const TaskItem = ( task ) => (
  <div>
    <input type="checkbox"/>
    <label>{task.text}</label>
  </div>
);

const TaskList = ( tasks ) => (
  <div>
    <TaskItem.repeat props={tasks} />
  </div>
);

const tasks = [{ text: "Learn Wallace" }];
const root = mount("main", TaskItem, tasks);
```

You mount the root component to an existing element on the page, either by passing the id as a string (in this case "main") or an element. You can mount as many root components to the page as you like, they are all separate.

To update the UI, tell the root component to `update()` which cascades the call all its nested components:

```jsx
const otherRoot = mount(document.getElementById('foo'), TaskItem, tasks);
tasks.push({ text: "Star Wallace on github" });
root.update();
```

This will only update the items under **root** and not **otherRoot**.

It is all very simple, mechanical and predictable. We'll see how to make components reactive a bit later.

You can update any element in the tree, not just the root.

### Wallace JSX

So far Wallace looks similar to React, except for how we nest elements. In React you would do this:

```jsx
// THIS WON'T WORK IN WALLACE...
const TaskList = (tasks) => (
  <div>
    {tasks.map(task => (
      <TaskItem text={task.text} />
    ))}
  </div>
);
```

But with Wallace you do this:

```jsx
const TaskList = ( tasks ) => (
  <ul>
    <TaskItem.repeat props={tasks} />
  </ul>
);
```

Or to nest a single item:

```jsx
const TaskList = (tasks) => (
  <div>
    <TaskItem.nest props={tasks[0]} />
  </div>
);
```

This is because Wallace treats JSX differently. Instead of converting it to code that returns virtual DOM, Wallace replaces the entire function with generated code during compilation.

This means the function never gets called, because it never appears in the bundle. Its only purpose is to define a component.








This will replace the contents of element with id **main** with a checkbox and label:

<div>
    <input type="checkbox"/>
    <label>Learn Wallace</label>
</div>

Although components 

which you define as arrow functions which return JSX:

 to control the DOM,

and though it looks like React, it works very differently.





-----------



## 

> Lead straight in with nested items, and explain that the root is mounted.
>
> 
>
> With React you would do this (...)
>
> That's not allowed in Wallace, in fact you can't put any logic before or around JSX elements. You can put it in placeholders.
>
> **Why**
>
> It's not real JSX and not a real function. 
>
> Wallace has a completely different design, and though you loose the power of JSX, you get many better things in return.
>
> The first is cleaner and more compact code.
>
> **Power/directives**
>
> visibility
>
> events
>
> help
>
> toggles
>
> ClassDirective
>
> styles
>
> custom
>
> **reactivity**
>
> done right
>
> **Patterns**
>
> Prototypes and stubs
>
> **Full override**
>
> refs and what update and render do.
>
> **Reparenting**

**Pool control**




>
>
>Loose the power of JSX, but in exchange you get:
>
>- Much cleaner code.
>- Better performance.

Changes

- How you write code
- How fast it runs
- What you can do
- What you can't do





Let's define a component **TaskItem** and mount an instance of it to the element with id **main**:



So far this looks like React. But if you try to nest TaskItem inside another component you'll find it doesn't work:


But instead you do this:

```jsx
const TaskList = ( tasks ) => (
  <ul>
    <TaskItem.repeat props={tasks} />
  </ul>
);
```

This removes a lot of the clutter from your JSX



Although components are *defined* as arrow functions which return JSX.

If you've used React you might think Wallace *runs* this function to obtain virtual DOM, but it doesn't.

**During compilation a Babel plugin find arrow functions that return JSX and replaces them with generated code.**

So that function is never executed and doesn't even appear in the browser.

 

The key thing to understand is that Wallace never executes that function. It *replaces* it with generated code during compilation.



The function is *read* not *run* which means 

These functions will never be *executed*, their only purpose is to hold JSX which will be *read* during compilation. As such you can't do lots of things:

##### Declare variables

```jsx
const Greeting = ({ message, color }) => (
  const msgCaps = message.toUpperCase();
  <h1 style:color={color}>
    {msgCaps}
  </h1>
);
```





This looks like React but it works **VERY DIFFERENTLY**, so pay attention.



However that is **not a real function**, it is **not real JSX** and there is **no virtual DOM**.





1.  returns JSX. You just declare it that way because it looks clean.



controls the DOM (a tree of nodes) using a tree of components.



which you define as functions that return JSX:

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

##### Run time freedom

Virtually every framework uses a closed engine to update the DOM, which you have no control over, and typically cannot bypass either. If your project hits a performance issue (which can happen with any framework) there is often very little you can do about it.

Wallace gives you granular control over its operations. If you can do something in vanilla, you can do it in Wallace, often more easily. You will always be able to reach vanilla-like performance where needed, without leaving the clean structure of a framework.







##### 1. Simplicity

I don't want to learn about hooks, portals, virtual DOM, controllers and other noise. Wallace uses components, which are plain objects and that's it. There is no engine and no magic. If I need to do something complex or unusual, the answer is just plain JavaScript, not framework-specific lore.

##### 2. Size

Wallace produces absolutely tiny bundles, on par with Svelte, giving you insanely fast page loads.

##### 3. Performance

Benchmarks lie. Real world pages slow down because of complexities you can't capture in benchmarks, and it's invariably your framework stopping you from doing something that would be child's play in jQuery. Wallace doesn't have this problem:

1. You can interact with the DOM through the component tree more easily there's no need for jQuery.
2. There's no framework engine to get in your way.

Performance issues that end up consuming days or weeks of dev time in other frameworks are solved in minutes.

##### 4. Productivity

Wallace ends up making you more productive than other frameworks for several reasons:

- Far cleaner, compact and readable JSX. You will never be able to look at React code again.
- All your logic is outside of components
- You waste fare less time battling with the framework over performance issues or reactivity glitches.



You can learn Wallace in around 10 minutes, after which the built in help system is all you need.


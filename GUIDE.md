# Wallace User Guide

## About

This guide covers:

1. How Wallace works.
2. How to use Wallace.

This guide does not include:

1. A step by step tutorial (there isn't one yet)
2. Installation instructions (use the command below or clone an [example](https://github.com/wallace-js/wallace#Examples))
3. A full reference (that's in the JSDocs which are available via tool tips in most IDEs)

To try out code samples you can use StackBlitz ([JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)/[TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx)) or create a local project:

```
npx create-wallace-app
```

## 1. How Wallace works

Wallace controls the DOM using "components" which you define as functions that return JSX:

```tsx
import { mount } from "wallace";

const Greeting = ({ name }) => <h3>{name} says hello</h3>;

mount("root", Greeting, { name: "Wallace" });
```

It look a lot like React, but Wallace works differently in four key ways:

#### 1. Compilation

During compilation:

- React just converts the JSX into executable code, leaving the rest of the function intact.
- Wallace replaces the _entire function_ with generated code.

Your function will not exist at run time, and is never _executed_. It only gets _read_ during compilation, and _replaced_ with a constructor function with special bits attached. Your function must only contain JSX, and nothing else.

Wallace does all the interpreting, checking and translating of your instructions during compilation, leaving only the bare minimum, nicely optimised operating code in your bundle. A second advantage of this approach is that we can add more and more features to Wallace without increasing bundle size.

To inspect a compiled file, run:

```shell
npx babel src/index.tsx
```

#### 2. JSX

As the JSX is never _executed_, it cannot contain any logic (like conditional statements or for loops) before or around JSX elements. Think of it as a static HTML string, but using JSX syntax for IDE support, with extra features and relevant variables in scope.

It might appear as though you're doing logic inside JSX:

```tsx
const Greeting = ({ name }) => (
  <h3 style:color={name.startsWith("W") ? "green" : "red"}>
    {name} says hello
  </h3>
);
```

But anything inside curly brackets is actually _copied_ to other places during compilation (and it must not yield further JSX).

The `style:color` is an example of a _directive_, which are special attributes that do things. You can see a list of them by hovering over any JSX element.

In addition to directives there are special constructs for nesting and repeating:

```tsx
import { mount } from "wallace";

const Greeting = ({ name }) => <h3>{name} says hello</h3>;

const GreetingList = names => (
  <div>
    <Greeting.repeat props={names} />
  </div>
);

mount("root", GreetingList, [
  { name: "Wallace" },
  { name: "Gromit" }
]);
```

And stubs for base components which can be overridden:

```tsx
const BaseAnimation = () => (
  <div>
    <stub:animation />
    <stub:text />
  </div>
);
```

Although you loose the full flexibility of React (which isn't really needed as its rare for a components to drastically change their structure) you gain the following:

- Clearer and more compact JSX.
- Indentation is preserved, not mangled.
- More powerful features.

#### 3. Components

Wallace treats components very differently to React, and this is where it gets its power.

##### React

Components are functions, which get called by a special "root" object which uses the returned virtual DOM to patch the real DOM. And this means:

1. All components update the same way.
2. A component either updates or it doesn't.
3. You have no control over how any of it works.
4. There are no component objects to work with, therefore:
5. You need awkward patterns like hooks for non-DOM operations\*.

_\* Controlling state, responding to events, triggering updates etc..._

##### Wallace

The function you write gets turned into a _component definition_ (constructor function + prototype) during compilation from which _component objects_ are created at run time.

Each component object controls its own DOM through two methods defined on its prototype: `render` and `update`. All that exists at run time is a tree of component objects - there is no central coordinating object. And there is no hidden DOM engine either - components directly update dynamic elements during a render.

You are essentially dealing with this:

```tsx
// THIS IS NOT REAL CODE, ITS JUST FOR ILLUSTRATION!
// WALLACE DOESN'T USE CLASSES.
class Greeting {
  static dom = (
    <h3>
      <span></span> says hello
    </h3>
  );
  constructor() {
    this.props = {};
    this._prev = {};
    this._nested = [];
  }
  render(props) {
    this.props = props;
    this.update();
  }
  update() {
    if (this.props.name !== this._prev.name) {
      this.dom.el([0]).textContent = this.props.name;
    }
    this._nested.forEach((component, props) =>
      component.render(props)
    );
  }
}
root = new Greeting();
root.render({ name: "Wallace" });
```

And this means:

1. You can change how different component updates.
2. You can partially update components if you want to.
3. You can modify every single aspect of run time operation.
4. You do non-DOM operations using very simple, natural and direct code.

The rest of this section will use examples to hammer home just how crude and mechanical Wallace components are. This is necessary as people always expect there is some kind of hidden magic in a JavaScript framework.

From now on:

- All code shows is real - even though you might not write code like this in a real app.
- The term component can mean component definition or object - it's usually easy to tell.

Let's use the instance of `Greeting` returned by `mount` to render new props:

```tsx
const root = mount("root", Greeting, { name: "Wallace" });
root.render({ name: "Gromit" });
```

The `render` method really just sets the instance's `props` and calls its `update` method, which updates the DOM. So instead of `render` you could do it like this:

```tsx
root.props = { name: "Gromit" };
root.update();
```

The props stores a reference to the original object passed in, so you can change the original then update:

```tsx
const person = { name: "Gromit" };
root.render(person);
preson.name = "Wendolene";
root.update();
```

This might look unsafe to functional purists, but in the real world this proves extremely useful as we'll see later. You can also modify the props directly:

```tsx
root.props.name = "Wendolene";
root.update();
```

The point is to show that there is no magic, its just plain objects, properties and methods. And you can override methods:

```tsx
Greeting.prototype.render = function (props) {
  this.props = props;
  this.update();
  console.log("Updated Greeting");
};
```

> If you're confused by `prototype` just remember its an object attached to a function which gets assigned to the `__proto__` field of each object created through that function:
>
> ```tsx
> function Foo() {}
> Foo.prototype.bar = 1;
> foo = new Foo();
> foo.__proto__ === Foo.prototype; // true
> ```
>
> And `__proto__` is just a place JavaScript checks when you try to _read_ a property which doesn't exist on a object:
>
> ```tsx
> console.log(foo.bar);
> // prints 1 as `bar` is found on `foo.__proto__` (which is `Foo.prototype`)
> foo.bar = 2;
> console.log(foo.bar);
> // print 2 as `bar` is now found on `foo`.
> console.log(Foo.prototype.bar);
> // prints 1 as Foo.prototype.bar is unchanged.
> ```
>
> And if `__proto__` doesn't have the property, then it checks _that_ object's `__proto__` etc allowing us to set up prototype chains. It is usually used for functions.

So you can add your own methods:

```tsx
const Greeting = ({ name }, { self }) => (
  <h3>{self.getName()} says hello</h3>
);

Greeting.prototype.getName = function () {
  return this.props.name.toUpperCase();
};
```

Remember that `Greeting` is not a real function with real arguments, it is used to generate code during compilation, and the second argument (called **xargs**) is just a way to give you access to things you might need in the JSX, such as a reference to the component instance (as `self` because `this` is not allowed in arrow functions).

#### 4. DOM

To understand how Wallace updates the DOM, we're going to extend `update` to manipulate an element manually ourselves:

```tsx
import { mount, Component } from "wallace";

const Greeting = ({ name }) => (
  <div>
    <h3 ref:greeting>{name} says hello</h3>
  </div>
);

Greeting.prototype.update = function () {
  Component.prototype.update.call(this);
  this.ref.greeting.style.color = this.props.name.startsWith("W")
    ? "green"
    : "red";
};
```

Notes:

- The `update` method is generic unless overridden (ignore the fictitious class visualisation in the previous section) so it's fine to use the base update defined on `Component` as its the same.
- We are changing the real HTML element _directly_. We could do it from outside too:

```tsx
root.ref.greeting.style.color = "yellow";
```

You don't normally do this kind of thing. The point of this example is that this is essentially how the `update` method updates the DOM, except it also:

1. Checks if the value has changed since last update before modifying the element.
2. Doesn't update an element (or even query the associated value) if it, or a parent element is hidden or detached from the DOM through directives like `if`, `show` and `hide`.

So again we find that despite appearing functional, Wallace components actually work in an extremely crude and mechanical way under the hood. We'll use more involved examples to show why this is so useful, but first a quick word on TypeScript.

### TypeScript

Wallace offers deep TypeScript support with the `Uses` type:

```tsx
import { mount, Uses } from "wallace";

interface iGreeting {
  name: string;
}

const Greeting: Uses<iGreeting> = ({ name }) => (
  <h3>{name} says hello</h3>
);

const GreetingList: Uses<iGreeting[]> = names => (
  <div>
    <Greeting.repeat props={names} />
  </div>
);

mount("root", GreetingList, [
  { name: "Wallace" },
  { name: "Gromit" }
]);
```

This ensures you pass correct props when mounting and nesting, but also reaches other places:

```jsx
Greeting.prototype.render = function (props) {
  this.props = { ...props, notallowed: 1 }; // type error
};
```

## 2. How to use Wallace

Now we have a good grasp of Wallace's operations, let's go through a few examples to see how we apply these.

### 1. A reactive todo list

Here's the source code for a TODO list which updates the completed task count as you add or tasks:

```jsx
import { mount, watch } from "wallace";

const Todo = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done}/>
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TodoList = ( todos, { event, self }) ) => (
  <div>
    <span>Completed: {todos.filter(t => t.done).length}</span>
    <div>
      <Todo.repeat props={todos} />
    </div>
    <input type="text" onKeyUp={self.addTaskKeyup(event)} />
  </div>
);

TodoList.methods({
  render(props) {
    this.props = watch(props, () => this.update());
    this.update();
  },
  addTaskKeyup(e) {
    const target = e.target as HTMLInputElement;
    const text = target.value;
    if (e.key === "Enter" && text.length > 0) {
      this.props.push({ text, done: false });
      target.value = "";
    }
  }
});

mount("main", TodoList, [
  { text: "Learn Wallace", done: true },
  { text: "Star Wallace on github", done: false },
]);
```

Let's go through the bits we haven't covered so far:

- The `bind` directive sets up two-way binding between the watched data and the element.
- The `event` keyword in **xargs** corresponds to the DOM event wherever it is used.
- The `methods` method simply lets us define multiple prototype methods at time with more concise syntax.
- Lastly `watch` which is covered below.

##### How `watch` works

The reactive behaviour is all down to this line:

```tsx
this.props = watch(props, () => this.update());
```

`watch` returns a proxy of the supplied object, which calls the callback whenever the object (or objects pulled from it) are modified. 

So these operations cause the `TodoList` to update:

```tsx
this.props.push();
this.props[1].done = true;
```

Note that `watch` itself knows nothing about Wallace or components. It can be used anywhere you like, but there are two things to remember:

Firstly, the original object is also updated, but only the proxy is reactive:

```tsx
const original = {};
const proxy = watch(original, () => alert('Changed'), 0);
proxy.foo = 1;          // fires alert
original.bar = 2;       // doesn't fire alert
console.log(proxy);     // {foo: 1, bar: 2}
console.log(original);  // {foo: 1, bar: 2}


const original = [];
const proxy = watch(original, () => alert('Changed'), 0);
proxy.push({x: 1});            // fires alert
original.push({x: 2});         // doesn't fire alert
console.log(original.length);  // 2
console.log(proxy.length);     // 2
proxy[1].x = 3;                // fires alert
```

Secondly, the callback will not be fired if it has already fired within the last 50ms/



negates the grace period during which the callback is not called. This 

 only needed when experimenting with watch



when experimenting with `watch` like this you must pass  as 



 within a grace period

The grace period is because when you do  `array.push()`  JavaScript sets `array[i] = newItem` and then `array.length = newLength` immediately after, so the callback would get fired twice.

 solve this waiting 50ms 



, meaning the callback gets fired twice. Because we mostly use `watch` to respond to UI events, watch 

```tsx
let proxy watch([], () => alert('Changed'), 0);
proxy.push('a');     // fires alert twice because JavaScript

let proxy watch([], () => alert('Changed'));
proxy.push('a');     // fires alert once
proxy.push('b');     // doesn't fire alert as it happens within 50ms
setTimeout(() => {
  proxy.push('c');   // fires alert once
}, 200)
```



The reason for the grace period is because JavaScript sets an array's length property immediately after pushing an item, meaning `push` would 





##### How it all holds together

This is all possible because of the component's two-stage rendering `render` and `update` method, which get called from different places. In React this is not possible.

 TodoList's `render` method is only called once in this example (during `mount`) and after that we only call `update`. This two stage render comes in handy.



We used `watch` to turn the props into 



an object which tells to TodoList to update whenever 

The TodoList's `render` method is only called once. 

 and we use that to replace the props with a proxy

to set `this.props` to a proxy of the `props` received



props is a proxy of the array which we instructed to call the TodoList's `update` method whenever it is modified, which happens:

1. When we toggle a task, thanks to the `bind` directive.
2. When we push a task to props.

Note that 

So this is a great example of what you can do with a two-step render

##### Why do it this way

Baking reactive behaviour *into* the framework (Angular, Svelte) is stupendously bad idea. It looks impressive in a demo, but in the real world it becomes a major source of bugs, glitches, confusion and inefficiency, especially with two-way binding.

The best decision React ever made was not to be a reactive framework (presumably well after they picked the name). But reactivity is very useful in a small number of cases, such as form validation.

Wallace isn't reactive, instead it offers a utility function that helps you turn a component tree reactive in a very controlled manner, where you can follow exactly what's happening. This is the only sane approach.





The sanest approach is opt-in reactivity



- Usefulness of two step
- Talk about reactivity

#### 2. Persistent todo list

- Move logic to controller
- Use local storage?

#### 3. Stop watches

- stats at top
- set props on update
- deep updates
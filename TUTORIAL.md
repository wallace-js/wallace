# Wallace tutorial

In this tutorial we'll be creating a task list app, gradually adding more features to cover everything there is to know about Wallace.

It should take 20-30 minutes.

1. **Overview** - quick glance at setup syntax.

2. **Compilation** - how Wallace does its magic.

3. **Rendering** - the flow that controls your DOM.

4. **Reactivity** - the sane approach.

5. **Controllers** - the logic part of your app.

6. **Methods** - when to use component methods.

7. **Styling** - a flexible approach.

8. **Stubs** - the flexible component inheritance and composition system.

9. **Performance tweaks** - 

10. **Helpers** - routing, forms and dialog boxes.

11. **Custom directives** - extending Wallace syntax.

### 1. Overview

Wallace uses components to control the DOM, which you *define* as a function that accept **props** and returns a **JSX** expression:

```tsx
const Task = ({ text, completed }) => (
  <div>
    <input type="checkbox" bind={completed}/>
    <label>{text}</label>
  </div>
)
```

It looks like to React, but works differently in several ways.

#### Directives

**Directives** are attributes with special meaning. We used `bind` above which sets up two-way binding between a DOM element and a value. The effect will become apparent when we make the component reactive later on.

To get a list of all available directives, simply hover over any JSX element:

![]("./assets/directives-hover.jpg")

#### Nesting

The next difference is nesting syntax:

```tsx
const TaskList = ( props ) => (
  <div>
    <Task.nest props={props[0]} />
    <hr/>
    <div>
      <Task.repeat props={props.slice(1)} />
    </div>
  </div>
);
```

As you can see the syntax is different to React, which leaves your JSX less cluttered, more compact, and without its indentation distorted by JavaScript.

These rules are also displayed in tool tips, so you don't actually need to remember all this.

#### Mounting

We attach components to the DOM with the `mount` function:

```tsx
import { mount } from "wallace";

const tasks = [
  { id: 1, text: "Learn Wallace", completed: true },
  { id: 2, text: "Star on github", completed: false },
  { id: 3, text: "Tell your friends", completed: false },
];

mount("main", TaskList, tasks);
```

This replaces the element with `id="main"` with a `TaskList` and renders it. You can pass an element instead of an id string if you prefer.

You should now see this on the page:

<div style="padding: 20px; width: 400px;">
  <div>
    <input type="checkbox" checked/>
    <label>Learn Wallace</label>
  </div>
  <hr/>
  <div>
    <div>
      <input type="checkbox"/>
      <label>Star on github</label>
    </div>
    <div>
      <input type="checkbox"/>
      <label>Tell your friends</label>
    </div>
  </div>
</div>

#### TypeScript

The `Uses` type gives you full TypeScript support:

```tsx
import { mount, Uses } from "wallace";

interface TaskProps {
  id: number;
  text: string;
  completed: boolean;
}

const Task: Uses<TaskProps> = ({ text, completed }) => (
  <div>
    <input type="checkbox" checked={completed}/>
    <label>{text}</label>
  </div>
)

const TaskList: Uses<TaskProps[]> = ( props ) => (
  <div>
    <Task.nest props={props[0]} />
    <hr/>
    <div>
       <Task.repeat props={props.slice(1)} />
    </div>
  </div>
);
```

TypeScript will now warn you if pass invalid props when mounting or nesting, and much more as we'll see later. Notice how the `props` directive adapts depending on whether it is used with nest or repeat.

### 2. Compilation

It might look like Wallace *calls* the `TaskList` and `Task` functions, but it doesn't. Instead Wallace *replaces* these functions with constructor functions during compilation.

The `mount` function uses that to create an instance of `TaskList`, attaches its root element to the DOM, calls its `render` method (which then creates three instances of `Task` and calls their `render` methods) before returning the `TaskList` instance.

We can call that component instance's `render` method again to update the DOM:

```tsx
const taskList = mount("main", TaskList, tasks);
taskList.render(tasks.slice(1));
```

So far it makes no make difference that components are objects rather than functions as we're only using one method, but that's about to change.



#### There are only components

Our page has four component objects active: one `TaskList` and three `Task` instances. Aside from a couple of private objects inside the component, there are no other objects in play no global coordinator. The DOM is controlled entirely by component objects and their methods.

And methods can be overridden, which means you can modify *everything*, making Wallace the only fully open framework.

#### Your function never runs

The component functions in your source code:

1. Are *replaced* during compilation,
2. So they no longer exist at *run time,*
3. And are therefore *never executed*. 

Their only purpose is to hold a single JSX which expression is used during compilation. Therefore:

1. You can't put anything other than a single JSX expression in the function.
2. You can't put any logic before or around JSX elements.

Think of the JSX as a static HTML string with type support and extra syntax, wrapped in a scope with all the variables you'll need.

It might *appear* as though 

```tsx
const Task = ({ text, completed }) => (
  <div>
    <input type="checkbox" bind={completed}/>
    <label style:color={completed ? "grey" : "black"}>{text}</label>
  </div>
);
```



Anything in curly brackets *copied* to a different location during compilation, which is why the event handler looks like its calling `self.addTask()`.

### 3. Rendering

Here's what the `render` method looks like:

```tsx
Component.prototype.render = function (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
}
```

Let's ignore `ctrl` for now and focus on what this tells us about `render`, `props` and `update`.

Instead of calling `render` we could just assign new props and call `update`:

```tsx
const taskList = mount("main", TaskList, tasks);
taskList.props = tasks.slice(1);
taskList.update();
```

Alternatively, we could modify the original array then call `update` because `tasks` and `props` are the same object:

```tsx
const taskList = mount("main", TaskList, tasks);
tasks.shift();
taskList.update();
```

As you can see, there is no magic: its just simple objects with fields and methods.

One key thing to remember is that Wallace only ever calls:

1. `render` from *above*: when mounting, nesting or updating nested components.
2. `update` from *within*: during `render` as shown.

And this enables you to do all the clever things you're about to see. So play around with this until it sinks in, perhaps by overriding `Task`'s render method to add some logging:

```tsx
Task.prototype.render = function (props, ctrl) {
  console.log("Rendering", props);
  this.base.render.apply(this, props, ctrl);
}
```

Note that `this.base` always refers to `Component.prototype` so you get the original method - it is not the equivalent of `super`.

There is a neater way of overriding/adding methods.

### 4. Reactivity

To demonstrate reactive behaviour lets change the task list to display the total completed tasks:

```tsx
const TaskList: Uses<TaskProps[]> = ( props ) => (
  <div>
    <span>Completed: {props.filter(t => t.completed).length}</span>
    <hr/>
    <div>
       <Task.repeat props={props} />
    </div>
  </div>
);
```

So your page should look like this:

<div style="padding: 20px; width: 400px;">
  <span>
    Completed: 1
  </span>
  <hr/>
  <div>
    <div>
      <input type="checkbox" checked />
      <label>Learn Wallace</label>
    </div>
    <div>
      <input type="checkbox"/>
      <label>Star on github</label>
    </div>
    <div>
      <input type="checkbox"/>
      <label>Tell your friends</label>
    </div>
  </div>
</div>

Now let's override the render method to replace the props with "watched" props:

```tsx
import { mount, Uses, watch } from "wallace";

TaskList.methods({
  render(props, ctrl) {
    const watchedProps = watch(props, () => this.update());
    this.base.render.apply(this, watchedProps, ctrl);
  }
});
```

The component is now reactive: the total completed will update as you toggle tasks.

Let's run through why it works...

#### The `render` function

As per the previous section, the `TaskList`'s `render` method will only fire once on this page, after which only it's `update` method gets called. So we're only creating the `watchedProps` once.

#### The `watch` function

The `watch` function simply returns a proxy (aka wrapper) of the provided object which calls a callback whenever it is modified. It has nothing to do with components or rendering, and you can use it anywhere:

```tsx
const original = {};
const callback = () => alert('Changed');
const proxy = watch(original, callback);
proxy.a = {x: 1};           // fires alert
original.b = {x: 1};        // doesn't fire alert
proxy.b.x = 2;		        // fires alert
console.log(proxy);         // {a: {x: 1}, b: {x: 2}}
console.log(original);      // {a: {x: 1}, b: {x: 2}}
```

Note how it fires when you update a nested object too. This also works with arrays. Just bear in mind there is a 50ms timeout to prevent the callback firing twice on certain operations (see docs by hovering over `watch`).

#### The `bind` directive

nested object also gets turned into a proxy.

The important part is that the reactivity doesn't come from the component or the framework. So when things get weird, you don't have to second guess the framework. This saves a ton of time compared to frameworks where reactivity is built in.

### 5. Controllers

Wallace doesn't have controllers, only components. However, components have a special field `ctrl` whose value gets passed down to each nested components during `render`. So each nested component gets:

1. Its own `props`
2. Its parent's `ctrl`

We can use this to pass down an object (which we call a controller) to coordinate things between components. Let's illustrate this by adding buttons to delete individual tasks. 

First let's define the controller class, move the watched props into it, and add a method for deleting tasks:

```tsx
import { ComponentInstance } from "wallace";

class Controller {
  root: ComponentInstance;
  tasks: TaskProps[];
  constructor(root: ComponentInstance, tasks: TaskProps[]) {
    this.root = root;
    this.tasks = watch(tasks, () => this.root.update());
  }
  deleteTask(id: number) {
    const index = this.tasks.find(t => t.id === id);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
  }
}
```

And here is how we wire that in:

```tsx
const Task: Uses<TaskProps, Controller>  = ({ text, completed, id }, { ctrl }) => (
  <div>
    <input type="checkbox" bind={completed}/>
    <label>{text}</label>
    <button onClick={ctrl.deleteTask(id)}>X</button>
  </div>
);

const TaskList: Uses<null, Controller> = (_, { ctrl } ) => (
  <div>
    <span>Completed: {ctrl.tasks.filter(t => t.completed).length}</span>
    <hr/>
    <div>
       <Task.repeat props={ctrl.tasks} />
    </div>
  </div>
);

TaskList.methods({
  render(props, ctrl) {
    this.ctrl = new Controller(this, props);
    this.update();
  }
});
```

You can now delete tasks, and the total completed will update accordingly.

Notice how:

1. Components have access to `ctrl` via the second argument (called **xargs** which we'll see more of soon).
2. We get TypeScript support for `ctrl` by adding the controller class to `Uses`.
3. The `TaskList` no longer makes use of props, it gets everything from its controller.

You can use controllers to:

- Provide callbacks for all the events in the tree.
- Format or rebuild props.
- Update one or more components.
- Link to other controllers or services.

And this means that your:

1. **Props** only contain data.
2. **Components** focus solely on display, so stay leaner and cleaner.
3. **Controllers** (which are your objects, not framework constructs) do everything else.

Let's make the component even leaner by making the controller build its props:

```tsx
interface TaskListProps {
  tasks: TaskProps[];
  completed: number;
}

const TaskList: Uses<TaskListProps, Controller> = ({ tasks, completed }) => (
  <div>
    <span>Completed: {completed}</span>
    <hr/>
    <div>
       <Task.repeat props={tasks} />
    </div>
  </div>
);

class Controller {
  root: ComponentInstance;
  tasks: TaskProps[];
  constructor(root: ComponentInstance, tasks: TaskProps[]) {
    this.root = root;
    this.tasks = watch(tasks, () => this.update());
    this.update();
  }
  update() {
    this.root.props = {
      tasks: this.tasks, 
      completed: this.tasks.filter(t => t.completed).length
    }
    this.root.update();
  }
  deleteTask(id) {}
}
```

If you needed more stats than just "completed" it's pretty clear where you'd add that code.



This is so much nicer than shoehorning functions into props, or using hooks, signals, providers, context managers or other awkward patterns that functional frameworks expect you to use.



### 6. Methods

We often start out writing methods on the component, then move them out to a controller class (very easy when you use `Component.methods({...})` format). However there are some things which should stay in component methods:

- Knowledge of the component's details.
- DOM operations.

Let's add a text input which lets us type and add tasks by hitting enter:

```tsx
interface TaskListMethods {
  addTaskKeyUp: (event: KeyboardEvent) => void;
}

const TaskList: Uses<null, Controller, TaskListMethods> = (_, { ctrl, self, event }) => (
  <div>
    <span>Completed: {ctrl.tasks.filter(t => t.completed).length}</span>
    <div>
      <Task.repeat props={ctrl.tasks} />
    </div>
    <input type="text" onKeyUp={self.addTaskKeyUp(event as KeyboardEvent)} />
  </div>
);

TaskList.methods({
  render(props, ctrl) {
    this.ctrl = new Controller(this, props);
    this.update();
  },
  addTaskKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const text = target.value;
    if (event.key === "Enter" && text.length > 0) {
      this.ctrl.addTask(text);
      target.value = "";
    }
  }
});
```

Notes:

1. We used the **xarg** `event`. This parameter along with `element` may be used in multiple places in the component and each will refer to the event or element at point of use. Therefore if setting its type because we need a `KeyboardEvent` for example, we do it at the point of use.
2. We've not yet implemented `addTask` on the controller.
3. The interface makes  `addTask` visible on `self` in the JSX and on `this` in the methods.

But there are two issues with this code.

#### Mixing UI and logic

Checking `event.key === "Enter"` belongs with the component because it's dealing with a DOM event. But checking `text.length > 0` is a logic operation, so even though it's convenient doing it here, that's really a job for the controller. We may add more validation, such as not adding a task with the same text as another, and those two checks would belong next to each other.

#### Dirty DOM

Imagine our app allows users to switch between different task lists (categories, days etc) and that the user starts typing a task, then does a switch instead of hitting enter.

Their half-typed task would still be visible, as it is stored as the InputElement's value and we did nothing to change it. In this particular case this might be desirable behaviour, but it usually is not, and if it is there are better ways of handling it.

This is usually only a risk with input elements, and the safest way to avoid that is to always `bind` them to a value.





The user might start typing something but not hitting enter, an instead do something else like switch to a different day, which loads different tasks into the same `TaskList` component instance.

In this case, 















---------



Let's add the ability to add new tasks. First we create a new component to hold a text input and button.

```tsx
const AddTaskBox: Uses<null, Controller> = () => (
  <div>
    <input type="text"/>
    <button>Add</button>
  </div>
);
```

Which we nest in the `TaskList` like so:

```tsx
const TaskList: Uses<null, Controller> = (_, { ctrl }) => (
  <div>
    <span>Completed: {ctrl.tasks.filter(t => t.completed).length}</span>
    <div>
      <Task.repeat props={ctrl.tasks} />
    </div>
    <AddTaskBox.nest />
  </div>
);
```

But now we need to think carefully about how we wire this. The user may start typing something, then toggle or delete a task instead of clicking the button which would cause the `TaskList` to update. We would not want to loose what they have typed. Which would happen if it build its own props,.

There are other scenarios where we might not want half-typed task to persist, like if this `TaskList` is made to display tasks for a different day etc...

The best option is probably to store it on the controller, bind it:

```tsx
const AddTaskBox: Uses<null, Controller> = (_, { ctrl }) => (
  <div>
    <input type="text" bind={ctrl.newTaskText}/>
    <button onClick={ctrl.addTask()}>Add</button>
  </div>
);
```

As a rule, you want to ensure inputs are bound to a value.

Here's the controller `nextId`, `newTaskText`  and `addTask` method to the controller:

```tsx
class Controller {
  root: ComponentInstance;
  tasks: TaskProps[];
  nextId: number;
  newTaskText: string = "";
  constructor(root: ComponentInstance, tasks: TaskProps[]) {
    this.root = root;
    this.tasks = watch(tasks, () => this.root.update());
    this.nextId = tasks.length + 1;
  }
  addTask() {
    const text = this.newTaskText;
    this.newTaskText = "";
    this.tasks.push({text, id: this.nextId, completed: false})
    this.nextId ++;
  }
  deleteTask(id) {
    const index = this.tasks.find(t => t.id === id);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
  }
}
```

But let's spice things up by disabling the button if the text is empty or the the value is in use.

```tsx
const AddTaskBox: Uses<null, Controller> = (_, { ctrl }) => (
  <div>
    <input type="text" bind={ctrl.newTaskText}/>
    <button disabled={} onClick={ctrl.addTask()}>Add</button>
  </div>
);
```

This is not a good example, as there's no need for component methods.







----



And here is our new component:

```tsx


AddTaskBox.methods({
  render(props, ctrl) {
    this.props = watch({text: ""})
  }
  clickAddTask() {
    const input = this.ref.newTaskText;
    this.ctrl.addTask(input.value);
    input.value = '';
  }
});
```

- `self` in **xargs** refers to the component instance (we can't use `this` inside arrow functions).
- The `ref` directive saves a reference to an element. So `this.ref.newTaskText` is the actual InputElement.



The reason we do this logic in a method of `AddTaskBox` rather than the controller is because this knows about the details of the comonent/



And lastly we add

```tsx



```





Next make it have its own controller.



### 7. Styling

Wallace doesn't have its own way of treating styles as:

1. There are so many CSS tools, frameworks and methodologies that already take of this.
2. If you want to assist those (perhaps to TypeScript support) or use inline styles then nothing beats plain JavaScript objects for power and flexibility.

Here is a not particularly consistent example which shows how you could use plain objects to organise classes:

```tsx
import { label, row } from "./blocks";
import { colors, fonts } from "./styles";
import { cat } from "./utils";  // cat just joins words with a space.

const css = {
  task: cat(row, "mt-4"),
  taskLabel: cat(label, colors.blue, fonts.medium),
  taskList: cat(),
  taskListCompleted: cat()
}

const Task = ({ text, completed }) => (
  <div class={css.task}>
    <input type="checkbox" bind={completed}/>
    <label class={css.taskLabel}>{text}</label>
  </div>
)
```

The point of doing this would be to:

1. Avoid relying on literal strings, which can hide typos, and are harder to maintain.
2. Avoid making a mess of your clear and compact JSX by having a ton of text in class attributes.

#### Generic vs specific

We put generic classes in their own modules so they can be reused throughout the app, then use those to create specific combinations in the `css` object for use in the components in that module. These components are likely nested within each other, so it's handy being able to manage all their styles in one object.

#### Naming

One of the nice things about utility-based approaches (such as TailwindCSS) is not having to name classes. In our example we are naming groups of classes in that `css` object, but:

- The names only need to identify elements in the (hopefully small set of) components in that module.
- The names are private to that module.

So they don't matter that much, and are easy to pick, so it doesn't create the same kind of problem.

#### Generating

You can use code like loops and spread operators to generate the various permutations of utility classes you need (perhaps you follow a convention like BEM) making your code even more compact and maintainable:

```tsx
// show BEM classes
```

Unless you're using TailwindCSS, you'd still need to ensure those class names exist in your style sheet, and there are several options available. The best is probably to create a script somewhere which maps all your class names to their definitions, checks you haven't missed any, then generates your style sheet:

```tsx
import * as blocks from "./src/blocks";
import { colors, fonts } from "./src/styles";

const classes = {};
classes[fonts.bold] = `font-weight: bold`;
classes[blocks.row] = `padding: 10px; margin-top: 4px;`;
classes[color.red] = `color: red;`;

ensureAllClassesAreCovered(classes, blocks, color, fonts);
generateStyleSheet(classes, "./styles/utilities.css");
```

#### Inline styles

If you'd rather use inline styles (which in [some people claim are faster](Styles https://danielnagy.me/posts/Post_tsr8q6sx37pl)) you can do much the same:

```tsx
const styles = {
  font: {
    large: {"font-size": "2em"},
    medium:{"font-size":  "1em"},
    small: {"font-size": "0.8em"},
  },
  color: {
     primary: {color: "#32a852"},
     background: {color: "#5d5e5e"}
  }
}
```

Then use them like this:

```tsx
import {font, color} from "./styles";

const styles = {
  task: {...font.medium, ...color.primary, "margin-top": "4px"},
  taskLabel: {...colors.blue, ...font.small),
  /*...*/
}

const Task = ({ text, completed }) => (
  <div style={styles.task}>
    <input type="checkbox" bind={completed}/>
    <label style={styles.taskLabel}>{text}</label>
  </div>
)
```

#### The `static` and `css` directives











1. There are various approaches to styles, from bootstrap to tailwind, and none should be unsupported.
2. You can 

That said, we're going to look at a very simple way to organise styles by grouping them into objects:

```tsx

```

Or you if you're using the likes of tailwind you can group classes into objects:

```tsx
const css = {
  label: "ml-2 font-bold"   
}
```

#### Dynamic styles



If you want them on the component or on the controller:

```tsx
typeof style
```



### 8. Stubs

### 9. Partial updates

### 10. Custom directives









# >>>>>>>>>>>>

Note that apart from using a type for one of its fields, this class has nothing to do with Wallace.

```tsx



```









-----









Wallace never calls `update` 

- Wallace calls `render` when mounting, nesting or repeating - so from "above".
- Whereas `update` is only called during `render` by the component itself, so "internally". 
- Lastly `update` calls `render` on nested components.







Although you may call `update` from wherever you like, Wallace only ever calls it from `render` as shown above. In every other case (mounting, nesting, updating) it calls `render`.





Components have two public methods: `render` and `update` and you can see how they relate by looking at the source code of

We'll talk about `ctrl` later, for now let's look at what this code implies, which is that you can update the DOM in two ways:

- Calling `render` with new props - which is what happens most of the time.
- Modifying the props object then calling `update()` - which you only do in certain situations.

> It might not sound like much, but this set up (along with `ctrl`) is what gives Wallace most of its power.

Let's illustrate that by implementing the `addTask` method:





 calls its render method, passing `tasks` as props (more on all this later)







Let's add a text input and button to allow the user to add new tasks:

````tsx
const TaskList: Uses<TaskProps[]> = ( tasks, { self }) => (
  <div>
    <span>Completed: {tasks.filter(t => t.completed).length}</span>
    <div>
      <Task.repeat props={tasks} />
    </div>
    <div>
      <input ref:newTaskText type="text" />
      <button onClick={self.addTask()}>Add</button>
    </div>
  </div>
);
````

Now we see this definitely differs from React:

- The function takes a second argument.
- There seems to be a component *instance* involved.
- The event seems to call its callback `self.addTask()` immediately.

This makes more sense once you understand how Wallace works, which is quite simple.

Wallace *replaces* such functions with a different function during compilation, which gets used as a constructor to create objects, which have methods:

```tsx
const component = new TaskList();
console.log(typeof component.render === 'function');
console.log(typeof component.update === 'function');
```

That `component` isn't usable yet as it 's not initialised properly, but you can get a working one back from `mount`:

```tsx
// root is an instance of TaskList
const root = mount("main", TaskList, []);
root.render([
  { text: "Learn Wallace", completed: true },
  { text: "Star Wallace on github", completed: false },
]);
```

So the function in your source code is never executed, as it doesn't even exist at run time. It's only purpose is to contain JSX which is used during compilation. Therefore:

1. You can't put anything other than a single JSX expression in the function.
2. You can't put any logic before or around JSX elements.

Think of the JSX as a static HTML string with type support and extra syntax, wrapped in a scope with all the variables you'll need.

Anything in curly brackets *copied* to a different location during compilation, which is why the event handler looks like its calling `self.addTask()`.

The button doesn't work yet, as `addTask` doesn't exist yet.

### Part 3: Methods

Components have two public methods: `render` and `update` and you can see how they relate by looking at the source code of the `render` method:

```tsx
Component.prototype.render = function (props, ctrl) {
  this.props = props;
  this.ctrl = ctrl;
  this.update();
}
```

We'll talk about `ctrl` later, for now let's look at what this code implies, which is that you can update the DOM in two ways:

- Calling `render` with new props - which is what happens most of the time.
- Modifying the props object then calling `update()` - which you only do in certain situations.

> It might not sound like much, but this set up (along with `ctrl`) is what gives Wallace most of its power.

Let's illustrate that by implementing the `addTask` method:

```tsx
TaskList.methods({
  addTask() {
    const input = this.ref.newTaskText;
    this.props.push({ text: input.value, completed: false});
    input.value = '';
    this.update();
  }
});
```

The `methods` function is just a nicer way of writing this:

```tsx
TaskList.prototype.addTask = function () {/*...*/};
```

In order to keep TypeScript happy you'll need to create an interface which lists any new methods:

```tsx
interface TaskListMethods {
  addTask: () => void;
}

const TaskList: Uses<TaskProps[], null, TaskListMethods> = 
  ( tasks, { self }) => (
  // self.addTask() is now recognised.
);
```

> The `null` is because that's where the controller type goes, which is more commonly used, but we'll get to that later.

There's a few things to note here:

1. We directly accessed and updated a DOM element.
2. We update the DOM modified the props directly, then calling `update` .

This goes completely against React's philosophy of uni-directional data flow, which sounds sensible in theory, but actually makes simple things unnecessarily complicated (hooks 🤢)  resulting in more errors and time wasted fixing them.

> Wallace assumes that you're an adult and lets you modify props in place, which produces simpler code that's less likely to hide bugs and easier to debug.

Note that we are able to use `this` in the methods, but use `self` from the second argument (called **xargs**) in the JSX as `this` isn't allowed in arrow functions.

### Part 4: reactivity

Frameworks love showing off their reactivity, which is very useful in certain cases (like form validation) but:

1. You need it a lot less than you think.
2. It all too easily causes bugs and confusion.

A sensible framework makes reactive behaviour opt-in and transparent, rather than built-in and opaque.

Wallace does precisely this with its standalone `watch` function, which simply returns a proxy of an object (which can be an array) that calls a callback whenever it (or its nested objects) are modified:

```tsx
import { watch } from 'wallace';

const original = {};
const proxy = watch(original, () => alert('Changed'), 0);
proxy.a = {x: 1};           // fires alert
original.b = {x: 1};        // doesn't fire alert
proxy.b.x = 2;		        // fires alert
console.log(proxy);         // {a: {x: 1}, b: {x: 2}}
console.log(original);      // {a: {x: 1}, b: {x: 2}}
```

> We passed `0` as third argument, which is only necessary while testing to cancel the default timeout of 50ms. The timeout prevents the callback from being fired twice when manipulating arrays, as JavaScript updates the `length` property on operations like `push` and `pop`. As this is mainly used to respond to UI clicks, 50ms is a safe period. Welcome to the joys of implementing reactivity in a framework.

Let's use this function to make our component update whenever the array of tasks is changed:

```tsx
TaskList.methods({
  render (props) { // We're not using `ctrl` so can ignore it.
    this.props = watch(props, () => this.update());
    this.update();
  },
  addTask () {
    const input = this.ref.newTaskText;
    this.props.push({ text: input.value, completed: false});
    input.value = '';
    // this.update(); << no longer needed.
  }
})
```

This works as `render` is only called once by `mount` in this example, and shows the usefulness of having separate `render` and `update` methods.

The final piece is swapping `checked` for the `bind` directive, which sets up two-way binding between the props (which are reactive) and the element:

```tsx
const Task = ({ text, completed }) => (
  <div>
    <input type="checkbox" bind={completed}/>
    <label>{text}</label>
  </div>
);
```

Our task list is now fully reactive.

The advantages of this approach are that:

1. You can clearly see how, why and when the component updates.
2. You can easily add extra operations on update, like logging.

### Part 5: controllers

Let's make things interesting by adding undo/redo functionality. But before we implement this, let's move some of the existing functionality out to a separate class which we'll use as a controller:

```tsx
import { ComponentInstance, Uses, mount, watch } from "wallace";

const TaskList: Uses<null, Controller> = (_, { ctrl, self }) => (
  <div>
    <span>Completed: {ctrl.tasks.filter(t => t.completed).length}</span>
    <div>
      <Task.repeat props={ctrl.tasks} />
    </div>
    <div>
      <input ref:newTaskText type="text" />
      <button onClick={self.addTask()}>Add</button>
    </div>
  </div>
);

TaskList.methods({
  render (props) {
    this.ctrl = new Controller(this, props);
    this.update();
  },
  addTask () {
    const input = this.ref.newTaskText;
    this.ctrl.tasks.push({ text: input.value, completed: false});
    input.value = '';
  }
});

class Controller {
  root: ComponentInstance;
  tasks: TaskProps[];
  constructor(root: ComponentInstance, tasks: TaskProps[]) {
    this.root = root;
    this.tasks = watch(tasks, () => this.root.update());
  }
}
```

Here's what we did:

##### Define a controller class

This is an ordinary class - nothing to do with Wallace. It has a reference to the component so it can update it whenever the tasks are modified.

We could have move `addTask` to the controller, but it deals with details of the component so belongs with the component. Generally you keep DOM related bits on the component, and logic in the controllers.

##### Create an instance in render

Again, `render` only gets called once in this example, so we;re only creating one instance of the controller class.

##### Stop using props in TaskList

We no longer set `this.props` or access that in the JSX. You might wonder why we don't just assign the controller to the props:

```tsx
// Don't do this
this.props = new Controller(this, props);
```

The point of `ctrl` is that it is propagated to all nested components. To illustrate this is, let's improve our todo list by ensuring we don't add the same task twice.

First we add a method to the controller:

```tsx
class Controller {
  /*...*/
  isTextInUse (text) {
    return this.tasks.some((t) => t.text === text);
  }
}
```

Next we're going to pull the input and button out to its own component:

```tsx
const AddTaskBox: Uses<null, Controller> = (_, { self }) => (
  <div>
    <input ref:newTaskText type="text" />
    <button onClick={self.addTask()} disabled={self.isValid()}>Add</button>
  </div>
);

const TaskList: Uses<null, Controller> = (_, { ctrl }) => (
  <div>
    <span>Completed: {ctrl.tasks.filter(t => t.completed).length}</span>
    <div>
      <Task.repeat props={ctrl.tasks} />
    </div>
    <AddTaskBox.nest />
  </div>
);
```

That wasn't strictly necessary but it helps with the example. Then we transfer the `addTask` method from `TaskList` to `AddTaskBox`'s methods, and add a couple more that we'll need:

```tsx
AddTaskBox.methods({
  addTask () {
    this.ctrl.tasks.push({ text: this.getText(), completed: false});
    this.ref.newTaskText.value = '';
  },
  isTextValid () {
    const text = this.getText();
    return text.length && !this.ctrl.isTextInUse(text);
  },
  getText () {
     return this.ref.newTaskText.value;
  }
});
```

This works because nesting sets its `ctrl` to the same as the parent component

It's also very easy to extract methods to a controller if you decide you need one:

```jsx
const AddTaskBox: Uses<null, AddTaskBoxController> = (_, { ctrl }) => (
  <div>
    <input ref:newTaskText type="text" />
    <button onClick={ctrl.addTask()} disabled={ctrl.isValid()}>Add</button>
  </div>
);

AddTaskBox.methods({
  render (props, ctrl) {
    this.ctrl = new AddTaskBoxController(this.ref.newTaskText, ctrl);
    this.update();
  }
})

class AddTaskBoxController {
  inputElement: HTMLElement;
  taskController: Controller;
  constructor(inputElement: HTMLElement, taskController: Controller) {
    this.inputElement = inputElement;
    this.taskController = taskController;
  }
  addTask () {
    this.taskController.tasks.push({ text: this.getText(), completed: false});
    this.inputElement.value = '';
  }
  isTextValid () {
    const text = this.getText();
    return text.length && !this.taskController.isTextInUse(text);
  }
  getText () {
     return this.inputElement.value;
  }
}
```

Notice how this controller has a reference to the controller above it. This is a common pattern.

In a sense Wallace doesn't really "have" controllers - it just has is a mechanism for propagating a reference down to all nested components. And that's all you really need.

The examples show how to use controllers to load asynchronous data or implement undo/redo functionality.

### Part 6 - stubs

Components can extend other components, and one of the main reasons to do this are stubs.

Let's replace the nested `AddTaskBox` with a stub: 

```tsx
const TaskList: Uses<null, Controller> = (_, { ctrl }) => (
  <div>
    <span>Completed: {ctrl.tasks.filter(t => t.completed).length}</span>
    <div>
      <Task.repeat props={ctrl.tasks} />
    </div>
    <stub.addTaskBox />
  </div>
);
```

And create an new component which responds to "enter" rather than push a button:

```tsx
const NewTaskInputBox: Uses<null, Controller> = (_, { self, event }) => (
  <div>
    <input type="text" onKeyUp={self.addTaskKeyup(event as KeyboardEvent)} />
  </div>
);

NewTaskInputBox.methods({
  addTaskKeyup(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const text = target.value;
    if (event.key === "Enter" && text.length > 0) {
      this.ctrl.tasks.push({ text, completed: false });
      target.value = "";
    }
  }
})

```

We can now extend our `TaskList` and make the stub use our new component:

```tsx
import { extendComponent } from 'wallace';

const NoButtonTaskList = extendComponent(TaskList);
NoButtonTaskList.stubs.addTaskBox = NewTaskInputBox;
```

The `NoButtonTaskList` inherits the methods from `TaskList`, including `render` which sets the controller. It also inherits stubs, so we could set a default on `TaskList`: 

```
TaskList.stubs.addTaskBox = AddTaskBox;
```

It also inherits the component definition, but can override that, perhaps to rearrange or remove elements:

```tsx
const NoButtonTaskList = extendComponent(TaskList, (_, { ctrl }) => (
  <div>
    <stub.addTaskBox />
    <div>
      <Task.repeat props={ctrl.tasks} />
    </div>
  </div>
);
```

So this mechanism can be used in opposite ways:

* Set the DOM structure in the base, and some or all stubs on the child.
* Set the DOM structure in the child, and inherit and/or override stubs from the base.

This lets you create bases classes for your component library with minimal duplication, which reduces errors, effort and bundle size.

### Part 7 - partial updates

Let's use a `ref` to manipulate the label element and set its `color` style property:

```tsx
const Task: Uses<TaskProps> = ({ text, completed }) => (
  <div>
    <input type="checkbox" checked={completed}/>
    <label ref:label>{text}</label>
  </div>
)

Task.methods({
  update() {
    Component.prototype.update.apply(this);
    this.ref.label.style.color = this.props.completed ? 'grey' : 'black';
  }
})
```

Obviously it would be much neater doing it this way:

```tsx
<label style:color={completed ? 'grey' : 'black'}>{text}</label>
```

The point is that they do the exact same thing. Components update the DOM by setting properties on specific elements which they store references to. Everything else gets ignored, and this is why it's so damn fast.

The only difference is that in the latter example, the `update` method also:

1. Checks if the value has changed since last update before modifying the element.
2. Doesn't update an element (or even query the associated value) if it, or a parent element is hidden or detached from the DOM through directives like `if`, `show` and `hide`.

This means you can safely update elements manually alongside the component's own operation. Notice how we manually set the `style` of the same element whose `textContent` is updated by the component. 

This comes in handy in several situations:

1. You've got something that is best handled manually, perhaps a chart or an animation.
2. The framework (or third party component) is misbehaving and you need to patch the behaviour while you wait for a fix.
3. You want to run partial updates for performance reasons or just smoother UI.

To illustrate this last case, lets add a feature which lets you select some of your completed tasks for whatever purpose, like archiving them:

```jsx
const Task: Uses<TaskProps> = ({ text, completed }) => (
  <div>
    <input type="checkbox" checked={completed}/>
    <label>{text}</label>
    <input type="checkbox" ref:select hidden />
  </div>
);

Task.methods({
  render(props, ctrl) {
    this.props = props;
    this.ctrl = ctrl;
    this.ctrl.taskComponents.push(this);
    this.ref.select.hidden = true;
    this.ref.select.checked = false;
    this.update();
  }
});

class Controller {
  /*...*/  
  taskComponents: ComponentInstance<TaskProps>[] = []
  /* Displays select checkbox on all completed tasks */
  enterSelectMode () {
     const completed = this.taskComponents.filter(c => c.props.completed);
     completed.forEach(c => c.ref.select.hidden = false);
  }
  /* Collects selected tasks and hides select checkbox */
  exitSelectMode () {
     const selected = [];
     this.taskComponents.forEach(c => {
        const checkbox = c.ref.select
        if (checkbox.checked) {
          selected.push(c.props);
        }
        checkbox.checked = false;
        checkbox.hidden = true;
      });
     return selected;
  }
}
```

This shows how easily you can:

1. Apply changes to a subset of nested components.
2. Update part of a component.

All without re-rendering the whole `TaskList` - which produces no noticeable difference in this small example, but when you're dealing with large tables or other deeply nested structures, it can be very noticeable.

You do need to be careful however:

- The `taskComponents` array must be cleared every time the `TaskList` updates.
- The checkbox element must be reset during `render` in case the user bails out of the operation (as repeated components get reused).

You could also do this with a `selected` property on the props etc... It is also not good practice to extract the props objects back out of components, and to use ids instead.

The point is that this is possible and easy to do this kind of thing without getting too messy in situations which validate doing so, whereas that is not the case with many other frameworks.








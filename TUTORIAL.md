## Tutorial

Code along in the browser ([TypeScript](https://stackblitz.com/edit/wallace-ts?file=src%2Findex.tsx) or [JavaScript](https://stackblitz.com/edit/wallace-js?file=src%2Findex.jsx)) or work locally with:

```
npx create-wallace-app
```

### At a glance

We're going to build a simple task list which reacts to the tasks being toggled. It should look something like this:

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


Here is the code:

```jsx
import { mount } from "wallace";

const Task = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done}/>
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TaskList = ( tasks ) => (
  <div reactive>
    <span>Done: {tasks.filter(t => t.done).length}</span>
    <div>
      <Task.repeat props={tasks} />
    </div>
  </div>
);

mount("main", TaskList, [
  { text: "Complete tutorial", done: false },
  { text: "Star on github", done: false },
]);
```

Here's what the codes does:

- Defines two components as functions which return JSX.
- Mounts an instance of `TaskList` to the element with id `main`, passing an array of objects as its props.

If you've used React, this will feel very familiar, except:

- The UI is reactive (in React you'd have to use hooks or some other BS).
- The JSX looks quite different.

#### Special JSX

Wallace uses JSX very differently to React, which results in far more compact and readable code, and lets us do clever things like:

- Making a component reactive.
- Binding data to values.
- Toggling classes.

But you don't need to remember all that. You only need to remember is this:

```jsx
<div help>
   ...
</div>
```

This will display the helper in your browser which lists the syntax rules and available directives (attributes that do special things) including any custom ones you define.

#### TypeScript

Lastly, you can make Wallace play nice with TypeScript:

```tsx
import { mount, Accepts } from "wallace";

interface iTask {
  text: string;
  done: boolean;
}

const Task: Accepts<iTask> = ({ text, done }) => (/*...*/);

const TaskList: Accepts<iTask[]> = ( tasks ) => (/*...*/);

mount(/*...*/);
```

You will get an error if you pass the wrong type to `mount` or to `props` in JSX. It knows that `props` in a repeated element is an array of the component's accepted type.

```jsx
<div>
  <Task.repeat props={tasks} />
</div>
<div>
  <Task.nest props={tasks[0]} />
</div>
```

Now we've had a quick glance, let's look at things in more detail.

### Components

Component means two different things in Wallace. The code below shows a component *definition* saved as `Greeting`, and a component *instance* saved as `component`:

```jsx
import { mount } from 'wallace';

const Greeting = ( msg ) => (
  <div>
    A message from Wallace:
    <h3>{msg}</h3>
  </div>
);

const element = document.getElementById('main');
const component = mount(element, Greeting);
component.render('Hello');
```

Notice how we tell the component *instance* to render itself, rather than pass the component definition to a separate coordinating object (aka the engine) as we do in React:

```jsx
const root = ReactDOM.createRoot(element);
root.render(<Greeting msg={'Hello'}/>)
```

Wallace doesn't have an engine. It only has component instances, each of which update its own DOM, and tells its nested component to do the same.

We'll cover why this matters later (spoiler: it lets you match vanilla performance) but first let's understand components a bit better.

If you want you can replace the last 3 lines with this, which does the same thing:

```jsx
mount(element, Greeting, 'Hello');
```

#### Methods

So far we've seen the `render` method, which essentially does this:

```jsx
function render ( props ) {
  this.props = props;
  this.update();
};
```

This might seem clunky, but it lets us do cool things later on, like controlling reactive behaviour. The difference between these two methods is basically:

- `render` is called from outside the component and accepts one argument.
- `update` is (usually) called from within and takes no arguments as it expects the `props` to be set on the instance.

You can override these methods by defining your own on the component prototype, like so:

```jsx
import { mount } from 'wallace';

const Greeting = ( msg ) => (
  <div>
    A message from Wallace:
    <h3>{msg}</h3>
  </div>
);

Greeting.prototype.render = function ( props ) {
  this.props = props;
  setTimeout(() => this.update(), 2000);
};

mount(element, Greeting, 'Hello');
```

This updates the `h3` after a 2 second delay.

We'll cover where `render` and `update` come from to begin very shortly. First let's cover the final thing you need to know about components.

#### Refs

To explain how `update` works let's change the code as follows:

```jsx
import { mount } from 'wallace';

const Greeting = ( msg ) => (
  <div>
    A message from Wallace:
    <h3>{msg}</h3>
    <h4 ref:caption>Lorem ipsum...</h4>
  </div>
);

Greeting.prototype.render = function ( props ) {
  this.props = props;
  this.ref.caption.textContent = "there's no magic here";
  setTimeout(() => this.update(), 2000);
};

mount(element, Greeting, 'Hello');
```

This populates the `h4` element instantly, whereas the `h3` only appears after 2 seconds.

The objects in `ref` point to real DOM elements, so when we set its `textContent` property it repaints instantly, without the need to call `update`. We could do this from anywhere:

```jsx
const component = mount(element, Greeting, 'Hello');
component.ref.caption.textContent = "there's no magic here";
```

When we call `update` the `h3` gets updated, and the `h4` remains as it is. The reason for this is because `update` uses internal refs. So both do the exact same thing, except `update` 

Essentially a component builds its DOM once, finds the dynamic elements and saves internal references to them, then during `update` it checks whether the value has changed before applying the change.

It doesn't compare virtual DOM for all the unchanged elements.

it doesn't have to traverse the DOM again

This explains why Wallace is so fast.

It is simple and resilient, and this means you can safely dip into components and update elements.

#### Freedom

Grid example

### Compilation



Advantages of compilation.

JSX restrictions.

Tradeoffs.

This forces you to do things differently, but in a strange turn of events, this actually makes your code cleaner and better organised, which improves your productivity.

#### About prototypes

With 99% of front end JavaScript involving a framework, people 



```jsx
function User ( name ) {
  this.name = name;
}

User.prototype.sayHello = function () {
  alert(`${this.name} says hello`);
}

const user1 = new User('Bill');
if (user1.hasOwnProperty('name')) {
  user1.sayHello();   
}
```

Now you know this, you might be wondering where `render` and `update` come from.



```

```

### How to do things

Visibility

Styles

CSS and toggles

Formatting

Services

Nesting (in refs)

Pool control

Stubs
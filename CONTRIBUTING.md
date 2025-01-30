# Contributor docs

## Quick start

### Installation

This project uses [npm workspaces](https://ruanmartinelli.com/posts/npm-7-workspaces-1/), so you can install all packages at once from root directory:

```sh
npm i
```

This will only create a **node_modules** directory at root, and in packages whose dependencies differ, so don't worry if some packages don't have their own.

It will also symlink local dependencies, including **wallace** and **babel-plugin-wallace**. The latter needs to be compiled before you can use it:

```sh
cd packages/babel-plugin-wallace
npx tsc
```

You will need recompile **babel-plugin-wallace** whenever you make any changes to it, but **wallace** is not compiled so your changes should appear immediately.

### Running tests

All the tests are in **packages/wallace** and can be run with:

```sh
cd packages/wallace
npm test
```

However this runs all the tests, and during development you may want to restrict this. See the section on tests below.

### Using the playground

The **playground** package allows you to experiment without committing changes, as its **src** directory is gitignored.

To launch it, run:

```
cd playground
npm start
```

If you get errors about packages not being found, it may be that a third party package (such as JSDOM) need updating.

### Packages

User projects requires two packages to work: 

- **wallace** - the library with definitions you import into a project.
- **babel-plugin-wallace** - the babel plugin which transforms the source code.

Note that `wallace` always requires `babel-plugin-wallace` at the exact same version, so a user project would only need to require `wallace`

```bash
npm i wallace@0.0.7
```

To maintain consistency we publish a new version of both packages even if only one has actual changes.

## Development

### Third party tools

This project uses:

* [npm workspaces](https://ruanmartinelli.com/posts/npm-7-workspaces-1/) to cross-install dependencies.
* [lerna](https://lerna.js.org/) to publish packages.
* [jest](https://jestjs.io/) for tests.

Try follow [Mozilla Guidelines](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript) except:

* End your comments with a full stop, so it's clear you intended to finish the sentence.

### Workspaces

You can use the `-w` argument on most `npm` commands to apply that solely to one workspace:

```sh
npm install tap --workspace package-b --save-dev
npm run test --workspace=a
```

Alternatively just `cd` to that directory. Having said that, most scripts live in the top level directory.

### Branching

1. Branch off `master`  (there is no `develop` branch)
2. If there are no functionality changes, just raise a PR to get it merged back into master.
3. If there are functionality changes then we create a release. See [publishing](#Publishing)

### Dependencies

The rules are:

1. If it is required just for testing, it goes in the root **package.json**.
2. If it is required for the distribution of a package, it goes that package's **package.json** `dependencies` (not `devDependencies` as these do not get installed).

It is easy to get this wrong, which is why we (will) have a canary test which installs just `wallace` into a project (outside of workspaces) and would fail to run babel if any packages are missing.

### Inspecting generated code

It is often useful to inspect the generated code, which you can do in two ways:

#### In the terminal

Where `@babel/cli` is installed you can run a file through babel with npx:

```
npx babel src/index.jsx 
```

This will read from **babel.config.cjs** and print the transpiled code. Note that you must have `@babel/preset-env` in there, or else you will get different output.

And you should also set it to `modules: false` :

```
[["@babel/preset-env", { modules: false }]]
```

To avoid your code looking like this:

```
"2": (0, _wallace.findElement)(root, [1])
```

Instead of this:

```
"2": _wallace.findElement(root, [1])
```

#### In the browser

In development mode you would typically set webpack's devtool to:

```
config.devtool = "eval-source-map";
```

The browser'd dev console will point error points and console logs to your ES6 source files. However, if you don't set `devtool` then it shows you the generated code.

Given how useful this is, the webpack files in this project use an environment variable to let you control this behaviour without having to modify the file.

## The Babel plugin

Writing babel plugins can be tricky, so we're leaving some general notes before covering our plugin.

### General notes on writing Babel plugins.

The main/only documentation is in the [Babel handbook](https://github.com/kentcdodds/babel-plugin-handbook/blob/master/README.md), which you should read. The [AST explorer](https://astexplorer.net/) is also very helpful, except it doesn't do JSX. Lastly, ChatGTP has been extremely useful too.

#### Overview

Babel is a tool which parses source code into an AST and traverses the nodes. Babel itself doesn't transform anything, it's the plugins which do that.

Plugins work by declaring "visitors" which get called when a particular node type is visited, and may apply transformations.

Presets are just collections of plugins.

#### Visiting order

According to [Plugin Ordering](https://babeljs.io/docs/plugins/#plugin-ordering), Babel loads plugins in the order declared, then (plugins from) presets in reverse order:

```js
module.exports = {
  plugins: [1, 2, 3],
  presets: [5, 4],
};
```

However, it ***may appear*** to do the opposite!

Babel traverses the tree of nodes top to bottom, so if plugin 5 visits a higher level node, that node (and its children) may be transformed by the time plugin 1 gets to visit a deeper node.

##### Example

Suppose we have the following `babel.config.cjs` file:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
};
```

This as our `babel-plugin-wallace`:

```js
module.exports = () => {
  return {
    visitor: {
      JSXElement(path) {
        console.log(path.parent.type);
      },
    },
  };
};
```

And this is the source code:

```jsx
const Foo = ({name}) => (
  <div>
    <p>{name}</p>
  </div>
)
```

The console will log `ArrowFunctionExpression` because that is indeed the parent node's type.

However if we add the `@babel/preset-env` preset to our config:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
  presets: ["@babel/preset-env"],
};
```

Then the console logs `ReturnStatement` which probably breaks our plugin, and makes us doubt whether Babel really applies plugins before presets.

However the explanation is logical.  Babel visits the `ArrowFunctionExpression` before visiting its child nodes, such as the `JSXElement`. The `@babel/preset-env` transforms the `ArrowFunctionExpression` into this:

```jsx
var Foo = function Foo(_ref) {
  var name = _ref.name;
  return <div>
    <p>{name}</p>
  </div>;
};
```

During the transformation the `JSXElement` node got moved into a `ReturnStatement`. Babel continues walking the (freshly modified) tree, and eventually reaches the `JSXElement`, calling the visitor in `babel-plugin-wallace` which detects its parent as the `ReturnStatement`.

One way to get around this would be for `babel-plugin-wallace` to declare a `ArrowFunctionExpression` visitor, which as per ordering rules, will be called before `@babel/preset-env` does:

```js
module.exports = () => {
  return {
    visitor: {
      ArrowFunctionExpression(path) {
        // do stuff before @babel/preset-env
      },
    },
  };
};
```

The node can be passed to another visitor. See https://github.com/babel/babel/issues/12976

#### Building new code

You create new nodes using `t` like so:

```js
path.replaceWith(
  t.expressionStatement(t.stringLiteral("Is this the real life?"))  
);
```

All the types are defined [here](https://github.com/babel/babel/blob/master/packages/babel-types/src/definitions/core.js).

#### State

Avoid global state at all costs. Instead pas state as an object to the `traverse()` method and have access to it on `this` in the visitor.

```js
const visitorOne = {
  FunctionDeclaration(path) {
    var expectedName = path.node.params[0].name;
    path.traverse(visitorTwo, { expectedName });
  }
};

const visitorTwo = {
  Identifier(path, state) {
    if (path.node.name === state.expectedName) {
      // ...
    }
  }
};
```

#### Visitor continuation

Calling `path.traverse(node)` will traverse all of node's children, regardless of what other traversals are invoked. In the following example, identifiers inside functions will be visited by visitorTwo, then again by visitorOne, unless removed:

```js
const visitorOne = {
  FunctionDeclaration(path) {
    path.traverse(visitorTwo);
  }
  Identifier(path, state) {
    // transform here
  }
};

const visitorTwo = {
  Identifier(path, state) {
    // transform here
  }
};

path.traverse(visitorOne);
```

And any identifiers added to the AST by visitorTwo will be visited by visitorOne.

#### Examples

You can look at how other plugins are written:

https://github.com/babel/babel/tree/main/packages

### Babel-plugin-wallace

Our plugin is written in TypeScript and therefore needs to be compiled after making changes with:

```
npm run build
```

There is very little documentation on writing a plugins in TypeScript, other than [this issue](https://github.com/babel/babel/issues/10637).

#### Structure

The code is roughly organised as follows:

##### Visitors

The entry point of the plugin is a set of visitors, which uses contexts (below) to determine whether a function returns JSX and should be transformed, in which case it:

1. Renames function parameters, as that really needs to be done first.
2. Starts parsing the JSX, which involves calling other visitor sets.

It can be tricky wrapping your head around how visitors work, see notes further down.

##### Contexts

The various contexts where JSX is allowed. This made more sense when we supported classes and JSX outside of functions, so some of the code there is unused but may be brought back.

##### Models

These are just classes which represent real world object, like module, component, node etc... They have methods to add to their own data. The Node model is also passed to the directives, so users will interact with it if writing their own.

##### Consolidation

The JSX parsing works one node at a time, and is unaware of nodes that are processed after. Any work that needs to happen once all the nodes have been parsed, happens in consolidation.

##### Writers

These write the final generated code after consolidation.

So the steps are roughly IDENTIFY > COLLECT > CONSOLIDATE > WRITE but most activities can happen at any step:

* Throwing user errors
* Working with AST

#### Tests

We do not test the plugin in isolation as:

1) The generated code depends on the wallace library, so we test over there.
2) The resulting output changes too often over time to validate maintaining tests.
3) The internal code changes too much to validate testing bits of that.

So we make sure to cover anything we think might break in the wallace tests, even if it doesn't seem obvious from there why it would.

#### Checking output

You can see the effect of the plugin by running a file through babel with npx:

```
npx babel src/index.jsx
```

The playground app's `babel.config.cjs` has toggles to disable presets, and npm scripts to run checks. Bear in mind you need to recompile if you've made any changes.

### Considerations

#### Persistent state

Tools like webpack load the plugin once, then run each file through it, so any global state will get carried over, and can cause errors such as failing to add imports because it thinks they have already been added. However, the unit tests load the plugin once per file, thereby hiding such mistakes.

#### Presets

Babel will typically read from the local **babel.config.cjs** which should look like this:

```js
module.exports = {
  plugins: ["babel-plugin-wallace", "@babel/plugin-syntax-jsx"],
  presets: ["@babel/preset-typescript", "@babel/preset-env"],
};
```

However, this plugin must work if either of those presets are missing (and to a degree, if others are added) so it is important to test changes with each permutation.

The plugin must work whether `@babel/preset-env` is set or not, meaning we cannot rely on those transformations happening, which is unfortunate as it would simplify things like props destructuring.

There should be tests which check this, but if making changes to the visitors then it is worth checking explicitly.

## Tests

### Running tests

All tests are in the wallace package.

```
cd packages/wallace
npm test
```

You can also run individual test suites by passing arguments. The suites are numbered, which makes it easy:

```
npm test 10 11
```

But you can also use keywords:

```
npm test nest
```

### Coverage

Obviously, every aspect and feature must be tested, but coverage goes well beyond that...

##### Think laterally

The following test may appear to prove that placeholders in attributes work:

```jsx
test("Placeholders in attribute works", () => {
  const css = "danger"
  const MyComponent = () => (
    <div class={css}>
      Hello
    </div>
  );
  const component = testMount(MyComponent);
  expect(component).toRender(`
    <div class="danger">
      Hello
    </div>
  `);
});
```

But in fact it only proves that placeholders in attributes work:

* When they occur in the root element.
* When there is only one attribute and placeholder per element.
* On first render.

The framework could easily end up in a state where this test would pass, yet it fails to update attribute placeholders in nested elements, when there are multiple placeholders, or after initial render. Familiarity with the plugin code helps identify what kind of eventualities need tested, but the key is to remember that:

> We're recursively traversing JSX, keeping tally of various things and collecting directives and other bits to assemble a dynamically updating DOM. In this environment, a small oversight can cause utterly baffling behaviours.

The best policy is to assume that anything could go wrong, and test behaviour in different scenarios, notably:

* In nested elements.
* After an update, then another.
* With single and multiple cases of the behaviour.
* For each possible way of invoking. E.g. variables can come from constants, functions, literals etc.
* For each possible way of defining a component:
  * As a class
  * In nested components
  * In repeated components

Thinking of all the ways a user may attempt to use a feature may alert us to a use case that we hadn't thought of that needs to catered for, or guarded against.

##### Incorrect usage

In addition to testing correct usage in all cases, we need to ensure an appropriate error is raised when:

* The feature itself is used incorrectly.
* Other conditions cause it to fail, such as a variable not being declared.

Remember the user may not be using TypeScript. Thinking of all the ways a feature could fail helps us anticipate those errors and display helpful rather than cryptic error messages.

### Organisation

#### Issues

##### General

We do not test inside the plugin. We test the behaviour resulting from the interaction of wallace and the plugin. All tests live in the **wallace** package.

##### Intersections and permutations

The following test the intersection or visibility and nesting:

* `nested classes do not update when hidden themselves`
* `nested classes do not update when underneath a hidden element`

We need to decide whether they should live in the suite for visibility, nesting or elsewhere. Then we need to account for the fact these tests need to run against components defined as functions or as classes, so we need to decide whether we group tests by function/class then feature, or the other way around. These organisation dilemmas are so prevalent we had to come up with specific rules.

#### Guidelines:

Each test suite should:

1. Test one particular aspect or feature.
2. Be numbered sequentially. The more basic a feature, the lower the number.
3. Only use features covered earlier.
4. Cover permutations covered earlier.
5. Break these rules if it results in better tests.

Say the structure is as follows:

```
01.defining.spec.jsx
02.rendering.spec.jsx
03.mounting.spec.jsx
04.placeholders.spec.jsx
05.directives.spec.jsx
06.refs.spec.jsx
07.visibility.spec.jsx
08.events.spec.jsx
09.nesting.spec.jsx
10.repeat.spec.jsx
11.extending.spec.jsx
```

Having the guidelines, yet being able to break them, solves some dilemmas:

* In `1.defining.spec.jsx` we cover the valid ways to define components, including functions and classes and single or deconstructed props. According to rule 4, this means all subsequent suites must cater for those permutations, so that makes that decision easier. 
* In `02.rendering.spec.jsx` we use mounting, which goes against rule 3, however we're not testing 
* Refs are perhaps less primary than visibility, but really help testing that, so we slot them in before. 
* Rule 3 tells us we test refs apply to nested components in `9.nesting.spec.jsx` not `6.refs.spec.jsx`.

When we add stubs:

```jsx
// problem with :hide not working.
export class DialogWithHub extends ModalBase {
  __stubs__ = {
    content:
      <div class="mb-4">
        <div :show=".hub.loading" class="loader"></div>
        <div :hide=".hub.loading">Loaded</div>
      </div>
  };
}
```

We have to decide whether we add that structure to `1.defining.spec.jsx` and therefore cater for it throughout the other suites, or to create it as its own feature, and test other features within it.

### Types of test

There are several ways to test features.

##### Inspect the rendered HTML

The default way to test. Use `testMount` to mount the component and use the custom jest matcher `toRender`.

```jsx
import {testMount} from '../utils'

test('Descriptive name', () => {
  const Foo = 
    <div>
      Hello {name}!
    </div>

  let name = 'Wallace'
  const component = testMount(Foo)
  expect(component).toRender(`
    <div>
      Hello <span>Wallace</span>!
    </div>
  `)
})
```

Note how a `span` element is created for placeholders in text.

This doesn't work for cases where we update DOM element states such as hidden or disabled, in which case you're best inspecting the DOM element itself.

##### Inspect the DOM element

You can inspect an element directly by setting a ref:

```jsx
test('Descriptive name', () => {
  let disabled = false
  const Foo = () => (
    <div>
      <button ref:btn disabled={disabled}>test</button>
    </div>
  )
  const component = load(Foo)
  const btn = component.ref.btn
  expect(btn.disabled).toBe(false)
  disabled = true
  component.update()
  expect(btn.disabled).toBe(true)
})
```

##### Expect compilation output

Assess whether the code compiled with or without an error:

```jsx
describe("Additional arguments", () => {
  test("are allowed if recognised", () => {
    const src = `
    const A = ({}, _event, _component, _element) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithoutError();
  });

  test("must be identifiers", () => {
    const src = `
    const A = ({}, {}) => (
      <div>
        Test
      </div>
    );
  `;
    expect(src).toCompileWithError(
      'Illegal parameters: "ObjectPattern". You are only allowed "_element", "_event" and "_component".',
    );
  });
});
```

This allows us to ensure syntax errors are raised. 

We have very limited tests on the generated code as that frequently changes shape.

## Performance

For quick checks this is handy: https://jsben.ch/

### Benchmarks

We measure performance by running [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) locally. 

##### Updating the tool

Update from master to get latest changes. You may need to update node version to latest too.

##### The server

The server lets you access all the implementation pages.

```
npm ci && npm run install-server
npm start
```

It should run on 8080, but will fail silently if that port is in use, so check. Leave this running in a session.

##### The webdriver

The webdriver is a script which accesses the implementations on the server (which must be running in a separate terminal).

```
cd webdriver-ts
npm ci
npm run compile
```

##### Create an implementation

Copy the default implementation to a new directory:

```
cd frameworks/non-keyed
cp -r wallace wallace-xyz
```

If you're testing a released version, install that. If you're testing local changes then use npm link to create global links:

```
cd /code/wallace/packages/wallace
npm link
cd /code/wallace/packages/babel-plugin-wallace
npm link
```

These will point to whatever is currently in there.

Next in your implementation, run:

```
npm link wallace babel-plugin-wallace
```

For some reason you must do both at the same time, else one unlinks the other!

You can now run:

```
npm run build-prod
```

Which will use whatever changes you have active, so be careful! If you have multiple branches and implementations it is easy to forget which you're pointing to.

Also, bear in mind the results for an implementation get added to previous runs, so if you make code changes then you need to delete those results. See them here:

```
ls webdriver-ts/results/
```

##### Build implementations you want to test

```
cd frameworks/non-keyed/wallace-xyz
npm ci
npm run build-prod
```

Check by viewing http://localhost:8080/frameworks/keyed/vanillajs/index.html (note the **/index.html** is needed for some frameworks)

##### Run the benchmarks

Make sure the window stays visible and try not to use your machine for anything else.

```
cd webdriver-ts
npm run bench non-keyed/vanillajs non-keyed/wallace non-keyed/vue non-keyed/svelte-classic non-keyed/lit non-keyed/inferno
# Or just some benchmarks
npm run bench -- --benchmark 01_ 02_ --framework keyed/vanillajs keyed/react-hooks
# Optionally nspect results
cat results/vanillajs-keyed_01_run1k.json
```

##### View the results

The results need to be compiled into a table.

```
cd webdriver-ts-results
npm ci
cd ..
npm run results
npm run index
```

You can now see them at [http://localhost:8080/webdriver-ts-results/dist/index.html](http://localhost:8080/webdriver-ts-results/dist/index.html).

##### Notes

1. You need at least 10 runs. Try to run them at the same time, with as little other applications running as possible.
2. The values are specific to your machine, so don't compare them to online results. The geometric mean is a value relative to other frameworks selected.
3. The results are aggregated from all runs, so delete old results if changing the code or updating frameworks.
4. The keyed implementation doesn't currently work, so stick to non-keyed.
5. Compare any changes in wallace to:
   1. The previous version.
   2. Other prominent frameworks.

### Bundle size

We aim to keep the base bundle size of `wallace` to a minimum by:

* Enabling tree shaking.
* Avoiding ES6 constructs that add mounds of extra code when transpiled, such as classes.

You can obtain the real size of a bundle in a project with: 

```sh
du -b dist/bundle.js
```

## Technical notes

This section contains notes on some of the features.

### Walking JSX

We use Babel's visitor pattern to walk the JSX tree, parsing placeholders and directives as they are encountered, then removing the node after it is visited. This has several implications:

1. Errors must be thrown as they are encountered, as the node where the error occurs will be removed.
2. Directives have no knowledge of what comes after, although they can visit nested JSX.

### Hiding

It is far easier to retain an item in the DOM and mark it hidden than to repeatedly remove it and add it back in. If an element is hidden, then any nested watches should be skipped. Wallace achieves this by counting at compilation how many watches should be skipped for each potentially hidden element, and embedding that in the watches.

### Repeat

Repeat behaviour uses "repeaters" - see lib/repeaters.

### Stubs

A stub is just a component definition assigned to a prototype field.

## Publishing

We use [lerna](https://lerna.js.org/docs/features/version-and-publish) to publish, which involves the following workflow:

1. Create a release candidate branch (e.g `rc-0.0.2`) off master.
2. Add the changes in as few commits as possible (`merge --squash feature/branch`).
3. Run `npm run publish` which:
   1. creates a new commit
   2. creates a tag for it
   3. pushes the tag to github
   4. publishes it to npm

Our script also runs `npm whoami` first to ensure we are logged into npm, otherwise publishing fails and the project is left in a messy state. This is why we don't publish from master branch.

The tag keeps that commit and all previous commits from being garbage collected, which is why we ideally put all the changes in one commit.

The  `--force-publish` flag will force Lerna to always version all packages, regardless of if they have changed since the previous release.
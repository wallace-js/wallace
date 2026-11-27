# TypeScript

This explains how Wallace's types are put together, and why some parts look odd. Read
it before changing `packages/wallace/lib/types.d.ts`.

## Overview

All the types are in `packages/wallace/lib/types.d.ts`, which is shipped as is. It
contains:

- The `wallace` module: `ComponentFunction`, `Component`, `ComponentInstance`, the
  `Takes` and `Uses` annotations, and the functions such as `mount`.
- `DirectiveAttributes`, whose JSDoc is the tooltip help for each directive.
- A `declare global` block with the `JSX` namespace, and an augmentation of `Function`
  (see below).

A component is an arrow function annotated with `Takes` or `Uses`, both of which resolve
to `ComponentFunction`:

```tsx
const Task: Takes<iTask> = ({ text }) => <div>{text}</div>;
```

The arrow function must be assignable to `ComponentFunction`, and reading properties
such as `Task.repeat` must give a usable type. Most of what follows comes from those two
requirements.

## Strict on and off

The types must work the same way whether or not the user's tsconfig enables `strict`.
In practice that means:

- `strictNullChecks` adds `| undefined` to optional parameters and properties when they
  are read.
- `strictFunctionTypes` checks function parameters contravariantly, so a generic
  parameter in a callback type must match exactly.
- `noImplicitThis` is needed for `ThisType<T>` to have any effect.
- `strictPropertyInitialization` requires class fields to be initialised, which affects
  the examples in our docs rather than the types.

The tests compile everything in both modes (see [Testing](#testing)), and the examples
use strict.

## Decisions

### Component parameters are required

`ComponentFunction`'s call signature declares `model` and `xargs` as required. If they
were optional, destructuring them would fail with strict on:

```tsx
// Property 'text' does not exist on type 'iTask | undefined'.
const Task: Takes<iTask> = ({ text }) => <div>{text}</div>;
```

Making them required doesn't stop components from omitting them, as a function with
fewer parameters is assignable to one with more. Users never call component functions
themselves.

### `repeat`, `methods` and `stub` exist on every function

**This is the surprising one.** `types.d.ts` adds these properties to the global
`Function` interface:

```ts
interface Function {
  readonly repeat: never;
  readonly methods: never;
  readonly stub: never;
}
```

The reason: `ComponentFunction` needs `repeat`, `methods` and `stub` to be required.
With strict on, reading an optional property gives `T | undefined`, so:

- `<Task.repeat models={tasks} />` fails with "JSX element type 'Task.repeat' does not
  have any construct or call signatures".
- `Parent.stub.foo = ...` and `Bar.methods.foo = ...` fail with "possibly 'undefined'".

But an arrow function has no `repeat` property, so it isn't assignable to a type which
requires one. Unless that property is declared on `Function`: TypeScript checks the
arrow function's _apparent type_, which includes `Function`'s members (this is also why
the required `prototype` property already worked). As `never` is assignable to anything,
every arrow function then satisfies `ComponentFunction`. Reading `Task.repeat` still
gives `ComponentFunction`'s type, because `Task` is declared as one.

The consequences for users:

- Every function shows `repeat`, `methods` and `stub` in autocomplete.
- Using them on an ordinary function is an error: `fn.repeat()` fails with "Type 'never'
  has no call signatures", and `fn.stub.x` with "Property 'x' does not exist on type
  'never'". Only reading the property itself, as in `const m = fn.methods`, passes
  silently.
- If another library declares any of these names on `Function` with a different type,
  the two will clash.

Things which don't work, so you don't need to try them again:

- **`JSX.ElementType`** (TypeScript 5.1+) doesn't help. TypeScript still requires a call
  signature on the tag, which `Fn | undefined` doesn't have.
- **An index signature** such as ``[k: `repeat${string}`]: ...``. A literal key like
  `` `repeat${""}` `` isn't allowed, and an arrow function doesn't satisfy a pattern
  index signature either.

If you add another property which users read from a component function, it needs the
same treatment.

### `methods` has a getter and a setter

```ts
get methods(): ComponentInstance<Model, Hub, Methods>;
set methods(methods: ComponentMethods<Model, Hub, Methods> & ThisType<...>);
```

At runtime `methods` is a proxy for the prototype, so reading it is typed as an
instance, like `prototype`. Assigning an object literal is checked against
`ComponentMethods`, in which every method is optional.

When the right-hand side of an assignment is a function or object literal, TypeScript
contextually types it, including `this`, from the property's **read** type, not its
write type. So in both of these, `this` is the instance, and `getName` is checked against
the `Methods` interface:

```tsx
Bar.methods.getName = function () {
  return this.model.name;
};

Bar.methods = {
  render(model, hub) {
    this.getName();
  }
};
```

Getters and setters with unrelated types need TypeScript 5.1 or later.

### `Component` declares `this` on its methods

`ThisType<T>` only takes effect with `noImplicitThis`, which `strict` includes. Explicit
`this` parameters work either way, so `Component`'s `render`, `set` and `update` declare
`this: ComponentInstance<Model, Hub, Methods>`. Because the `methods` getter returns an
instance, these give `this` its type in the methods above, with strict off.

For this to work:

- `Component` takes a `Methods` type parameter, so the `this` type can include them.
- `Component` declares the instance fields (`el`, `model`, `hub`, ...), and
  `ComponentInstance` is just `Component & Methods`. Users often type an instance as
  `Component<any>`, which must satisfy the `this` parameter when they call
  `component.update()`.

### The hub parameter of `render` and `set`

```ts
type HubArg<Hub> = unknown extends Hub ? [hub?: Hub] : [hub: Hub];
render(model: Model, ...hub: HubArg<Hub>): void;
```

The runtime always passes the hub to `render`, so in an override `hub` shouldn't be
`| undefined`. But users call `instance.render(model)` to re-render with a new model,
which sets the hub to `undefined`. So the hub is optional when it is untyped (`unknown`
or `any`), and required when the component declares one.

### Functions which take any component

`mount`, `createComponent` and `extendComponent` take
`ComponentFunction<Model, Hub, Methods, any>`, with `any` for the stubs. `xargs.stub` is
part of the call signature's parameters, so with `strictFunctionTypes` a component
which declares stubs isn't assignable to one with the default `{}`. These functions don't
care about stubs, so they accept any.

### Props in JSX

`JSX.LibraryManagedAttributes` turns a component's model and hub into the props allowed
when nesting it, via `JSX.Wrapper`. The model may be omitted if it is `null` (from
`Takes<null>`). The check is written as `[Model] extends [null]` because a bare
`Model extends null` is true for every model when `strictNullChecks` is off.

### Event attributes

Elements accept any attribute through `[attr: string]: any`, so `AllDomEvents` doesn't
make anything compile that wouldn't otherwise. It exists for autocomplete: a mapped type
over `HTMLElementEventMap` adds `on:click`, `on:keyup` etc. as known keys. Custom events
such as `on:item-selected` fall through to the index signature.

TypeScript doesn't show JSDoc for the keys of a mapped type with an `as` clause, so
hovering `on:click` shows no help. That's the same as other qualified directives such
as `bind:checked`. The help is on the `on` directive in `DirectiveAttributes`, like
every other directive, and shows when hovering `on`. Listing each event
by hand (as we did for `onClick` etc.) would bring the tooltips back, at the cost of
around 1000 lines.

### `mount` without a hub

When `mount` is given no hub it uses the model as the hub, so the model must satisfy
both types. `ModelAsHub` does this, but skips the intersection when the hub is `any`, as
intersecting with `any` would turn off checking of the model.

## Testing

The type tests are in `packages/wallace/tests/typsecript` (the directory name is a
typo). There are two kinds:

- `*.spec.jsx` files use the `toHaveTypeErrors` and `toHaveNoTypeErrors` matchers from
  `tests/utils.js` on a source string.
- `*.tsx` files are compiled by `run-typescript-tests.test.js`. A file which should
  fail starts with a `//@<line> <message>` comment.

Both compile every case with strict off and on, and expect the same result. With strict
on, the matchers remove `| undefined` from messages before comparing them, as optional
properties gain it. So write expected errors as they appear with strict off.

Test code must itself be valid in both modes, so give class fields initialisers (or `!`)
and type parameters which TypeScript can't infer.

The examples use strict, so `npm run test:examples` from the root also checks the types
in strict mode against real apps.

To experiment, create a tsconfig in a scratch directory which points `wallace` at a copy
of the types, and compile with `tsc -p .`, toggling `strict`:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "noEmit": true,
    "strict": true,
    "types": [],
    "baseUrl": ".",
    "paths": { "wallace": ["./types.d.ts"] }
  },
  "files": ["test.tsx"]
}
```

## Checklist

When you change the types:

1. Add or update tests in `tests/typsecript`, including one which expects an error, so
   that a type which accidentally allows everything gets caught.
2. Run `npx jest tests/typsecript` from `packages/wallace`.
3. Run `npm run test:examples` from the root.
4. Update the examples in the JSDoc and in `packages/wallace/AGENTS.md` if the way users
   write code changes.
5. Update this document.

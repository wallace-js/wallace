# Events

## Syntax

Event handlers use the `on` directive with the event name as the qualifier:

```tsx
<button on:click={hub.save()}>Save</button>
```

The qualifier is passed to `addEventListener` exactly as written, so any event works,
including custom events (`on:item-selected`), and the case is kept. There is no list of
known events in the plugin.

The expression is copied into the listener, so it must be a call (or assignment etc.),
not a function or an uncalled reference. `ensureHandlerIsCall` in `directives.ts` makes
those a compile error, as they would silently do nothing.

`bind-on` sets which event a `bind` listens to (the default is `change`):

```tsx
<input bind={model.name} bind-on:keyup />
```

## Why not `onClick`

We used to use `onClick={...}`, like React. We moved to `on:click` because:

- It matches the other directives (`style:color`, `toggle:done`, `bind:checked`), and
  looks less like React, where handlers take a function.
- It needed a hard coded list of events, so custom events and newer events didn't
  work. Lowercasing the name also meant hyphenated or camelCase custom events never
  could.
- The types listed every event by hand.

## Deprecated syntax

These still work, but the plugin prints a warning (see `warn` in `errors.ts`):

- `onClick={expression}`: handled by `DeprecatedOnEventDirective`, which
  `visitors/attribute.ts` picks for any unqualified attribute matching `/^on[a-z]/i`
  with an expression value. The name is lowercased, as before.
- `event:keyup`: the old name for `bind-on`.

String values (`onclick="..."`) are normal attributes, as they always were.

When we remove `onClick={expression}`, it must become a compile error rather than a
normal attribute. Otherwise `onClick={hub.save()}` would compile and call `hub.save()`
on every render, which is the worst outcome for someone writing it out of habit.

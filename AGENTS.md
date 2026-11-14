# Working on the Wallace repo

`packages/wallace/AGENTS.md` is for people _using_ Wallace (it ships with the npm package).
This file is for working on the framework itself.

## Layout

- `packages/wallace/lib/` — the runtime. Plain JS, shipped as is. Types are in `lib/types.d.ts`.
- `packages/babel-plugin-wallace/src/` — the compiler (TypeScript). It replaces whole component
  functions, and generates the stash, watches, detachers and repeaters that the runtime uses.
- `examples/`, `canary/` — sample apps.

## Flags and conditional code

- Runtime code is trimmed at compile time based on the user's flags:
  - `/* #INCLUDE-IF: flagName */` drops the next statement or property when the flag is off
    (see `babel-plugin-wallace/src/visitors/library.ts`).
  - `if (wallaceConfig.flags.flagName)` branches are evaluated at compile time too.
- So every change must work with each flag on _and_ off. A bug may only show up with one
  flag, e.g. `allowDismount`.
- Some flags cause _compile_ errors when they're off (e.g. a repeat with sibling elements
  when `allowRepeaterSiblings` is off). Put such test components inside an
  `if (wallaceConfig.flags.x) { ... }` block. Every spec file needs at least one test in
  each configuration, so add an `else` branch with a dummy test.

## Running tests

Run these from `packages/wallace`:

- `npx jest tests/functionality/<file>` runs one file. A full run takes about 90s.
  `npm test` also clears Jest's cache.
- Flag configurations come from environment variables (see `flags.cjs`). With none set,
  every flag is on.

  ```sh
  ALL_FLAGS_OFF=1 npx jest
  ONE_FLAG_ON=allowDismount npx jest
  ONE_FLAG_OFF=allowRepeaterSiblings npx jest
  ```

  Before calling a runtime change done, run at least the default, `ALL_FLAGS_OFF`, and
  `ONE_FLAG_OFF` for each flag your change touches.

- `afterEach` in `tests/utils.js` **dismounts every component mounted so far**. Call
  `testMount` inside the `test`, not in the `describe` body. Otherwise the component gets
  dismounted before its own test runs.
- Jest may show output or stack traces from an earlier test. Use `test.only` to isolate one.

## Formatting

- After changing any files, including Markdown such as `AGENTS.md`, run `npm run prettier`
  from the repo root. CI runs `npm run prettier:check` and fails on unformatted files, but
  nothing runs it locally, so it is easy to forget.
- Then run `npm run prettier:check`. If it reports "Unable to read file", add that path to
  `.prettierignore` rather than ignoring the error, as the output can hide real warnings.

## Runtime internals

- Property names are kept short to reduce bundle size. In the repeaters:
  `d` = component definition, `s` = shared pool, `p` = own pool, `c` = child count
  (sequential), `k` = previous keys (keyed), `a` = offset tracker, `i` = initial index.
  On components: `_s` = stash, `_d` = keys of stash items to dismount,
  `_c` / `Definition.pool` = shared pool.
- **Shared pools:** each component definition has one pool, shared by every repeater and
  nester that uses it. Recursive components (trees) use the same pool at every level. So a
  component released by one repeater can be reused by another, and its element moved
  elsewhere in the DOM. After `dismount()`, a repeater or nester must be safe to reuse, with
  no stale counts, keys or DOM children.
- **Offset tracker:** a `Map` from each conditional, nested or repeated child's
  `initialIndex` to how far it shifts later siblings. Elements use 0 (attached) or
  -1 (detached), nesters start at -1, and repeaters use `itemsLength - 1` (no entry until
  their first patch). See the comment in `lib/detacher.js`.
- **Keyed repeater:** it works backwards through the items. A trailing run of new items is
  collected in a fragment and appended. Removed items end up at the front, then get removed
  from `childNodes[adjustment]`.
- `lib/` code runs on every render. Keep hot paths free of allocations and avoid
  unnecessary DOM moves.

## Debugging tips

- Repeater and dismount bugs often only show up with nested repeaters of the same component
  whose items are added and removed over several updates (e.g. filtering a tree).
  `tests/functionality/19.dismount.tree.spec.jsx` is a template for this.

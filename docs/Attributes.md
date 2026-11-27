# Attributes

How the compiler handles plain attributes, i.e. ones which aren't directives (see
`babel-plugin-wallace/src/visitors/attribute.ts`).

## Static and dynamic values

- A **static** value (`for="x"`, or `readonly` with no value) is set with `setAttribute`
  on a JSDOM element (`TagNode.getElement` in `models/node.ts`), whose HTML becomes the
  component's template.
- A **dynamic** value (`for={x}`) becomes a watch callback which sets the DOM property:
  `element.htmlFor = n` (`setAttributeCallback` in `utils.ts`). Names which aren't valid
  identifiers, like `aria-label` or `data-id`, use `setAttribute` instead.

## Attribute and property names

Some attributes have a DOM property with a different name: `for`/`htmlFor`,
`class`/`className`, `readonly`/`readOnly`, `tabindex`/`tabIndex` etc. Users may write
either, so both paths have to translate:

- `setAttributeCallback` uses `toPropertyName` (`for` → `htmlFor`). Without it,
  `for={x}` would set `element.for`, which does nothing.
- `getElement` uses `toAttributeName` (`htmlFor` → `for`). Without it, `htmlFor="x"`
  would produce an `htmlfor` attribute, which does nothing. `setAttribute` lowercases
  names in HTML documents, so this is only needed where the names differ by more than
  case (`htmlFor`, `className`), but the same table is used for all of them.

Both use `ATTRIBUTE_TO_PROPERTY` in `utils.ts`. These bugs are silent (no error, the
label just isn't linked), so add any other such attribute to that table, and a test to
`tests/functionality/22.attribute-names.spec.jsx`.

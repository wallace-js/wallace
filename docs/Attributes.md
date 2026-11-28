# Attributes

How the compiler handles plain attributes, i.e. ones which aren't directives (see
`babel-plugin-wallace/src/visitors/attribute.ts`).

## Static and dynamic values

- A **static** value (`for="x"`, or `readonly` with no value) is set with `setAttribute`
  on a JSDOM element (`TagNode.getElement` in `models/node.ts`), whose HTML becomes the
  component's template.
- A **dynamic** value (`for={x}`) becomes a watch callback which calls `setAttr` from
  `lib/utils.js`: `setAttr(element, 'for', n, 'htmlFor')` (`setAttributeCallback` in
  `utils.ts`). That sets the DOM property, `element.htmlFor = n`. Names which aren't
  valid identifiers, like `aria-label` or `data-id`, get no property name, so `setAttr`
  uses `setAttribute` instead.

## Null and undefined

If a dynamic value is `null` or `undefined`, `setAttr` removes the attribute. It also sets
the property to `""` first, because removing the attribute doesn't reset a property
such as `value` or `checked` once it has changed.

Otherwise the value would be converted by the property's setter: `maxLength = undefined`
becomes `0` (so the input accepts no typing), and `min = undefined` sets
`min="undefined"`. These are easy to hit with optional settings. Other falsy values
(`0`, `""`, `false`) are still set as they are.

It's a function rather than inline code to keep the bundle small, as there's a call for
every dynamic attribute. The watch only calls it when the value changes.

## Attribute and property names

Some attributes have a DOM property with a different name: `for`/`htmlFor`,
`class`/`className`, `readonly`/`readOnly`, `tabindex`/`tabIndex` etc. These are listed
in `ATTRIBUTE_TO_PROPERTY` in `utils.ts`.

Users must write the HTML name. `setAttributeCallback` maps it to the property name for
dynamic values (`for` → `htmlFor`).

Any other spelling (`htmlFor`, `className`, `readOnly`, `Tabindex`) is a compile error
(see `getHtmlAttributeName`). We don't accept the DOM names as aliases, so that there is
only one way to write each attribute, as with `class` (not `className`) and the `style`
directive. Before this, each spelling silently did nothing in one of the two cases:
`htmlFor="x"` produced an `htmlfor` attribute, and `for={x}` set `element.for`.

To support another such attribute, add it to `ATTRIBUTE_TO_PROPERTY` and add tests to
`tests/functionality/22.attribute-names.spec.jsx`.

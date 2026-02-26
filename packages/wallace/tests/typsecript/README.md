# TypeScript tests

These tests run in CI will all flags enabled, unlike the tests in **functionality** which run with each flag enabled/disabled.

There are two mechanisms for testing TypeScript:

### Using matchers

Using the `toHaveTypeErrors` and `toHaveNoTypeErrors` on a source code string:

```js
test('can specify props', () => {
  expect(`
    import { mount, Uses } from "wallace";

    interface FooProps {
      clicks: number;
    }

    const Foo: Uses<FooProps> = () => (<div></div>);
    const foo = mount("main", Foo);
    foo.props.clicks = 1;
    foo.props.clicks = 'a';
  `).toHaveTypeErrors([
    "Type 'string' is not assignable to type 'number'."
  ]);
});
```

It is best to test that some error occurs, perhaps after several lines which should throw no errors, in order to avoid false positives.

### Using the test runner

This pics up files with .`tsx` extensions in this directory and runs them. It is needed for certain cases such as:

```tsx
const MyComponent: Uses<null> = () => (
  <div>
    <p>Whatever</p>
  </div>
);

const c = 6;
mount('str', MyComponent);
mount(document.getElementById('a'), MyComponent);

mount(c, MyComponent);
```

Where `document` would not be recognised when running it using the matchers. There probably is a way round that, but this mechanism was built before the matchers we, so we're keeping it. It may also be useful for other cases.

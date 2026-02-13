# Wallace

This package contains the library for the [Wallace](https://wallace.js.org) framework, which you import into your source files:

```jsx
import { mount } from 'wallace';

const MyComponent = () => <div>Hello world</div>;

mount('main', Component);
```

It requires the [babel-plugin-wallace](https://www.npmjs.com/package/babel-plugin-wallace) to work, which is a dependency of this package, always at the same version.

Although you can install these packages with:

```
npm i wallace -D
```

You are better off creating an empty project with:

```
npx create-wallace-app
```

As that sets up your babel and webpack configurations for you.

For more detailed documentation see the [Wallace repository on github](https://wallace.js.org/docs/).

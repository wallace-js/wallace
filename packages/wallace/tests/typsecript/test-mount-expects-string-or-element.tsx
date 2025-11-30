//@14 error TS2345: Argument of type 'number' is not assignable to parameter of type 'string | HTMLElement'.
import { mount, Uses } from "wallace";

const MyComponent: Uses<null> = () => (
  <div>
    <p>Whatever</p>
  </div>
);

const c = 6;
mount("str", MyComponent);
mount(document.getElementById("a"), MyComponent);

mount(c, MyComponent);

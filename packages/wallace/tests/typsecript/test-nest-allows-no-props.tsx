import { mount, Uses } from "wallace";

const ClickCounter: Uses<null> = () => (
  <div>
    <a>Whatever</a>
  </div>
);

const CounterList = () => (
  <div>
    <ClickCounter />
  </div>
);

mount("main", CounterList);

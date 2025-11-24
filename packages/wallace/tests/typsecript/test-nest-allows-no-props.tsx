import { mount, Accepts } from "wallace";

const ClickCounter: Accepts<null> = () => (
  <div>
    <a>Whatever</a>
  </div>
);

const CounterList = () => (
  <div>
    <ClickCounter.nest />
  </div>
);

mount("main", CounterList);

//@16 error TS2322: Type 'number' is not assignable to type 'Props'.
import { mount, Uses } from "wallace";

interface Props {
  clicks: number;
}

const ClickCounter: Uses<Props> = (counter: Props) => (
  <div>
    <a>Clicked {counter.clicks} times</a>
  </div>
);

const CounterList = () => (
  <div>
    <ClickCounter.repeat items={[1, 2]} />
  </div>
);

mount("main", CounterList);

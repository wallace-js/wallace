//@16 error TS2322: Type '{}' is not assignable to type 'IntrinsicAttributes & { props: Props[]; show?: boolean; hide?: boolean; }'.
import { mount, Accepts } from "wallace";

interface Props {
  clicks: number;
}

const ClickCounter: Accepts<Props> = (counter: Props) => (
  <div>
    <a>Clicked {counter.clicks} times</a>
  </div>
);

const CounterList = () => (
  <div>
    <ClickCounter.repeat />
  </div>
);

mount("main", CounterList);

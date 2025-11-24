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
    <ClickCounter.nest props={{ clicks: 8 }} />
  </div>
);

mount("main", CounterList);

import { mount, Uses } from "wallace";

interface Props {
  clicks: number;
}

const counters: Array<Props> = [{ clicks: 0 }];

const ClickCounter: Uses<Props> = (counter: Props) => (
  <div>
    <a>Clicked {counter.clicks} times</a>
  </div>
);

const CounterList = () => (
  <div>
    <ClickCounter.repeat items={counters} />
  </div>
);

mount("main", CounterList);

import { mount, Accepts } from "wallace";

interface Props {
  clicks: number;
}

const counters: Array<Props> = [{ clicks: 0 }];

const ClickCounter: Accepts<Props> = (counter: Props) => (
  <div>
    <a>Clicked {counter.clicks} times</a>
  </div>
);

const CounterList = () => (
  <div>
    <ClickCounter.repeat props={counters} />
  </div>
);

mount("main", CounterList);

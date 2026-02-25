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
    <ClickCounter props={{ clicks: 8 }} />
  </div>
);

mount("main", CounterList);

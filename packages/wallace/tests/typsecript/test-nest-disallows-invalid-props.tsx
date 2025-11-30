//@19 error TS2741: Property 'clicks' is missing in type '{ foo: number; }' but required in type 'Props'.

import { mount, Uses } from "wallace";

interface Props {
  clicks: number;
}

const ClickCounter: Uses<Props> = (counter: Props) => (
  <div>
    <a>Clicked {counter.clicks} times</a>
  </div>
);

const badProps = { foo: 8 };

const CounterList = () => (
  <div>
    <ClickCounter.nest props={badProps} />
  </div>
);

mount("main", CounterList);

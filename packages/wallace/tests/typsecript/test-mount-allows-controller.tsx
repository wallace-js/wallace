import { mount, Uses } from "wallace";

interface Props {
  clicks: number;
}

const FunctionWithoutProps: Uses<null> = () => (
  <div>
    <p>Whatever</p>
  </div>
);

const FunctionWithProps: Uses<Props> = ({ clicks }) => (
  <div>
    <p>Clicked {1 + clicks} times</p>
  </div>
);

mount("a", FunctionWithoutProps, null, {});
mount("b", FunctionWithProps, undefined, 8);

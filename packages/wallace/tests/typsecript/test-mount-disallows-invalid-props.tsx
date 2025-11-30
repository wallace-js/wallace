//@16 error TS2345: Argument of type '{ name: string; }' is not assignable to parameter of type 'Props'.
import { mount, Uses } from "wallace";

interface Props {
  clicks: number;
}

const FunctionWithProps: Uses<Props> = ({ clicks }) => (
  <div>
    <p>Clicked {1 + clicks} times</p>
  </div>
);

const props = { name: "Pelican" };

mount("b", FunctionWithProps, props);

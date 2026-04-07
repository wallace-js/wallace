//@16 error TS2345: Argument of type '{ name: string; }' is not assignable to parameter of type 'Model'.
import { mount, Uses } from "wallace";

interface Model {
  clicks: number;
}

const FunctionWithModel: Uses<Model> = ({ clicks }) => (
  <div>
    <p>Clicked {1 + clicks} times</p>
  </div>
);

const model = { name: "Pelican" };

mount("b", FunctionWithModel, model);

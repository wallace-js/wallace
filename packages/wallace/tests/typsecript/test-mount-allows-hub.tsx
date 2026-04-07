import { mount, Uses } from "wallace";

interface Model {
  clicks: number;
}

const FunctionWithoutModel: Uses<null> = () => (
  <div>
    <p>Whatever</p>
  </div>
);

const FunctionWithModel: Uses<Model> = ({ clicks }) => (
  <div>
    <p>Clicked {1 + clicks} times</p>
  </div>
);

mount("a", FunctionWithoutModel, null, {});
mount("b", FunctionWithModel, undefined, 8);

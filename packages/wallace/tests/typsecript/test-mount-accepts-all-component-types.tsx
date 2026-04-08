import { mount, Takes } from "wallace";

interface Model {
  clicks: number;
}

const FunctionWithoutModel: Takes<null> = () => (
  <div>
    <p>Whatever</p>
  </div>
);

const FunctionWithModel: Takes<Model> = ({ clicks }) => (
  <div>
    <p>Clicked {1 + clicks} times</p>
  </div>
);

mount("a", FunctionWithoutModel);
mount("b", FunctionWithModel);

import { mount } from "wallace";
import { TaskList } from "./components";

mount("main", TaskList, [
  { text: "Complete Wallace tutorial", done: true },
  { text: "Star Wallace on github", done: false }
]);

import { mount } from "wallace";
import { TaskList } from "./components";
import { Hub } from "./hubs";

const hub = new Hub([
  { text: "Complete Wallace tutorial", done: true },
  { text: "Star Wallace on github", done: false }
]);

mount("main", TaskList, hub);

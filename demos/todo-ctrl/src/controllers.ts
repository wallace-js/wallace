import { watch, Component } from "wallace";
import { iTask } from "./types";
import { fetchTasks } from "./store";

/**
 * Base class for controllers that load with asynchronous calls.
 * Components should inspect the `loading` property
 */
class AsyncLoadController {
  root: Component<any>;
  ready: boolean;
  constructor(root: Component<any>) {
    this.root = root;
    this.ready = false;
  }
  async init() {
    await this._load();
    this.ready = true;
    this.root.update();
  }
  async _load() {
    throw new Error("Not implemented");
  }
}

export class TaskListController extends AsyncLoadController {
  tasks: iTask[];
  constructor(root: Component<any>) {
    super(root);
    this.tasks = [];
  }
  async _load() {
    await fetchTasks().then((tasks) => {
      this.tasks = watch(tasks, () => this.root.update());
    });
  }
  completedTasks() {
    return this.tasks.filter((t) => t.done);
  }
  addTask(text: string) {
    this.tasks.push({ text, done: false });
  }
}

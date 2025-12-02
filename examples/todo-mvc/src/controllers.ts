import { watch, Component } from "wallace";
import { iTask } from "./types";
import { fetchTasks, addTask, toggleTask } from "./store";

/**
 * Base class for controllers that load with asynchronous calls.
 * Components can inspect the `loading` and `saving` properties.
 */
class AsyncLoadController {
  root: Component<any>;
  loading: boolean;
  saving: boolean;
  constructor(root: Component<any>) {
    this.root = root;
    this.loading = true;
    this.saving = false;
  }
  async init() {
    await this._load();
    this.loading = false;
    this.root.update();
  }
  async _save(callback: CallableFunction) {
    this.saving = true;
    this.root.update();
    await callback();
    this.saving = false;
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
    await fetchTasks().then(tasks => {
      this.tasks = tasks;
    });
  }
  completedTasksCount() {
    return this.tasks.filter(t => t.done).length;
  }
  async addTask(text: string) {
    await this._save(async () => {
      await addTask(text).then(newTask => {
        this.tasks.push(newTask);
      });
    });
  }
  async toggleTask({ id, done }) {
    await this._save(async () => {
      await toggleTask({ id, done }).then(changedTask => {
        const localCopy = this.tasks.find(t => t.id === changedTask.id);
        localCopy.done = changedTask.done;
      });
    });
  }
}

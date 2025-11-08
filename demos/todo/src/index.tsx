import { mount, watch, Accepts, Component } from "wallace";

interface iTask {
  text: string;
  done: boolean;
}

class Controller {
  root: Component<any>;
  loading: boolean;
  constructor(root: Component<any>) {
    this.root = root;
    this.loading = true;
  }
  async init() {
    await this.load();
    this.loading = false;
    this.root.update();
  }
  load() {
    console.log("Dummy timeout.");
    return new Promise((r) => setTimeout(r, 1500));
  }
}

class TaskListController extends Controller {
  tasks: iTask[];
  async load() {
    await new Promise((r) => setTimeout(r, 500));
    const tasks = [
      { text: "Complete tutorial", done: false },
      { text: "Star on github", done: false },
    ];
    this.tasks = watch(tasks, this.root);
  }
  completed() {
    return this.tasks ? this.tasks.filter((t) => t.done).length : 0;
  }
  addTask(_event: any) {
    if (_event.key === "Enter") {
      this.tasks.push({ text: _event.target.textContent, done: false });
      _event.target.value = "";
    }
  }
}

const Task: Accepts<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TaskList: Accepts<TaskListController> = (ctrl, _event) => (
  <div hide={ctrl.loading}>
    <span>Done: {ctrl.completed()}</span>
    <div>
      <Task.repeat props={ctrl.tasks} />
    </div>
    <input type="text" onKeyUp={ctrl.addTask(_event)} />
  </div>
);

TaskList.prototype.render = function () {
  this.props = new TaskListController(this);
  console.log(this.props.loading);
  this.update();
  this.props.init();
};

mount("main", TaskList);

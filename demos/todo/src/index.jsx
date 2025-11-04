import { mount, watch } from "wallace";

class Controller {
  constructor(root) {
    this.root = root;
    this.loading = true;
  }
  init() {
    return this.load().then(() => {
      this.loading = false;
      this.root.update();
    });
  }
  load() {
    console.log("Dummy timeout.");
    return new Promise((r) => setTimeout(r, 1500));
  }
}

class TaskListController extends Controller {
  load() {
    return new Promise((r) => setTimeout(r, 1500)).then(() => {
      const tasks = [
        { text: "Complete tutorial", done: false },
        { text: "Star on github", done: false },
      ];
      this.tasks = watch(tasks, this.root);
      console.log("Loaded");
    });
  }
  completed() {
    return this.tasks.filter((t) => t.done).length;
  }
}

const Task = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TaskList = (ctrl) => (
  <div reactive hide={ctrl.loading}>
    <span>Done: {ctrl.completed()}</span>
    <div>
      <Task.repeat props={ctrl.tasks || []} />
    </div>
  </div>
);

TaskList.prototype.render = function () {
  this.props = new TaskListController(this);
  this.update();
  this.props.init();
};

mount("main", TaskList, [
  { text: "Complete tutorial", done: false },
  { text: "Star on github", done: false },
]);

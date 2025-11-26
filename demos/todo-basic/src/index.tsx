import { mount, Uses, watch } from "wallace";

interface iTask {
  text: string;
  done: boolean;
}

const Task: Uses<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TaskList: Uses<iTask[]> = (tasks, { e }) => (
  <div class="tasklist">
    <span>Completed: {tasks.filter((t) => t.done).length}</span>
    <div style="margin-top: 10px">
      <Task.repeat props={tasks} />
    </div>
    <div style="margin-top: 10px">
      <input type="text" onKeyUp={onKeyUp(tasks, e)} />
      <span> (hit enter to add)</span>
    </div>
  </div>
);

TaskList.prototype.render = function (tasks) {
  this.props = watch(tasks, () => this.update());
  this.update();
};

const onKeyUp = (tasks: iTask[], e: any) => {
  if (e.key === "Enter") {
    tasks.push({ text: e.target.value, done: false });
    e.target.value = "";
  }
};

mount("main", TaskList, [
  { text: "Complete Wallace tutorial", done: false },
  { text: "Star Wallace on github", done: false },
]);

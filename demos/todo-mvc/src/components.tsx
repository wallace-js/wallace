import { Uses } from "wallace";
import { iTask } from "./types";
import { TaskListController } from "./controllers";

const Task: Uses<iTask, TaskListController> = (
  { text, done, id },
  { ctrl }
) => (
  <div>
    <input
      type="checkbox"
      checked={done}
      onChange={ctrl.toggleTask({ id, done: !done })}
    />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

export const TaskList: Uses<any, TaskListController> = (
  _,
  { ctrl, self, e }
) => (
  <div class="tasklist">
    <div if={!ctrl.loading}>
      <span>Completed: {ctrl.completedTasksCount()}</span>
      <div style="margin-top: 10px">
        <Task.repeat props={ctrl.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={self.txtInputKeyUp(e)} />
        <span> (hit enter to add)</span>
      </div>
    </div>

    <div if={ctrl.loading || ctrl.saving} class="loader"></div>
  </div>
);

TaskList.prototype.render = function () {
  this.ctrl = new TaskListController(this);
  this.update(); // Ensures spinner displays while loading.
  this.ctrl.init();
};

TaskList.prototype.txtInputKeyUp = function (e: any) {
  if (e.key === "Enter") {
    this.ctrl.addTask(e.target.value);
    e.target.value = "";
  }
};

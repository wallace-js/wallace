import { Uses } from "wallace";
import { iTask } from "./types";
import { TaskListController } from "./controllers";

const Task: Uses<iTask, TaskListController> = ({ text, done, id }, { ctrl }) => (
  <div>
    <input
      type="checkbox"
      checked={done}
      onChange={ctrl.toggleTask({ id, done: !done })}
    />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

export const TaskList: Uses<null, TaskListController, TaskListMethods> = (
  _,
  { ctrl, self, event }
) => (
  <div class="tasklist">
    <div if={!ctrl.loading}>
      <span>Completed: {ctrl.completedTasksCount()}</span>
      <div style="margin-top: 10px">
        <Task.repeat items={ctrl.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={self.txtInputKeyUp(event)} />
        <span> (hit enter to add)</span>
      </div>
    </div>

    <div if={ctrl.loading || ctrl.saving} class="loader"></div>
  </div>
);

interface TaskListMethods {
  txtInputKeyUp(event: any): void;
}

TaskList.methods({
  render() {
    this.ctrl = new TaskListController(this);
    this.update(); // Ensures spinner displays while loading.
    this.ctrl.init();
  },
  txtInputKeyUp(event: any) {
    if (event.key === "Enter") {
      this.ctrl.addTask(event.target.value);
      event.target.value = "";
    }
  }
});

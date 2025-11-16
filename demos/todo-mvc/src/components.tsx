import { Accepts } from "wallace";
import { iTask } from "./types";
import { TaskListController } from "./controllers";

const Task: Accepts<iTask> = (
  { text, done, id },
  ctrl: TaskListController,
  _element,
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

export const TaskList: Accepts<null> = (
  _,
  ctrl: TaskListController,
  _event,
  _component,
) => (
  <div class="tasklist">
    <div if={!ctrl.loading}>
      <span>Completed: {ctrl.completedTasksCount()}</span>
      <div style="margin-top: 10px">
        <Task.repeat props={ctrl.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={_component.txtInputKeyUp(_event)} />
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

TaskList.prototype.txtInputKeyUp = function (_event: any) {
  if (_event.key === "Enter") {
    this.ctrl.addTask(_event.target.value);
    _event.target.value = "";
  }
};

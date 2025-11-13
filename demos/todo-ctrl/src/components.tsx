import { Accepts } from "wallace";
import { iTask } from "./types";
import { TaskListController } from "./controllers";

const Task: Accepts<iTask> = ({ ctrl, text, done, id }, _element) => (
  <div>
    <input
      type="checkbox"
      checked={done}
      onChange={checkboxChanged(ctrl, id, _element)}
    />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

export const TaskList: Accepts<TaskListController> = (ctrl, _event) => (
  <div class="tasklist">
    <div if={ctrl.loading} class="loader"></div>
    <div if={!ctrl.loading}>
      <span>Completed: {ctrl.completedTasksCount()}</span>
      <div style="margin-top: 10px">
        <Task.repeat props={ctrl.allTasks()} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={onKeyUp(ctrl, _event)} />
        <span> {ctrl.saving ? "saving..." : "(hit enter to add)"}</span>
      </div>
    </div>
  </div>
);

const checkboxChanged = (
  ctrl: TaskListController,
  id: number,
  _element: any,
) => {
  console.log("checkboxChanged", id, _element.checked);
  ctrl.toggleTask({ id, done: _element.checked });
};

const onKeyUp = (ctrl: TaskListController, _event: any) => {
  if (_event.key === "Enter") {
    ctrl.addTask(_event.target.value);
    _event.target.value = "";
  }
};

TaskList.prototype.render = function () {
  this.props = new TaskListController(this);
  this.update(); // Ensures loader displays while loading.
  this.props.init();
};

import { Accepts } from "wallace";
import { iTask } from "./types";
import { TaskListController } from "./controllers";

const Task: Accepts<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

export const TaskList: Accepts<TaskListController> = (ctrl, _event) => (
  <div class="tasklist">
    <div if={!ctrl.ready} class="loader"></div>
    <div if={ctrl.ready}>
      <span>Completed: {ctrl.completedTasks().length}</span>
      <div style="margin-top: 10px">
        <Task.repeat props={ctrl.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={onKeyUp(ctrl, _event)} />
        <span> (hit enter to add)</span>
      </div>
    </div>
  </div>
);

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

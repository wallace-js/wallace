import { Uses } from "wallace";
import { iTask, TaskListMethods } from "./types";
import { Controller } from "./controller";

const Task: Uses<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const UndoRedoBtns: Uses<null, Controller> = (_, { ctrl }) => (
  <div>
    <button disabled={ctrl.previousStates.length <= 1} onClick={ctrl.undo()}>
      Undo
    </button>
    <button disabled={ctrl.undoneStates.length === 0} onClick={ctrl.redo()}>
      Redo
    </button>
  </div>
);

export const TaskList: Uses<iTask[], Controller, TaskListMethods> = (
  _,
  { event, ctrl, self }
) => (
  <div class="tasklist">
    <UndoRedoBtns.nest />
    <div style="margin-top: 10px">
      <span>Completed: {ctrl.tasks.filter(t => t.done).length}</span>
      <div style="margin-top: 10px">
        <Task.repeat props={ctrl.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={self.addTaskKeyup(event as KeyboardEvent)} />
        <span> (hit enter to add)</span>
      </div>
    </div>
  </div>
);

TaskList.methods({
  render(props) {
    this.ctrl = new Controller(this, props);
    this.ctrl.stateMoved();
  },
  addTaskKeyup(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const text = target.value;
    if (event.key === "Enter" && text.length > 0) {
      this.ctrl.tasks.push({ text, done: false });
      target.value = "";
    }
  }
});

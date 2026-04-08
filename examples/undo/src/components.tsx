import { Takes } from "wallace";
import { iTask, TaskListMethods } from "./types";
import { Hub } from "./hubs";

const Task: Takes<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const UndoRedoBtns: Takes<null, Hub> = (_, { hub }) => (
  <div>
    <button disabled={hub.previousStates.length <= 1} onClick={hub.undo()}>
      Undo
    </button>
    <button disabled={hub.undoneStates.length === 0} onClick={hub.redo()}>
      Redo
    </button>
  </div>
);

export const TaskList: Takes<iTask[], Hub, TaskListMethods> = (
  _,
  { event, hub, self }
) => (
  <div class="tasklist">
    <UndoRedoBtns />
    <div style="margin-top: 10px">
      <span>Completed: {hub.tasks.filter(t => t.done).length}</span>
      <div style="margin-top: 10px">
        <Task.repeat model={hub.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={self.addTaskKeyup(event as KeyboardEvent)} />
        <span> (hit enter to add)</span>
      </div>
    </div>
  </div>
);

TaskList.methods = {
  render(model) {
    this.hub = new Hub(this, model);
    this.hub.stateMoved();
  },
  addTaskKeyup(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const text = target.value;
    if (event.key === "Enter" && text.length > 0) {
      this.hub.tasks.push({ text, done: false });
      target.value = "";
    }
  }
};

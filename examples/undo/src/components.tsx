import type { Takes, Uses } from "wallace";
import { iTask } from "./types";
import { Hub } from "./hub";

const Task: Takes<iTask> = ({ text, done }) => (
  <div>
    <input bind-as:checkbox={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const UndoRedoBtns: Uses<{ hub: Hub }> = (_, { hub }) => (
  <div>
    <button disabled={hub.previousStates.length <= 1} onClick={hub.undo()}>
      Undo
    </button>
    <button disabled={hub.undoneStates.length === 0} onClick={hub.redo()}>
      Redo
    </button>
  </div>
);

export const TaskList: Takes<Hub> = (hub, { event }) => (
  <div assign:root class="tasklist">
    <UndoRedoBtns />
    <div style="margin-top: 10px">
      <span>Completed: {hub.tasks.filter(t => t.done).length}</span>
      <div style="margin-top: 10px">
        <Task.repeat models={hub.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={hub.addTaskKeyup(event as KeyboardEvent)} />
        <span> (hit enter to add)</span>
      </div>
    </div>
  </div>
);

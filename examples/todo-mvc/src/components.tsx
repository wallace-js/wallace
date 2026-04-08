import { Takes } from "wallace";
import { iTask } from "./types";
import { TaskListHub } from "./hubs";

const Task: Takes<iTask, TaskListHub> = ({ text, done, id }, { hub }) => (
  <div>
    <input
      type="checkbox"
      checked={done}
      onChange={hub.toggleTask({ id, done: !done })}
    />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

export const TaskList: Takes<null, TaskListHub, TaskListMethods> = (
  _,
  { hub, self, event }
) => (
  <div class="tasklist">
    <div if={!hub.loading}>
      <span>Completed: {hub.completedTasksCount()}</span>
      <div style="margin-top: 10px">
        <Task.repeat model={hub.tasks} />
      </div>
      <div style="margin-top: 10px">
        <input type="text" onKeyUp={self.txtInputKeyUp(event)} />
        <span> (hit enter to add)</span>
      </div>
    </div>

    <div if={hub.loading || hub.saving} class="loader"></div>
  </div>
);

interface TaskListMethods {
  txtInputKeyUp(event: any): void;
}

TaskList.methods = {
  render() {
    this.hub = new TaskListHub(this);
    this.update(); // Ensures spinner displays while loading.
    this.hub.init();
  },
  txtInputKeyUp(event: any) {
    if (event.key === "Enter") {
      this.hub.addTask(event.target.value);
      event.target.value = "";
    }
  }
};

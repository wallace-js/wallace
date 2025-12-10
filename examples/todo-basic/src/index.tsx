import { mount, Uses, watch } from "wallace";

interface iTask {
  text: string;
  done: boolean;
}

interface TaskListMethods {
  addTaskKeyup(event: KeyboardEvent): void;
}

const Task: Uses<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TaskList: Uses<iTask[], null, TaskListMethods> = (tasks, { event, self }) => (
  <div class="tasklist">
    <span>Completed: {tasks.filter(t => t.done).length}</span>
    <div style="margin-top: 10px">
      <Task.repeat items={tasks} />
    </div>
    <div style="margin-top: 10px">
      <input type="text" onKeyUp={self.addTaskKeyup(event as KeyboardEvent)} />
      <span> (hit enter to add)</span>
    </div>
  </div>
);

TaskList.methods({
  render(tasks) {
    this.props = watch(tasks, () => this.update());
    this.update();
  },
  addTaskKeyup(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const text = target.value;
    if (event.key === "Enter" && text.length > 0) {
      this.props.push({ text, done: false });
      target.value = "";
    }
  }
});

mount("main", TaskList, [
  { text: "Complete Wallace tutorial", done: false },
  { text: "Star Wallace on github", done: false }
]);

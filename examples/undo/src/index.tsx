import { mount, Uses, watch } from "wallace";

interface iTask {
  text: string;
  done: boolean;
}

interface iTaskListComponent {
  previousStates: string[];
  undoneStates: string[];
  undo(): void;
  redo(): void;
  addTaskKeyup(event: KeyboardEvent): void;
}

const Task: Uses<iTask> = ({ text, done }) => (
  <div>
    <input type="checkbox" bind={done} />
    <label style:color={done ? "grey" : "black"}>{text}</label>
  </div>
);

const TaskList: Uses<iTask[], null, iTaskListComponent> = (tasks, { event, self }) => (
  <div class="tasklist">
    <button disabled={self.previousStates.length <= 1} onClick={self.undo()}>
      Undo
    </button>
    <button disabled={self.undoneStates.length === 0} onClick={self.redo()}>
      Redo
    </button>
    <div style="margin-top: 10px">
      <span>Completed: {tasks.filter(t => t.done).length}</span>
      <div style="margin-top: 10px">
        <Task.repeat props={tasks} />
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
    // An array containing all the previous states. Latest is current.
    this.previousStates = [JSON.stringify(props)];
    this.undoneStates = [];
    this.stateMoved();
  },
  stateMoved() {
    const currentState = this.previousStates[this.previousStates.length - 1];
    this.props = watch(JSON.parse(currentState), () => {
      // Check first, as the callback may get triggered but there is no change.
      const newState = JSON.stringify(this.props);
      if (newState !== currentState) {
        this.previousStates.push(newState);
        this.undoneStates = [];
        this.update();
      }
    });
    this.update();
  },
  undo() {
    this.undoneStates.push(this.previousStates.pop());
    this.stateMoved();
  },
  redo() {
    this.previousStates.push(this.undoneStates.pop());
    this.stateMoved();
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
  { text: "Complete Wallace tutorial", done: true },
  { text: "Star Wallace on github", done: false }
]);

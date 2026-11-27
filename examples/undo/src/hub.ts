import { ComponentInstance, watch } from "wallace";
import { iTask } from "./types";

export class Hub {
  root!: ComponentInstance; // Set by assign:root.
  previousStates: string[]; // Latest is always the current state.
  undoneStates: string[] = [];
  tasks!: iTask[]; // Set by loadState().
  constructor(tasks: iTask[]) {
    this.previousStates = [JSON.stringify(tasks)];
    this.loadState();
  }
  loadState() {
    const currentState = this.previousStates[this.previousStates.length - 1];
    this.tasks = watch(JSON.parse(currentState), () => {
      const newState = JSON.stringify(this.tasks);
      // Check first, as the callback may get triggered but there is no change.
      if (newState !== currentState) {
        this.previousStates.push(newState);
        this.undoneStates = [];
        this.root.update();
      }
    });
  }
  stateMoved() {
    this.loadState();
    this.root.update();
  }
  undo() {
    // Keep the first state, which is the one we started with.
    if (this.previousStates.length > 1) {
      this.undoneStates.push(this.previousStates.pop()!);
      this.stateMoved();
    }
  }
  redo() {
    const state = this.undoneStates.pop();
    if (state !== undefined) {
      this.previousStates.push(state);
      this.stateMoved();
    }
  }
  addTaskKeyup(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const text = target.value;
    if (event.key === "Enter" && text.length > 0) {
      this.tasks.push({ text, done: false });
      target.value = "";
    }
  }
}

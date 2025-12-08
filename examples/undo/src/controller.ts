import { ComponentInstance, watch } from "wallace";
import { iTask } from "./types";

export class Controller {
  root: ComponentInstance;
  previousStates: string[]; // Latest is always the current state.
  undoneStates: string[];
  tasks: iTask[];
  constructor(root: ComponentInstance, tasks: iTask[]) {
    this.root = root;
    this.previousStates = [JSON.stringify(tasks)];
    this.undoneStates = [];
  }
  stateMoved() {
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
    this.root.update();
  }
  undo() {
    this.undoneStates.push(this.previousStates.pop());
    this.stateMoved();
  }
  redo() {
    this.previousStates.push(this.undoneStates.pop());
    this.stateMoved();
  }
}

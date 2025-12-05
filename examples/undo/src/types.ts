export interface iTask {
  text: string;
  done: boolean;
}

export interface TaskListMethods {
  addTaskKeyup(event: KeyboardEvent): void;
}

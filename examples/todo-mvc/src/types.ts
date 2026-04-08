import { TaskListHub } from "./hubs";

export interface iTask {
  id: number;
  hub?: TaskListHub;
  text: string;
  done: boolean;
}

import { TaskListController } from "./controllers";

export interface iTask {
  id: number;
  ctrl?: TaskListController;
  text: string;
  done: boolean;
}

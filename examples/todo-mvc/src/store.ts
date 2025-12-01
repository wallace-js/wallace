/**
 * This just simulates an async call to an API or storage etc...
 */

const tasks = [
  { id: 1, text: "Complete Wallace tutorial", done: true },
  { id: 2, text: "Star Wallace on github", done: false }
];

let latestId = tasks.length - 1;

export async function fetchTasks() {
  await new Promise(r => setTimeout(r, 500));
  return tasks.slice();
}

export async function addTask(text: string) {
  await new Promise(r => setTimeout(r, 500));
  latestId += 1;
  const newTask = { id: latestId, text, done: false };
  tasks.push(newTask);
  return newTask;
}

export async function toggleTask({ id, done }) {
  await new Promise(r => setTimeout(r, 500));
  const task = tasks.find(t => t.id === id);
  task.done = done;
  return task;
}

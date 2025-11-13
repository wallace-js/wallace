/**
 * This just simulates an async call to an API or storage etc...
 */
export async function fetchTasks() {
  await new Promise((r) => setTimeout(r, 500));
  return [
    { text: "Complete tutorial", done: false },
    { text: "Star on github", done: false },
  ];
}

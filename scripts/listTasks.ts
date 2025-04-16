import { taskStorage } from "../src/persistence";
import { enumerateAllTasks } from "../src/taskUtils";

async function main() {
  const tasks = enumerateAllTasks();
  let completed = 0;
  let failed = 0;
  for (const task of tasks) {
    const status = await taskStorage.getItem(task.id);
    let state = status ? status.state : "pending";
    if (state === "completed") completed++;
    else if (state === "failed") failed++;
  }
  const total = tasks.length;
  const evaluated = completed + failed;
  console.log(`Evaluated ${evaluated}/${total}, ${failed} failed`);
}

main();

import { taskStorage } from "../src/persistence";
import { enumerateAllTasks } from "../src/taskUtils";

async function main() {
  const tasks = enumerateAllTasks();
  let nextNum = 1;
  for (const task of tasks) {
    const num = nextNum++;
    const status = await taskStorage.getItem(task.id);
    console.log(
      `${num}. ${task.id} | ${status ? status.state : "(not started)"}`
    );
  }
}

main();

import { inspect } from "node:util";
import { gradeTask, showGradedTask } from "../src/gradeTask";
import { enumerateAllTasks } from "../src/taskUtils";

// console.log(logStorage.getItem(Bun.argv[2]));
const tasks = enumerateAllTasks();

const task = tasks.find((t) => t.id === Bun.argv[2]);
if (!task) {
  console.error("Task not found");
  process.exit(1);
}

const gradedTask = await gradeTask(task);
if (!gradedTask) {
  console.error("Graded task not found");
  process.exit(1);
}

console.log("Graded task:");
console.log(inspect(gradedTask, { depth: 10, colors: true }));

showGradedTask(gradedTask);

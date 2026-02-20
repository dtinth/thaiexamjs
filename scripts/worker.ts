import { evaluateQuestion } from "../src/evaluateQuestion";
import { gradeTask, showGradedTask } from "../src/gradeTask";
import { taskStorage } from "../src/persistence";
import type { TaskStatus } from "../src/taskStatus";
import {
  acquireTaskForWorkerWithLease,
  enumerateAllTasks,
} from "../src/taskUtils";

function isTaskPending(status: TaskStatus | null): boolean {
  if (!status) return true;
  if (status.state === "pending") return true;
  if (
    status.state === "in_progress" &&
    status.leaseExpiresAt &&
    Date.parse(status.leaseExpiresAt) < Date.now()
  )
    return true;
  return false;
}

async function allTasksFinished(): Promise<boolean> {
  const tasks = enumerateAllTasks({ includeLegacy: false });
  for (const task of tasks) {
    const status = await taskStorage.getItem(task.id);
    if (isTaskPending(status)) return false;
  }
  return true;
}

async function runWorker() {
  while (true) {
    const acquired = await acquireTaskForWorkerWithLease();
    if (!acquired) {
      if (await allTasksFinished()) {
        console.log("All tasks are completed or failed. Exiting.");
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
    const { task, release } = acquired;
    console.log(`Acquired task: ${task.id}`);
    try {
      const result = await evaluateQuestion(
        task.modelPresetId,
        task.questionEntry.question
      );
      await release(result);
      const gradedTask = await gradeTask(task);
      if (gradedTask) showGradedTask(gradedTask);
      console.log(`Task completed: ${task.id}`);
    } catch (err) {
      await release(
        undefined,
        err instanceof Error ? err.message : String(err)
      );
      console.error(`Task failed: ${task.id}`, err);
    }
    if (process.env["SINGLE_RUN"]) {
      console.log("Single run mode: exiting after one task.");
      break;
    }
  }
}

const WORKER_COUNT = Number(process.env["WORKER_COUNT"] || 1);

async function main() {
  for (let i = 0; i < WORKER_COUNT; i++) {
    setTimeout(() => {
      runWorker();
    }, i * 1000);
  }
}

main();

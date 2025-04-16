import { aggregate } from "mingo";
import "mingo/init/system";
import { gradeLogEntry, type GradingResult } from "./gradeLogEntry";
import { taskStorage } from "./persistence";
import type { TaskStatus } from "./taskStatus";
import { enumerateAllTasks, type Task } from "./taskUtils";

function showGradedTask({ task, gradingResult }: GradedTask) {
  console.log(
    [
      task.id,
      gradingResult.expected,
      gradingResult.actual || "?",
      gradingResult.actual
        ? gradingResult.actual === gradingResult.expected
          ? "✅"
          : "❌"
        : "❓",
    ].join(" | ")
  );
}

export async function loadAllData() {
  const tasks = enumerateAllTasks();
  const data: GradedTask[] = [];
  for (const task of tasks) {
    const status = await taskStorage.getItem(task.id);
    if (!status) continue;
    if (!status.result) continue;
    const gradedTask = {
      task,
      status,
      gradingResult: gradeLogEntry({
        question: task.questionEntry.question,
        result: status.result,
      }),
    };
    showGradedTask(gradedTask);
    data.push(gradedTask);
  }

  const examPresetIds = aggregate(data, [
    { $group: { _id: "$task.questionEntry.examPresetId", count: { $sum: 1 } } },
  ]);
  console.log(examPresetIds);
  return data;
}

export interface GradedTask {
  task: Task;
  status: TaskStatus;
  gradingResult: GradingResult;
}

loadAllData();

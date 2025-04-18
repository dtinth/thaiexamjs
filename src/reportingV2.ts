import { getOrCreate } from "@thai/get-or-create";
import { aggregate, find } from "mingo";
import "mingo/init/system";
import { type GradedTask, gradeTask } from "./gradeTask";
import { enumerateAllTasks } from "./taskUtils";

export async function getAllGradedTasks() {
  const tasks = enumerateAllTasks();
  const data: GradedTask[] = [];
  for (const task of tasks) {
    const gradedTask = await gradeTask(task);
    if (!gradedTask) continue;
    data.push(gradedTask);
  }

  return data;
}

export function filterByExamPresetId(
  gradedTasks: GradedTask[],
  examPresetId: string
): GradedTask[] {
  return find(gradedTasks, {
    "task.questionEntry.examPresetId": examPresetId,
  }).all() as GradedTask[];
}

const questionIdCacheMap = new WeakMap<
  GradedTask[],
  Map<string, GradedTask[]>
>();

export function filterByQuestionId(
  gradedTasks: GradedTask[],
  questionId: string
) {
  const map = getOrCreate(questionIdCacheMap, gradedTasks, () => {
    const groups = aggregate(gradedTasks, [
      { $sort: { "task.id": 1 } },
      {
        $group: {
          _id: "$task.questionEntry.id",
          tasks: { $push: "$$ROOT" },
        },
      },
    ]) as { _id: string; tasks: GradedTask[] }[];
    return new Map(groups.map((group) => [group._id, group.tasks]));
  });
  return map.get(questionId) || [];
}

export interface StatsByModelEntry {
  modelPresetId: string;
  accuracy: number;
  score: number;
  total: number;
  inputTokens: number;
  outputTokens: number;
  costThb: number;
}

export function getStatsByModel(
  gradedTasks: GradedTask[]
): StatsByModelEntry[] {
  const scores = aggregate(gradedTasks, [
    {
      $group: {
        _id: "$task.modelPresetId",
        score: { $sum: "$score" },
        total: { $sum: 1 },
        inputTokens: { $sum: "$status.result.usage.promptTokens" },
        outputTokens: { $sum: "$status.result.usage.completionTokens" },
        costThb: { $sum: "$costThb" },
      },
    },
  ]) as {
    _id: string;
    score: number;
    total: number;
    inputTokens: number;
    outputTokens: number;
    costThb: number;
  }[];

  const maxTotal = Math.max(0, ...scores.map((item) => item.total));

  return scores
    .map((item) => ({
      modelPresetId: item._id,
      accuracy: item.score / maxTotal,
      score: item.score,
      total: item.total,
      inputTokens: item.inputTokens,
      outputTokens: item.outputTokens,
      costThb: item.costThb,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

import type { EvaluationResult } from "./evaluateQuestion";
import { modelPresets } from "./modelPresets";
import { taskStorage } from "./persistence";
import type { TaskStatus } from "./taskStatus";
import type { Task } from "./taskUtils";

export async function gradeTask(task: Task): Promise<GradedTask | undefined> {
  const status = await taskStorage.getItem(task.id);
  if (!status) return;
  if (!status.result) return;
  const gradingResult = grade(task.questionEntry.question, status.result);
  const score = gradingResult.expected === gradingResult.actual ? 1 : 0;
  const usage = status.result?.usage;
  const inputTokens = usage?.promptTokens || 0;
  const outputTokens = usage?.completionTokens || 0;
  const modelPreset = modelPresets[task.modelPresetId];
  const costUsd =
    inputTokens * modelPreset.cost[0] * 1e-6 +
    outputTokens * modelPreset.cost[1] * 1e-6;
  const costThb = costUsd * 35; // Assuming 1 USD = 35 THB
  const gradedTask: GradedTask = {
    task,
    status,
    gradingResult,
    score,
    costThb,
  };
  return gradedTask;
}

export function showGradedTask({ task, gradingResult, status }: GradedTask) {
  const usage = status.result?.usage;
  const inputTokens = usage?.promptTokens || 0;
  const outputTokens = usage?.completionTokens || 0;
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
      `[in: ${inputTokens} | out: ${outputTokens}]`,
    ].join(" | ")
  );
}

export interface GradedTask {
  task: Task;
  status: TaskStatus;
  gradingResult: GradingResult;
  score: number;
  costThb: number;
}

function grade(question: any, result: EvaluationResult): GradingResult {
  const expected = question.answer;
  const found = Array.from(
    result.text.matchAll(/"correct_answer_key"\s*:\s*"(\w)"/gi)
  );
  if (found.length === 1) {
    const actual = found[0][1].toLowerCase();
    return { actual, expected };
  }
  return { expected };
}

export type GradingResult = {
  expected: string;
  actual?: string;
};

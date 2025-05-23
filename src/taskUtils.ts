import { clearInterval, setInterval } from "node:timers";
import type { QuestionEntry } from "./examPresets";
import { examPresets } from "./examPresets";
import { modelPresets } from "./modelPresets";
import { taskStorage } from "./persistence";
import type { TaskStatus } from "./taskStatus";

export interface Task {
  id: string;
  modelPresetId: string;
  questionEntry: QuestionEntry;
}

class Filter {
  private filters: string[] | null;
  constructor(envValue: string | undefined) {
    this.filters = envValue
      ? envValue
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
  }
  matches(value: string): boolean {
    if (!this.filters) return true;
    return this.filters.some((f) => value.includes(f));
  }
}

export function enumerateAllTasks(): Task[] {
  const questionFilter = new Filter(process.env["QUESTION_FILTER"]);
  const modelFilter = new Filter(process.env["MODEL_FILTER"]);
  const tasks: Task[] = [];
  for (const modelPresetId of Object.keys(modelPresets)) {
    if (!modelFilter.matches(modelPresetId)) continue;
    for (const examPresetId of examPresets.availableExamPresetIds) {
      const examPreset = examPresets.get(examPresetId);
      for (const questionEntry of examPreset.questionEntries) {
        if (!questionFilter.matches(questionEntry.id)) continue;
        tasks.push({
          id: `${modelPresetId}:${questionEntry.id}`,
          modelPresetId: modelPresetId,
          questionEntry,
        });
      }
    }
  }
  return tasks;
}

/**
 * Acquires a task for a worker, sets a short lease, and returns heartbeat/release functions.
 */
export async function acquireTaskForWorkerWithLease(leaseSeconds = 15) {
  const now = Date.now();
  const leaseExpiresAt = new Date(now + leaseSeconds * 1000).toISOString();
  const tasks = enumerateAllTasks();
  for (const task of tasks.sort(() => Math.random() - 0.5)) {
    const status = await taskStorage.getItem(task.id);
    const isAvailable =
      !status ||
      status.state === "failed" ||
      status.state === "pending" ||
      (status.state === "in_progress" &&
        status.leaseExpiresAt &&
        Date.parse(status.leaseExpiresAt) < now);
    if (isAvailable) {
      const newStatus: TaskStatus = {
        ...(status ?? { attempts: 0 }),
        state: "in_progress",
        leaseExpiresAt,
        updatedAt: new Date(now).toISOString(),
      };
      await taskStorage.setItem(task.id, newStatus);
      let released = false;
      let heartbeatInterval: ReturnType<typeof setInterval> | undefined;
      const heartbeat = async () => {
        if (released) return;
        const ext = new Date(Date.now() + leaseSeconds * 1000).toISOString();
        await taskStorage.setItem(task.id, {
          ...newStatus,
          leaseExpiresAt: ext,
          updatedAt: new Date().toISOString(),
        });
      };
      heartbeatInterval = setInterval(
        heartbeat,
        Math.max(leaseSeconds - 5, 5) * 1000
      );
      const release = async (result: any, error?: string) => {
        released = true;
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        await taskStorage.setItem(task.id, {
          ...newStatus,
          state: error ? "failed" : "completed",
          leaseExpiresAt: null,
          updatedAt: new Date().toISOString(),
          result: error ? undefined : result,
          lastError: error,
        });
      };
      return { task, status, release };
    }
  }
  return null;
}

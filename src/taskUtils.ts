import type { QuestionEntry } from "./examPresets";
import { examPresets } from "./examPresets";
import { modelPresets } from "./modelPresets";

export interface Task {
  id: string;
  presetId: string;
  questionEntry: QuestionEntry;
}

export function enumerateAllTasks(): Task[] {
  const tasks: Task[] = [];
  for (const presetId of Object.keys(modelPresets)) {
    for (const examPresetId of examPresets.availableExamPresetIds) {
      const examPreset = examPresets.get(examPresetId);
      for (const questionEntry of examPreset.questionEntries) {
        tasks.push({
          id: `${presetId}:${questionEntry.id}`,
          presetId,
          questionEntry,
        });
      }
    }
  }
  return tasks;
}

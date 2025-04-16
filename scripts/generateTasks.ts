import { examPresets } from "../src/examPresets";
import { modelPresets } from "../src/modelPresets";
import { taskStorage } from "../src/persistence";
import type { Task } from "../src/taskSchema";

async function main() {
  let created = 0;
  for (const presetId of Object.keys(modelPresets)) {
    for (const examPresetId of examPresets.availableExamPresetIds) {
      const examPreset = examPresets.get(examPresetId);
      for (const questionEntry of examPreset.questionEntries) {
        const taskId = `${presetId}:${questionEntry.id}`;
        const existing = await taskStorage.getItem(taskId);
        if (existing) continue; // Idempotency: skip if exists
        const now = new Date().toISOString();
        const task: Task = {
          id: taskId,
          presetId,
          questionId: questionEntry.id,
          file: questionEntry.file,
          index: questionEntry.index,
          state: "pending",
          leaseExpiresAt: null,
          attempts: 0,
          createdAt: now,
          updatedAt: now,
        };
        await taskStorage.setItem(taskId, task);
        created++;
      }
    }
  }
  console.log(`Task generation complete. ${created} new tasks created.`);
}

main();

import { find } from "mingo";
import { parse } from "ts-command-line-args";
import { gradeTask } from "../src/gradeTask";
import { taskStorage } from "../src/persistence";
import { enumerateAllTasks, type Task } from "../src/taskUtils";

interface Args {
  modelPresetId?: string;
  questionId?: string;
  f?: boolean;
  ungraded?: boolean;
}

const args = parse<Args>({
  modelPresetId: { type: String, optional: true },
  questionId: { type: String, optional: true },
  ungraded: { type: Boolean, optional: true },
  f: { type: Boolean, optional: true, alias: "f" },
});

if (!args.modelPresetId && !args.questionId) {
  console.error(
    "Usage: bun scripts/resetModelV2.ts [--modelPresetId <id>] [--questionId <id>] [--ungraded] [-f]"
  );
  console.error("At least one filter must be supplied.");
  process.exit(1);
}

const tasks = enumerateAllTasks();
const query: any = {};
if (args.modelPresetId) query["modelPresetId"] = args.modelPresetId;
if (args.questionId) query["questionEntry.id"] = args.questionId;
const toRemove = find(tasks, query).all() as Task[];

if (toRemove.length === 0) {
  console.log("No matching tasks found.");
  process.exit(0);
}

for (const task of toRemove) {
  const id = task.id;
  if (await taskStorage.hasItem(id)) {
    let shouldRemove = true;
    if (args.ungraded) {
      const gradedTask = await gradeTask(task);
      const graded = gradedTask?.gradingResult.actual;
      if (graded) shouldRemove = false;
    }
    if (!shouldRemove) {
      continue;
    }
    if (args.f) {
      console.log(`Removed task status: ${id}`);
      await taskStorage.removeItem(id);
    } else {
      console.log(`[dry run] Would remove task status: ${id}`);
    }
  }
}

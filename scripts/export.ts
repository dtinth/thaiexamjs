import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { compose } from "node:stream";
import type { Writable } from "node:stream";
import { taskStorage } from "../src/persistence";
import { enumerateAllTasks } from "../src/taskUtils";

function sanitize(id: string) {
  return id.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
}

function openWriter(examPresetId: string, modelPresetId: string): Writable {
  const dir = path.join("snapshot", examPresetId);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${sanitize(modelPresetId)}.jsonl.br`);
  const compressor = zlib.createBrotliCompress({
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 9,
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    },
  });
  return compose(compressor, fs.createWriteStream(filePath));
}

function closeWriter(writer: Writable): Promise<void> {
  return new Promise((resolve, reject) =>
    writer.end((err?: Error | null) => (err ? reject(err) : resolve()))
  );
}

const tasks = enumerateAllTasks();
let currentKey: string | null = null;
let currentWriter: Writable | null = null;
let fileCount = 0;

for (const [index, task] of tasks.entries()) {
  const { examPresetId } = task.questionEntry;
  const key = `${examPresetId}/${task.modelPresetId}`;

  if (key !== currentKey) {
    if (currentWriter) await closeWriter(currentWriter);
    currentWriter = openWriter(examPresetId, task.modelPresetId);
    currentKey = key;
    fileCount++;
    console.log(`[${fileCount}] ${key}`);
  }

  const status = await taskStorage.getItem(task.id);
  if (!status) continue;

  currentWriter!.write(JSON.stringify({ _id: task.id, ...status }) + "\n");
}

if (currentWriter) await closeWriter(currentWriter);
console.log(`Exported to ${fileCount} files under snapshot/`);

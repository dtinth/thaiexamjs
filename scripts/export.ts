import fs from "node:fs";
import path from "node:path";
import type { Writable } from "node:stream";
import { compose } from "node:stream";
import zlib from "node:zlib";
import { taskStorage } from "../src/persistence";
import { enumerateAllTasks } from "../src/taskUtils";

function sanitize(id: string) {
  return id.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
}

function closeWriter(writer: Writable): Promise<void> {
  return new Promise((resolve, reject) =>
    writer.end((err?: Error | null) => (err ? reject(err) : resolve())),
  );
}

// Collect existing files before export
const existingFiles = new Set<string>();
const snapshotDir = "snapshot";
if (fs.existsSync(snapshotDir)) {
  for (const examDir of fs.readdirSync(snapshotDir)) {
    const examPath = path.join(snapshotDir, examDir);
    if (!fs.statSync(examPath).isDirectory()) continue;
    for (const file of fs.readdirSync(examPath)) {
      if (file.endsWith(".jsonl.br"))
        existingFiles.add(path.join(examPath, file));
    }
  }
}

const tasks = enumerateAllTasks({ includeOldModels: true });
let currentKey: string | null = null;
let currentWriter: Writable | null = null;
let currentFilePath: string | null = null;
let fileCount = 0;
const writtenFiles = new Set<string>();

function openWriter(
  examPresetId: string,
  modelPresetId: string,
): [Writable, string] {
  const dir = path.join("snapshot", examPresetId);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${sanitize(modelPresetId)}.jsonl.br`);
  const compressor = zlib.createBrotliCompress({
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 9,
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    },
  });
  return [compose(compressor, fs.createWriteStream(filePath)), filePath];
}

for (const [index, task] of tasks.entries()) {
  const { examPresetId } = task.questionEntry;
  const key = `${examPresetId}/${task.modelPresetId}`;

  if (key !== currentKey) {
    if (currentWriter) await closeWriter(currentWriter);
    [currentWriter, currentFilePath] = openWriter(
      examPresetId,
      task.modelPresetId,
    );
    writtenFiles.add(currentFilePath!);
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

// Delete stale files
let deleteCount = 0;
for (const file of existingFiles) {
  if (!writtenFiles.has(file)) {
    fs.unlinkSync(file);
    console.log(`Deleted stale file: ${file}`);
    deleteCount++;
  }
}
if (deleteCount > 0) console.log(`Deleted ${deleteCount} stale file(s).`);

import { createReadStream } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import zlib from "node:zlib";
import { taskStorage } from "../src/persistence";
import type { TaskStatus } from "../src/taskStatus";

const snapshotDir = "snapshot";
const files: string[] = [];

for (const examDir of fs.readdirSync(snapshotDir).sort()) {
  const examPath = path.join(snapshotDir, examDir);
  if (!fs.statSync(examPath).isDirectory()) continue;
  for (const file of fs.readdirSync(examPath).sort()) {
    if (file.endsWith(".jsonl.br")) files.push(path.join(examPath, file));
  }
}

for (const inputPath of files) {
  console.log(`\nImporting ${inputPath}...`);
  const stream = createReadStream(inputPath).pipe(zlib.createBrotliDecompress());
  const rl = createInterface({ input: stream as any, crlfDelay: Infinity });
  let imported = 0;
  for await (const line of rl) {
    if (!line?.trim()) continue;
    try {
      const { _id, ...status }: TaskStatus & { _id: string } = JSON.parse(line);
      taskStorage.setItem(_id, status);
      imported++;
    } catch (error) {
      console.error(`Error importing line:`, error);
    }
  }
  console.log(`  → ${imported} records`);
}

console.log("Done.");

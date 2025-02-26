import fs from "node:fs";
import { calculateLogId, type LogEntry } from "../src/LogEntry";
import { logStorage } from "../src/logStorage";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Error: Please provide a JSON file path as an argument");
  console.error("Usage: bun run scripts/importLogs.ts <file-path>");
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath, "utf-8");
const lines = fileContent.trim().split("\n");
let imported = 0;

for (const [i, line] of lines.entries()) {
  const lineNumber = i + 1;
  try {
    const logEntry: LogEntry = JSON.parse(line);
    const notice = (message: string) => {
      console.warn(`Line ${lineNumber}: ${message}`);
    };

    if (!logEntry.time) {
      notice("Adding missing time");
      logEntry.time = "2025-02-25T00:00:00.000Z";
    }
    if (!logEntry.presetId) {
      logEntry.presetId = logEntry.modelId;
      notice(`Adding missing presetId: ${logEntry.presetId}`);
    }
    const expectedId = calculateLogId(logEntry);
    if (logEntry.id !== expectedId) {
      notice(`Migrating log entry ID from ${logEntry.id} to ${expectedId}`);
      logEntry.id = expectedId;
    }

    logStorage[logEntry.id] = JSON.stringify(logEntry);
    imported++;
    console.log(`Line ${lineNumber}: Imported log entry ${logEntry.id}`);
  } catch (error) {
    console.error("Error parsing or importing log entry:", error);
  }
}

console.log(`Successfully imported ${imported} log entries from ${filePath}`);

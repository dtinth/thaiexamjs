import fs from "node:fs";
import type { LogEntry } from "../src/LogEntry";
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

for (const line of lines) {
  try {
    const logEntry: LogEntry = JSON.parse(line);
    logStorage[logEntry.id] = JSON.stringify(logEntry);
    imported++;
    console.log(`Imported log entry ${logEntry.id}`);
  } catch (error) {
    console.error("Error parsing or importing log entry:", error);
  }
}

console.log(`Successfully imported ${imported} log entries from ${filePath}`);

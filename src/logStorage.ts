import { createSqlStorage } from "@thai/sql-storage";
import Database from "bun:sqlite";
import { mkdirSync } from "node:fs";
import type { LogEntry } from "./LogEntry";

mkdirSync(".data", { recursive: true });
const db = new Database(".data/logs.db");
db.exec("PRAGMA busy_timeout = 3000");
export const logStorage = createSqlStorage(db);

/**
 * Returns an iterator for all stored log entries.
 * This provides a memory-efficient way to iterate through all logs.
 */
export function* getAllLogs(): Generator<LogEntry> {
  for (const [key, value] of logStorage as any) {
    if (value) {
      try {
        yield JSON.parse(value) as LogEntry;
      } catch (e) {
        console.error(`Error parsing log entry ${key}:`, e);
      }
    }
  }
}

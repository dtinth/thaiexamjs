import { createSqlStorage } from "@thai/sql-storage";
import Database from "bun:sqlite";
import { mkdirSync } from "node:fs";
import type { LogEntry } from "./LogEntry";

mkdirSync(".data", { recursive: true });
const db = new Database(".data/logs.db");
db.exec("PRAGMA busy_timeout = 3000");
export const logStorage = createSqlStorage(db);

/**
 * Retrieves a specific log entry by its ID
 * @param id The log entry ID
 * @returns The log entry
 * @throws Error if the log entry is not found or couldn't be parsed
 */
export function getLogEntry(id: string): LogEntry {
  const value = logStorage[id];
  if (!value) {
    throw new Error(`Log entry not found: ${id}`);
  }

  try {
    return JSON.parse(value) as LogEntry;
  } catch (e) {
    throw new Error(`Error parsing log entry ${id}: ${e}`);
  }
}

/**
 * Returns an iterator for all stored log entries.
 * This provides a memory-efficient way to iterate through all logs.
 */
export function* getAllLogEntries(): Generator<LogEntry> {
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

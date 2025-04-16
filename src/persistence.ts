// Persistence layer for the new task queue system
import { createSqlStorage } from "@thai/sql-storage";
import Database from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { createStorage } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";
import type { Task } from "./taskSchema";

// Ensure the .data directory exists
mkdirSync(".data", { recursive: true });

// Create a new SQLite database for the task queue persistence layer
const db = new Database(".data/state.db");
db.exec("PRAGMA busy_timeout = 3000");

// Create the SQL storage driver
const sqlStorage = createSqlStorage(db);

// Wrap the SQL storage with the localStorageDriver for unstorage
export const taskStorage = createStorage<Task>({
  driver: localStorageDriver({ storage: sqlStorage }),
});

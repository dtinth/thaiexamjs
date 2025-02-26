import { createSqlStorage } from "@thai/sql-storage";
import Database from "bun:sqlite";

const db = new Database(".data/logs.db");
db.exec("PRAGMA busy_timeout = 3000");
export const logStorage = createSqlStorage(db);

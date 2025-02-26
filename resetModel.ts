import type { LogEntry } from "./LogEntry";
import { logStorage } from "./logStorage";

for (const [k, v] of logStorage as any) {
  const logEntry: LogEntry = JSON.parse(v);
  if (logEntry.modelId === Bun.argv[2]) {
    console.log(k);
    logStorage.removeItem(k);
  }
}

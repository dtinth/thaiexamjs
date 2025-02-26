import type { LogEntry } from "./LogEntry";
import { logStorage } from "./logStorage";

for (const [k, v] of logStorage as any) {
  const logEntry: LogEntry = JSON.parse(v);
  if (Bun.argv[2] && logEntry.presetId === Bun.argv[2]) {
    console.log(k);
    logStorage.removeItem(k);
  }
}

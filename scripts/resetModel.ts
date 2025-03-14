import type { LogEntry } from "../src/LogEntry";
import { logStorage } from "../src/logStorage";

for (const [k, v] of logStorage as any) {
  const logEntry: LogEntry = JSON.parse(v);
  if (Bun.argv[2] && logEntry.presetId === Bun.argv[2]) {
    console.log(k);
    logStorage.removeItem(k);
  }
}

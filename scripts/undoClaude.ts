import type { LogEntry } from "../src/LogEntry";
import { logStorage } from "../src/logStorage";

for (const [k, v] of logStorage as any) {
  const logEntry: LogEntry = JSON.parse(v);
  if (logEntry.modelId === "claude-3-7-sonnet-20250219") {
    if (logEntry.result.reasoning) {
      console.log(k);
      logStorage.removeItem(k);
    }
  }
}

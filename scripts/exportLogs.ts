import type { LogEntry } from "../src/LogEntry";
import { logStorage } from "../src/logStorage";

for (const [k, v] of logStorage as any) {
  const logEntry: LogEntry = JSON.parse(v);
  console.log(JSON.stringify(logEntry));
}

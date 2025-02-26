import { createHash } from "node:crypto";
import type { EvaluationResult } from "./evaluateQuestion";

export interface LogEntry {
  time: string;
  id: string;
  file: string;
  index: number;
  presetId: string;
  modelId: string;
  provider: string;
  question: any;
  result: EvaluationResult;
}

export function calculateLogId(
  entry: Pick<LogEntry, "presetId" | "file" | "index">
) {
  return createHash("md5")
    .update(`${entry.presetId}:${entry.file}[${entry.index}]`)
    .digest("hex");
}

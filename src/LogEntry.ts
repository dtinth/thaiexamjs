import type { EvaluationResult } from "./evaluateQuestion";

export interface LogEntry {
  time?: string; // If not defined, set to 2025-02-25T00:00:00.000Z
  id: string;
  file: string;
  index: number;
  presetId?: string;
  modelId: string;
  provider: string;
  question: any;
  result: EvaluationResult;
}

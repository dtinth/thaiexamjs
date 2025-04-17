import type { EvaluationResult } from "./evaluateQuestion";

export interface TaskStatus {
  state: "pending" | "in_progress" | "completed" | "failed";
  leaseExpiresAt: string | null;
  attempts: number;
  lastError?: string;
  updatedAt: string;
  result?: EvaluationResult;
}

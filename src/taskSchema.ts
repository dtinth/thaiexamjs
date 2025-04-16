// Task schema for the new task queue system
export interface Task {
  id: string; // `${presetId}:${questionId}`
  presetId: string;
  questionId: string;
  file: string;
  index: number;
  state: "pending" | "in_progress" | "completed" | "failed";
  leaseExpiresAt: string | null;
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  result?: any;
}

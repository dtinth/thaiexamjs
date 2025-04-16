// Task status schema for the new task queue system
export interface TaskStatus {
  state: "pending" | "in_progress" | "completed" | "failed";
  leaseExpiresAt: string | null;
  attempts: number;
  lastError?: string;
  updatedAt: string;
  result?: any;
}

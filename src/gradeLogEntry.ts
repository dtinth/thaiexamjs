import type { LogEntry } from "./LogEntry";

export function gradeLogEntry(
  logEntry: Pick<LogEntry, "question" | "result">
): GradingResult {
  const expected = logEntry.question.answer;
  const found = Array.from(
    logEntry.result.text.matchAll(/"correct_answer_key"\s*:\s*"(\w)"/gi)
  );
  if (found.length === 1) {
    const actual = found[0][1].toLowerCase();
    return { actual, expected };
  }
  return { expected };
}

export type GradingResult = {
  expected: string;
  actual?: string;
};

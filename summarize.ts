import { getOrCreate } from "@thai/get-or-create";
import { gradeLogEntry } from "./gradeLogEntry";
import { loadQuestion } from "./loadQuestion";
import type { LogEntry } from "./LogEntry";
import { logStorage } from "./logStorage";
import type { Report } from "./Report";

const byModel = new Map<string, ModelInfo>();
class ModelInfo {
  logEntries: Map<string, LogEntry> = new Map();
  process(logEntry: LogEntry) {
    const key = `${logEntry.file}[${logEntry.index}]`;
    this.logEntries.set(key, logEntry);
  }
}
for (const [k, v] of logStorage as any) {
  const logEntry: LogEntry = JSON.parse(v);
  const presetId = logEntry.presetId || logEntry.modelId;
  getOrCreate(byModel, presetId, () => new ModelInfo()).process(logEntry);
}

async function createReport(file: string) {
  const questions = await loadQuestion(file);
  const output: Report = {
    questions: [],
    modelNames: Array.from(byModel.keys()),
  };
  for (const [index, question] of questions.entries()) {
    const questionKey = `${file}[${index}]`;
    const questionInfo: (typeof output.questions)[number] = {
      questionKey,
      question,
      answers: {},
    };
    output.questions.push(questionInfo);
    for (const [modelKey, modelInfo] of byModel) {
      const logEntry = modelInfo.logEntries.get(questionKey);
      if (logEntry) {
        const gradingResult = gradeLogEntry(logEntry);
        questionInfo.answers[modelKey] = {
          id: logEntry.id,
          expected: gradingResult.expected,
          actual: gradingResult.actual,
          correct: gradingResult.actual === gradingResult.expected,
          result: logEntry.result,
        };
      }
    }
  }
  return output;
}

await Bun.write(
  "docs/onet.json",
  JSON.stringify(await createReport("thai_exam/data/onet/onet_test.jsonl"))
);

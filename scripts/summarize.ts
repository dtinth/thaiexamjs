import { getOrCreate } from "@thai/get-or-create";
import { examPresets } from "../src/examPresets";
import { gradeLogEntry } from "../src/gradeLogEntry";
import type { LogEntry } from "../src/LogEntry";
import { getAllLogEntries } from "../src/logStorage";
import type { Report } from "../src/Report";

const byModel = new Map<string, ModelInfo>();
class ModelInfo {
  logEntries: Map<string, LogEntry> = new Map();
  process(logEntry: LogEntry) {
    const key = `${logEntry.file}[${logEntry.index}]`;
    this.logEntries.set(key, logEntry);
  }
}
for (const logEntry of getAllLogEntries()) {
  const presetId = logEntry.presetId || logEntry.modelId;
  getOrCreate(byModel, presetId, () => new ModelInfo()).process(logEntry);
}

async function createReport(examId: string) {
  const examPreset = examPresets.get(examId);
  const questionEntries = examPreset.questionEntries;

  const output: Report = {
    questions: [],
    modelNames: Array.from(byModel.keys()),
  };

  for (const { file, index, question } of questionEntries) {
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

await Bun.write("docs/onet.json", JSON.stringify(await createReport("onet")));

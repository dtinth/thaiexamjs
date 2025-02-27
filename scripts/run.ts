import { evaluateQuestion } from "../src/evaluateQuestion";
import { gradeLogEntry } from "../src/gradeLogEntry";
import { getQuestionFiles, loadQuestion } from "../src/loadQuestion";
import { calculateLogId, type LogEntry } from "../src/LogEntry";
import { logStorage } from "../src/logStorage";
import { modelPresets } from "../src/modelPresets";

const presetId = Bun.argv[2];
const preset = modelPresets[presetId];
const model = preset.createModel(presetId);
if (!model) {
  throw new Error("Invalid model");
}

const files = getQuestionFiles();
for (const file of files) {
  // Filter exams based on EXAM_FILTER environment variable
  const examFilter = process.env["EXAM_FILTER"];
  if (examFilter && !file.includes(examFilter)) {
    continue;
  }

  const questions = await loadQuestion(file);
  for (const [index, question] of questions.entries()) {
    const id = calculateLogId({ presetId, file, index });

    if (process.env["SHARD"]) {
      const [a, b] = process.env["SHARD"].split("/").map(Number);
      if (!a || !b) {
        throw new Error("Invalid shard");
      }
      const shard = parseInt(id.slice(0, 8), 16) % b;
      if (shard !== a - 1) continue;
    }

    try {
      let logEntry: LogEntry | undefined;
      if (logStorage[id]) {
        logEntry = JSON.parse(logStorage[id]) as LogEntry;
      } else {
        const result = await evaluateQuestion(presetId, question);
        logEntry = {
          time: new Date().toISOString(),
          id,
          file,
          index,
          presetId,
          modelId: model.modelId,
          provider: model.provider,
          question,
          result,
        };
        logStorage[logEntry.id] = JSON.stringify(logEntry);
      }
      showLogEntry(logEntry);
    } catch (error) {
      console.error(
        [id, presetId, file + "[" + index + "]", "💥 ERROR"].join(" | ")
      );
      console.error(error);
    }
  }
}

function showLogEntry(logEntry: LogEntry) {
  const gradingResult = gradeLogEntry(logEntry);
  console.log(
    [
      logEntry.id,
      logEntry.presetId,
      logEntry.file + "[" + logEntry.index + "]",
      gradingResult.expected,
      gradingResult.actual || "?",
      gradingResult.actual
        ? gradingResult.actual === gradingResult.expected
          ? "✅"
          : "❌"
        : "❓",
    ].join(" | ")
  );
}

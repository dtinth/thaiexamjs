import { createHash } from "node:crypto";
import { evaluateQuestion } from "./evaluateQuestion";
import { gradeLogEntry } from "./gradeLogEntry";
import { getQuestionFiles, loadQuestion } from "./loadQuestion";
import type { LogEntry } from "./LogEntry";
import { logStorage } from "./logStorage";
import { modelPresets } from "./modelPresets";

const presetId = Bun.argv[2];
const preset = modelPresets[presetId];
const model = preset.createModel(presetId);
if (!model) {
  throw new Error("Invalid model");
}

const files = getQuestionFiles();
for (const file of files) {
  // Just use O-net questions for now
  if (!file.includes("onet")) {
    continue;
  }

  const questions = await loadQuestion(file);
  for (const [index, question] of questions.entries()) {
    let key = [file, index, model.modelId, model.provider].join("/");
    if (preset.providerOptions) {
      key = [file, index, presetId].join("/");
    }
    const id = createHash("md5").update(key).digest("hex");

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
      console.error("Error:", key, error);
    }
  }
}

function showLogEntry(logEntry: LogEntry) {
  const gradingResult = gradeLogEntry(logEntry);
  console.log(
    [
      logEntry.id,
      logEntry.provider + "/" + logEntry.modelId,
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

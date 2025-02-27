import { getOrCreate } from "@thai/get-or-create";
import { readFileSync } from "node:fs";

const examPresetDefinitions: Record<string, ExamPresetDefinition> = {
  onet: {
    filePaths: ["thai_exam/data/onet/onet_test.jsonl"],
  },
  a_level: {
    filePaths: ["thai_exam/data/a_level/a_level_test.jsonl"],
  },
  ic: {
    filePaths: ["thai_exam/data/ic/ic_test.jsonl"],
  },
  tgat: {
    filePaths: ["thai_exam/data/tgat/tgat_test.jsonl"],
  },
  tpat1: {
    filePaths: ["thai_exam/data/tpat1/tpat1_test.jsonl"],
  },
};

interface ExamPresetDefinition {
  filePaths: string[];
}

class ExamPresets {
  private presets: Map<string, ExamPreset> = new Map();
  
  get availableExamPresetIds() {
    return Object.keys(examPresetDefinitions);
  }
  
  get(id: string) {
    return getOrCreate(this.presets, id, () => {
      const definition = examPresetDefinitions[id];
      if (!definition) {
        throw new Error(`Unknown exam preset: ${id}`);
      }
      return new ExamPreset(id, definition);
    });
  }
}

class ExamPreset {
  constructor(public id: string, private definition: ExamPresetDefinition) {}
  private _questionEntries: QuestionEntry[] | undefined;
  get questionEntries() {
    return (this._questionEntries ??= this.definition.filePaths.flatMap(
      (file) => {
        const text = readFileSync(file, "utf-8");
        const questions = text
          .split("\n")
          .filter((x) => x.trim())
          .map((x) => JSON.parse(x));
        return questions.map((question, index) => ({
          file,
          index,
          question,
        }));
      }
    ));
  }
}

interface QuestionEntry {
  file: string;
  index: number;
  question: any;
}

export const examPresets = new ExamPresets();

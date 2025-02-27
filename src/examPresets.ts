import { getOrCreate } from "@thai/get-or-create";
import { readFileSync } from "node:fs";

const examPresetDefinitions: Record<string, ExamPresetDefinition> = {
  onet: {
    filePaths: ["thai_exam/data/onet/onet_test.jsonl"],
    title: "O-NET: Ordinary National Educational Test (ชั้นมัธยมศึกษาปีที่ 6)",
    description: "การทดสอบทางการศึกษาระดับชาติขั้นพื้นฐาน",
  },
  a_level: {
    filePaths: ["thai_exam/data/a_level/a_level_test.jsonl"],
    title: "A-Level: Applied Knowledge Level",
    description: "การทดสอบความรู้เชิงวิชาการระดับประยุกต์",
  },
  ic: {
    filePaths: ["thai_exam/data/ic/ic_test.jsonl"],
    title: "IC: Investment Consultant",
    description: "การทดสอบใบอนุญาตผู้แนะนำการลงทุน",
  },
  tgat: {
    filePaths: ["thai_exam/data/tgat/tgat_test.jsonl"],
    title: "TGAT: Thai General Aptitude Test",
    description: "การทดสอบความถนัดทั่วไป",
  },
  tpat1: {
    filePaths: ["thai_exam/data/tpat1/tpat1_test.jsonl"],
    title: "TPAT-1: The Thai Professional Aptitude Test 1",
    description: "การทดสอบความถนัดเฉพาะด้านวิชาชีพ 1: (ความถนัดแพทย์)",
  },
};

interface ExamPresetDefinition {
  filePaths: string[];
  title: string;
  description: string;
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

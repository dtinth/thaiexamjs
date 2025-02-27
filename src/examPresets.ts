import { getOrCreate } from "@thai/get-or-create";
import { readFileSync } from "node:fs";

const examPresetDefinitions: Record<string, ExamPresetDefinition> = {
  onet: {
    filePaths: ["thai_exam/data/onet/onet_test.jsonl"],
    shortTitle: "Thai O-NET Tests",
    title: "O-NET: Ordinary National Educational Test (ชั้นมัธยมศึกษาปีที่ 6)",
    description: "การทดสอบทางการศึกษาระดับชาติขั้นพื้นฐาน",
    subjects: {
      thai: {
        shortTitle: "Thai",
        title: "ภาษาไทย",
      },
      social: {
        shortTitle: "Social",
        title: "สังคมศึกษา ศาสนาและวัฒนธรรม",
      },
      science: {
        shortTitle: "Science",
        title: "วิทยาศาสตร์",
      },
      math: {
        shortTitle: "Math",
        title: "คณิตศาสตร์",
      },
    },
  },
  a_level: {
    filePaths: ["thai_exam/data/a_level/a_level_test.jsonl"],
    shortTitle: "Thai A-Level Tests",
    title: "A-Level: Applied Knowledge Level",
    description: "การทดสอบความรู้เชิงวิชาการระดับประยุกต์",
  },
  ic: {
    filePaths: ["thai_exam/data/ic/ic_test.jsonl"],
    shortTitle: "Thai Investment Consultant Tests",
    title: "IC: Investment Consultant",
    description: "การทดสอบใบอนุญาตผู้แนะนำการลงทุน",
  },
  tgat: {
    filePaths: ["thai_exam/data/tgat/tgat_test.jsonl"],
    shortTitle: "TGAT Tests",
    title: "TGAT: Thai General Aptitude Test",
    description: "การทดสอบความถนัดทั่วไป",
  },
  tpat1: {
    filePaths: ["thai_exam/data/tpat1/tpat1_test.jsonl"],
    shortTitle: "TPAT-1 Tests",
    title: "TPAT-1: The Thai Professional Aptitude Test 1",
    description: "การทดสอบความถนัดเฉพาะด้านวิชาชีพ 1 (ความถนัดแพทย์)",
    subjects: {
      Quant: {
        shortTitle: "Quant",
        title: "เชาวน์ปัญญา",
      },
      Ethics: {
        shortTitle: "Ethics",
        title: "จริยธรรมทางการแพทย์",
      },
    },
  },
};

interface ExamPresetDefinition {
  shortTitle: string;
  filePaths: string[];
  title: string;
  description: string;
  subjects?: Record<string, SubjectDefinition>;
}

export interface SubjectDefinition {
  shortTitle: string;
  title: string;
}

export class ExamPresets {
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

export class ExamPreset {
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

  get title() {
    return this.definition.title;
  }

  get description() {
    return this.definition.description;
  }

  get shortTitle() {
    return this.definition.shortTitle;
  }

  get subjects() {
    return this.definition.subjects;
  }
}

export interface QuestionEntry {
  file: string;
  index: number;
  question: any;
}

export const examPresets = new ExamPresets();

import { getOrCreate } from "@thai/get-or-create";
import { readFileSync } from "node:fs";

const examPresetDefinitions: Record<string, ExamPresetDefinition> = {
  onet_m6: {
    filePaths: [
      "openthaigpt_eval/onet_m6_thai.jsonl",
      "openthaigpt_eval/onet_m6_social.jsonl",
      "openthaigpt_eval/onet_m6_math.jsonl",
      "openthaigpt_eval/onet_m6_science.jsonl",
    ],
    datasetProviderInfo: {
      name: "OpenThaiGPT Evaluation Dataset",
      url: "https://huggingface.co/datasets/openthaigpt/openthaigpt_eval",
    },
    shortTitle: "Thai O-NET Tests",
    shortEnglishDescription: "O-NET standardized tests",
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
    humanScore: {
      bySubject: {
        thai: (46.4 * 63) / 100,
        social: (36.87 * 63) / 100,
        science: (28.65 * 20) / 100,
        math: (21.28 * 16) / 100,
      },
    },
  },
  a_level: {
    filePaths: ["thai_exam/data/a_level/a_level_test.jsonl"],
    shortTitle: "Thai A-Level Tests",
    shortEnglishDescription: "Applied Knowledge Level tests",
    title: "A-Level: Applied Knowledge Level",
    description: "การทดสอบความรู้เชิงวิชาการระดับประยุกต์",
    datasetProviderInfo: {
      name: "ThaiExam Dataset",
      url: "https://huggingface.co/datasets/scb10x/thai_exam",
    },
  },
  ic: {
    filePaths: ["thai_exam/data/ic/ic_test.jsonl"],
    shortTitle: "Thai Investment Consultant Licensing Exams",
    shortEnglishDescription: "Investment Consultant licensing exams",
    title: "IC: Investment Consultant",
    description: "การทดสอบใบอนุญาตผู้แนะนำการลงทุน",
    subjects: {
      level1: {
        shortTitle: "P1",
        title: "P1 - หลักสูตรผู้แนะนําการลงทุนตราสารทั่วไป",
      },
      level2: {
        shortTitle: "P2",
        title:
          "P2 - หลักสูตรความรู้เกี่ยวกับตราสารที่มีความซับซ้อน : ตราสารหนี้ และ กองทุนรวม",
      },
      level3: {
        shortTitle: "P3",
        title:
          "P3 - หลักสูตรความรู้เกี่ยวกับตราสารที่มีความซับซ้อน : สัญญาซื้อขายล่วงหน้า",
      },
    },
    datasetProviderInfo: {
      name: "ThaiExam Dataset",
      url: "https://huggingface.co/datasets/scb10x/thai_exam",
    },
  },
  tgat: {
    filePaths: ["thai_exam/data/tgat/tgat_test.jsonl"],
    shortTitle: "TGAT Tests",
    shortEnglishDescription: "TGAT standardized tests",
    title: "TGAT: Thai General Aptitude Test",
    description: "การทดสอบความถนัดทั่วไป",
    subjects: {
      TGAT2: {
        shortTitle: "TGAT2",
        title: "TGAT2 การคิดอย่างมีเหตุผล",
      },
      TGAT3: {
        shortTitle: "TGAT3",
        title: "TGAT3 สมรรถนะการทำงาน",
      },
    },
    datasetProviderInfo: {
      name: "ThaiExam Dataset",
      url: "https://huggingface.co/datasets/scb10x/thai_exam",
    },
  },
  tpat1: {
    filePaths: ["thai_exam/data/tpat1/tpat1_test.jsonl"],
    shortTitle: "TPAT-1 Tests",
    shortEnglishDescription: "professional aptitude tests for medical students",
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
    datasetProviderInfo: {
      name: "ThaiExam Dataset",
      url: "https://huggingface.co/datasets/scb10x/thai_exam",
    },
  },
};

interface ExamPresetDefinition {
  shortTitle: string;
  shortEnglishDescription: string;
  filePaths: string[];
  title: string;
  description: string;
  subjects?: Record<string, SubjectDefinition>;
  humanScore?: HumanScore;
  datasetProviderInfo: DatasetProviderInfo;
}

export interface DatasetProviderInfo {
  name: string;
  url: string;
}

export interface SubjectDefinition {
  shortTitle: string;
  title: string;
}

export interface HumanScore {
  bySubject: Record<string, number>;
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
          id: `${this.id}:${file}:${index}`,
          examPresetId: this.id,
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

  get shortEnglishDescription() {
    return this.definition.shortEnglishDescription;
  }

  get subjects() {
    return this.definition.subjects;
  }

  get humanScore() {
    return this.definition.humanScore;
  }

  get datasetProviderInfo() {
    return this.definition.datasetProviderInfo;
  }
}

export interface QuestionEntry {
  id: string;
  examPresetId: string;
  file: string;
  index: number;
  question: any;
}

export const examPresets = new ExamPresets();

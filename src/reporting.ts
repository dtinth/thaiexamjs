import { getOrCreate } from "@thai/get-or-create";
import type { LogEntry } from "./LogEntry";
import { calculateLogId } from "./LogEntry";
import {
  ExamPreset,
  examPresets,
  type HumanScore,
  type QuestionEntry,
  type SubjectDefinition,
} from "./examPresets";
import { gradeLogEntry, type GradingResult } from "./gradeLogEntry";
import { getLogEntry } from "./logStorage";
import { modelPresets } from "./modelPresets";

const modelDisplayName = (preset: string) => {
  return modelPresets[preset].displayName || preset;
};

const sortedModelPresetIds = Object.keys(modelPresets).sort((a, b) => {
  return modelDisplayName(a).localeCompare(modelDisplayName(b));
});

export class Reporting {
  private exams: Map<string, ExamReport> = new Map();

  getExam(examId: string): ExamReport {
    return getOrCreate(this.exams, examId, () => {
      const examPreset = examPresets.get(examId);
      return new ExamReport(examId, examPreset);
    });
  }

  get examIds(): string[] {
    return examPresets.availableExamPresetIds;
  }
}

export interface SubjectEntry {
  subject: string;
  definition: SubjectDefinition;
  humanScore?: number;
}

export class ExamReport {
  constructor(public readonly id: string, private examPreset: ExamPreset) {}

  private _questions?: ExamQuestionReport[];
  private _models?: ExamModelReport[];
  private _subjectEntries?: SubjectEntry[];

  get title(): string {
    return this.examPreset.title;
  }

  get description(): string {
    return this.examPreset.description;
  }

  get shortTitle(): string {
    return this.examPreset.shortTitle;
  }

  get shortEnglishDescription(): string {
    return this.examPreset.shortEnglishDescription;
  }

  get subjectEntries(): SubjectEntry[] {
    if (this._subjectEntries) return this._subjectEntries;

    // If no subjects defined in the exam preset, return an empty array
    if (!this.examPreset.subjects) return (this._subjectEntries = []);

    // Convert the subjects record to an array of SubjectEntry objects
    return (this._subjectEntries = Object.entries(this.examPreset.subjects).map(
      ([subject, definition]): SubjectEntry => ({
        subject,
        definition,
        humanScore: this.examPreset.humanScore?.bySubject[subject],
      })
    ));
  }

  get humanScore(): HumanScore | undefined {
    return this.examPreset.humanScore;
  }

  get questionReports(): ExamQuestionReport[] {
    return (this._questions ??= this.examPreset.questionEntries.map(
      (questionEntry) => {
        return new ExamQuestionReport(questionEntry);
      }
    ));
  }

  get modelReports(): ExamModelReport[] {
    return (this._models ??= Object.keys(modelPresets)
      .map((presetId) => {
        return new ExamModelReport(
          presetId,
          this.questionReports,
          this.subjectEntries
        );
      })
      .sort((a, b) => a.correctCount - b.correctCount)).reverse();
  }
}

export interface SubjectStats {
  subjectEntry: SubjectEntry;
  correctCount: number;
  gradedCount: number;
}

export class ExamModelReport {
  constructor(
    public readonly presetId: string,
    public questionReports: ExamQuestionReport[],
    public subjectEntries: SubjectEntry[]
  ) {}

  private _stats?: {
    correctCount: number;
    gradedCount: number;
    promptTokens: number;
    completionTokens: number;
  };

  private _statsBySubject?: SubjectStats[];

  private get stats() {
    return (this._stats ??= this._calculateStats());
  }

  private _calculateStats() {
    let correctCount = 0;
    let gradedCount = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    for (const questionReport of this.questionReports) {
      const answerReport = questionReport.answers[this.presetId];
      if (answerReport.found) {
        gradedCount++;
        if (answerReport.correct) {
          correctCount++;
        }

        promptTokens += answerReport.promptTokens;
        completionTokens += answerReport.completionTokens;
      }
    }
    return { correctCount, gradedCount, promptTokens, completionTokens };
  }

  get statsBySubject(): SubjectStats[] {
    if (this._statsBySubject) return this._statsBySubject;

    return (this._statsBySubject = this.subjectEntries.map((subjectEntry) => {
      let correctCount = 0;
      let gradedCount = 0;

      // Count correct/graded questions for this subject
      for (const questionReport of this.questionReports) {
        if (
          questionReport.questionEntry.question.subject === subjectEntry.subject
        ) {
          const answerReport = questionReport.answers[this.presetId];
          if (answerReport.found) {
            gradedCount++;
            if (answerReport.correct) {
              correctCount++;
            }
          }
        }
      }

      return {
        subjectEntry,
        correctCount,
        gradedCount,
      };
    }));
  }

  get correctCount() {
    return this.stats.correctCount;
  }

  get gradedCount() {
    return this.stats.gradedCount;
  }

  get promptTokens() {
    return this.stats.promptTokens;
  }

  get completionTokens() {
    return this.stats.completionTokens;
  }

  get cost() {
    const preset = modelPresets[this.presetId];
    if (!preset?.cost) return 0;

    const [promptCost, completionCost] = preset.cost;
    const cost =
      (this.promptTokens / 1e6) * promptCost +
      (this.completionTokens / 1e6) * completionCost;

    // Convert to THB (35 THB per USD)
    return cost * 35;
  }
}

export class ExamQuestionReport {
  constructor(public readonly questionEntry: QuestionEntry) {}

  private _answers: Record<string, AnswerReport> | undefined;

  get answers(): Record<string, AnswerReport> {
    return (this._answers ??= this._getAllAnswers());
  }

  private _getAllAnswers() {
    const answers: Record<string, AnswerReport> = {};
    for (const presetId of sortedModelPresetIds) {
      answers[presetId] = new AnswerReport(this.questionEntry, presetId);
    }
    return answers;
  }
}

interface AnswerReportFoundData {
  logEntry: LogEntry;
  gradingResult: GradingResult;
}

export class AnswerReport {
  constructor(
    private questionEntry: QuestionEntry,
    public readonly presetId: string
  ) {}

  private _data: { found?: AnswerReportFoundData } | undefined;

  get data() {
    return (this._data ??= this._load());
  }

  private _load() {
    const logId = calculateLogId({
      presetId: this.presetId,
      file: this.questionEntry.file,
      index: this.questionEntry.index,
    });
    let found: AnswerReportFoundData | undefined;
    try {
      const logEntry = getLogEntry(logId);
      const gradingResult = gradeLogEntry(logEntry);
      found = { logEntry, gradingResult };
    } catch (e) {
      // Entry not found - skip
    }
    return { found };
  }

  get found() {
    return !!this.data.found;
  }

  private get gradingResult() {
    return this.data.found?.gradingResult;
  }

  get correct() {
    const { gradingResult } = this;
    if (!gradingResult) return false;
    return gradingResult.actual === gradingResult.expected;
  }

  get promptTokens() {
    return this.data.found?.logEntry.result.usage.promptTokens || 0;
  }

  get completionTokens() {
    return this.data.found?.logEntry.result.usage.completionTokens || 0;
  }

  get modelDisplayName() {
    return modelDisplayName(this.presetId);
  }
}

export const reporting = new Reporting();

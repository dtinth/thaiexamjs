import type { EvaluationResult } from "./evaluateQuestion";

export interface Report {
  questions: {
    questionKey: string;
    question: any;
    answers: Record<
      string,
      {
        id: string;
        expected: string;
        actual?: string;
        correct: boolean;
        result: EvaluationResult;
      }
    >;
  }[];
  modelNames: string[];
}

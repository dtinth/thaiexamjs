import { generateText, type CoreMessage, type LanguageModelUsage } from "ai";
import { modelPresets } from "./modelPresets";

export async function evaluateQuestion(
  modelPresetId: string,
  question: any
): Promise<EvaluationResult> {
  const preset = modelPresets[modelPresetId];
  const model = preset.createModel(modelPresetId);
  const providerOptions = preset.providerOptions;
  const inputMessages: CoreMessage[] = [];
  inputMessages.push(
    {
      role: "user",
      content:
        'Given a multiple choice question in JSON format, respond in JSON with the "correct_answer_key".\n\n' +
        '```json\n{"question":"What is 1+1?","a":"1","b":"2","c":"3","d":"4"}\n```',
    },
    {
      role: "assistant",
      content:
        'The correct answer to "What is 1+1?" is 2, which corresponds to option B.\n\n' +
        '```json\n{"correct_answer_key":"b"}\n```',
    }
  );
  inputMessages.push({
    role: "user",
    content: JSON.stringify(
      Object.fromEntries(
        Object.entries(question).filter(
          ([key]) => key === "question" || key.length === 1
        )
      )
    ),
  });
  let temperature = 0;
  const startTime = performance.now();
  const result = await generateText({
    model,
    temperature,
    messages: inputMessages,
    providerOptions,
  });
  const endTime = performance.now();
  return {
    inputMessages,
    temperature,
    finishReason: result.finishReason,
    providerMetadata: result.providerMetadata,
    reasoning: result.reasoning,
    reasoningDetails: result.reasoningDetails,
    sources: result.sources,
    text: result.text,
    time: endTime - startTime,
    usage: result.usage,
    warnings: result.warnings,
  };
}

export interface EvaluationResult {
  inputMessages: CoreMessage[];
  providerOptions?: any;
  temperature?: number /* If not provided, default to 0 */;
  finishReason: string;
  providerMetadata: any;
  reasoning: any;
  reasoningDetails: any;
  sources: any;
  text: string;
  time: number;
  usage: LanguageModelUsage;
  warnings: any;
}

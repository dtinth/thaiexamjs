import {
  generateText,
  streamText,
  type CoreMessage,
  type LanguageModelUsage,
} from "ai";
import { modelPresets } from "./modelPresets";

export async function evaluateQuestion(
  modelPresetId: string,
  question: any,
  promptVersion: 1 | 2 = 1
): Promise<EvaluationResult> {
  const preset = modelPresets[modelPresetId];
  const model = preset.createModel(modelPresetId);
  const providerOptions = preset.providerOptions;
  const inputMessages: CoreMessage[] = [];
  if (promptVersion === 2) {
    inputMessages.push(
      {
        role: "user",
        content:
          'Given a multiple choice question in JSON format, provide a brief explanation, then respond in JSON with the "correct_answer_key".\n\n' +
          '```json\n{"question":"If John has 5 apples and gives 2 to his friend, then buys 3 more from the store, how many apples does John have now?","a":"3","b":"5","c":"6","d":"7","e":"8"}\n```',
      },
      {
        role: "assistant",
        content:
          "John starts with 5 apples, gives away 2, leaving him with 3. Then he buys 3 more apples, totaling 3+3=6. Thus, John has 6 apples now, which corresponds to option C.\n\n" +
          '```json\n{"correct_answer_key":"c"}\n```',
      }
    );
  } else {
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
  }
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
  let temperature = +process.env["TEMPERATURE"]! || 0;
  const startTime = performance.now();

  type GenerateOptions = Parameters<typeof streamText>[0] &
    Parameters<typeof generateText>[0];
  const options: GenerateOptions = {
    model,
    temperature,
    messages: inputMessages,
    providerOptions,
    // Typhoon API defaults to 128 tokens, but we need more for some models
    ...(modelPresetId.includes("typhoon-v1")
      ? { maxTokens: 4096 }
      : modelPresetId.includes("typhoon")
      ? { maxTokens: 7168 }
      : modelPresetId.includes("QwQ")
      ? { maxTokens: 7168 }
      : modelPresetId.includes("deepseek-r1")
      ? { maxTokens: 30000 }
      : {}),
  };

  const result = await (async () => {
    if (process.env["USE_STREAMING_API"]) {
      const stream = streamText(options);
      for await (const textPart of stream.textStream) {
        if (process.env["SHOW_MODEL_OUTPUT"]) {
          process.stdout.write(textPart);
        }
      }
      return {
        finishReason: await stream.finishReason,
        providerMetadata: await stream.providerMetadata,
        reasoning: await stream.reasoning,
        reasoningDetails: await stream.reasoningDetails,
        sources: await stream.sources,
        text: await stream.text,
        usage: await stream.usage,
        warnings: await stream.warnings,
      };
    } else {
      return generateText(options);
    }
  })();

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

import { anthropic } from "@ai-sdk/anthropic";
import { deepseek } from "@ai-sdk/deepseek";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAzure } from "@quail-ai/azure-ai-provider";
import type { LanguageModelV1 } from "ai";

const azureAiFoundry = createAzure({
  apiKey: process.env["AZURE_API_KEY"],
  endpoint: process.env["AZURE_API_ENDPOINT"]!,
});

const groq = createOpenAICompatible({
  name: "groq",
  apiKey: process.env["GROQ_API_KEY"],
  baseURL: "https://api.groq.com/openai/v1",
});

export const modelPresets: Record<string, ModelPreset> = {
  "gpt-4o-mini-2024-07-18": {
    createModel: (id) => openai(id),
    cost: [0.15, 0.6],
  },
  "gpt-4o-2024-08-06": {
    createModel: (id) => openai(id),
    cost: [2.5, 10],
  },
  "o1-mini-2024-09-12": {
    createModel: (id) => openai(id),
    cost: [1.1, 4.4],
  },
  "deepseek-chat": {
    createModel: (id) => deepseek(id),
    cost: [0.27, 1.1],
  },
  "deepseek-reasoner": {
    createModel: (id) => deepseek(id),
    cost: [0.55, 2.19],
  },
  "gemini-1.5-flash-002": {
    createModel: (id) => google(id),
    cost: [0.075, 0.3],
  },
  "gemini-1.5-flash-8b-001": {
    createModel: (id) => google(id),
    cost: [0.0375, 0.075],
  },
  "gemini-1.5-pro-002": {
    createModel: (id) => google(id),
    cost: [1.25, 5],
  },
  "gemini-2.0-flash-001": {
    createModel: (id) => google(id),
    cost: [0.1, 0.4],
  },
  "gemini-2.0-flash-thinking-exp-01-21": {
    createModel: (id) => google(id),
    cost: [0, 0],
  },
  "gemini-2.0-pro-exp-02-05": {
    createModel: (id) => google(id),
    cost: [0, 0],
  },
  "claude-3-5-sonnet-20240620": {
    createModel: (id) => anthropic(id),
    cost: [3, 15],
  },
  "claude-3-5-sonnet-20241022": {
    createModel: (id) => anthropic(id),
    cost: [3, 15],
  },
  "claude-3-7-sonnet-20250219": {
    createModel: (id) => anthropic(id),
    cost: [3, 15],
  },
  "claude-3-7-sonnet-20250219[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    cost: [3, 15],
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
  },
  "claude-3-5-haiku-20241022": {
    createModel: (id) => anthropic(id),
    cost: [0.8, 4],
  },
  "deepseek-r1-distill-qwen-32b": {
    createModel: (id) => groq(id),
    cost: [0.69, 0.69],
  },
  "deepseek-r1-distill-llama-70b": {
    createModel: (id) => groq(id),
    cost: [0.99, 0.99],
  },
  "DeepSeek-R1": {
    createModel: (id) => azureAiFoundry(id),
    cost: [0.55, 2.19],
  },
  "Phi-4": {
    createModel: (id) => azureAiFoundry(id),
    cost: [0, 0],
  },
};

export interface ModelPreset {
  createModel: (id: string) => LanguageModelV1;
  cost: [prompt: number, completion: number];
  providerOptions?: Record<string, any>;
}

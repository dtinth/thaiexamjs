import { anthropic } from "@ai-sdk/anthropic";
import { createAzure as createAzureOpenai } from "@ai-sdk/azure";
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

const opentyphoon = createOpenAICompatible({
  name: "opentyphoon",
  apiKey: process.env["OPENTYPHOON_API_KEY"],
  baseURL: "https://api.opentyphoon.ai/v1",
});

const together = createOpenAICompatible({
  name: "together",
  apiKey: process.env["TOGETHER_API_KEY"],
  baseURL: "https://api.together.xyz/v1",
});

const azureOpenai = createAzureOpenai({
  apiVersion: "2024-12-01-preview",
});

export const modelPresets: Record<string, ModelPreset> = {
  // Anthropic Claude models
  "claude-3-opus-20240229": {
    createModel: (id) => anthropic(id),
    cost: [15, 75],
  },
  "claude-3-5-haiku-20241022": {
    createModel: (id) => anthropic(id),
    cost: [0.8, 4],
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

  // DeepSeek models
  // The APIs is quite unstable, so we’re using Azure AI Foundry and Groq instead
  // "deepseek-reasoner": {
  //   createModel: (id) => deepseek(id),
  //   cost: [0.55, 2.19],
  // },
  "DeepSeek-R1": {
    // createModel: (id) => azureAiFoundry(id),
    // cost: [0.55, 2.19],
    createModel: (id) => together("deepseek-ai/" + id),
    cost: [3, 7],
    displayName: "deepseek-r1-671b",
  },
  "deepseek-r1-distill-llama-70b": {
    createModel: (id) => groq(id),
    cost: [0.99, 0.99],
  },
  "deepseek-r1-distill-qwen-32b": {
    createModel: (id) => groq(id),
    cost: [0.69, 0.69],
  },

  // Google Gemini models
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

  // Google Gemma models
  "gemma-2-27b-it": {
    createModel: (id) => together(`google/${id}`),
    cost: [0.8, 0.8],
  },
  "gemma-3-27b-it": {
    createModel: (id) => google(id),
    cost: [0, 0],
  },

  // OpenAI GPT-4o models
  "gpt-4o-2024-08-06": {
    createModel: (id) => openai(id),
    cost: [2.5, 10],
  },
  "gpt-4o-mini-2024-07-18": {
    createModel: (id) => openai(id),
    cost: [0.15, 0.6],
  },
  "gpt-4.5-preview-2025-02-27": {
    createModel: (id) => openai(id),
    cost: [75, 150],
  },

  // OpenAI O1 models
  "o1-mini-2024-09-12": {
    createModel: (id) => openai(id),
    cost: [1.1, 4.4],
  },
  "o1-preview-2024-09-12": {
    createModel: (id) => openai(id),
    cost: [15, 60],
  },
  "o3-mini-2025-01-31": {
    createModel: (_id) => azureOpenai("o3-mini"),
    cost: [1.1, 4.4],
  },
  "o1-2024-12-17": {
    createModel: (_id) => azureOpenai("o1"),
    cost: [15, 60],
  },

  // Microsoft's Phi model
  "Phi-4": {
    createModel: (id) => azureAiFoundry(id),
    cost: [0, 0],
  },

  // Qwen models
  "QwQ-32B": {
    // createModel: (id) => opentyphoon(id),
    createModel: (_id) => together("Qwen/QwQ-32B"),
    cost: [1.2, 1.2],
  },

  // SCB 10X's Typhoon models
  "typhoon-v1.5x-70b-instruct": {
    createModel: (id) => opentyphoon(id),
    cost: [0.9, 0.9], // Based on https://www.together.ai/pricings
  },
  "typhoon-v2-70b-instruct": {
    // createModel: (id) => opentyphoon(id),
    createModel: (_id) => together("scb10x/scb10x-llama3-1-typhoon2-60256"),
    cost: [0.9, 0.9], // Based on https://www.together.ai/pricing
  },
  "typhoon-v2-8b-instruct": {
    createModel: (id) => opentyphoon(id),
    cost: [0.2, 0.2], // Based on https://www.together.ai/pricing
  },
  "typhoon-v2-r1-70b-preview": {
    createModel: (id) => opentyphoon(id),
    cost: [0.9, 0.9], // Based on https://www.together.ai/pricing
  },
};

export interface ModelPreset {
  createModel: (id: string) => LanguageModelV1;
  cost: [prompt: number, completion: number];
  providerOptions?: Record<string, any>;
  displayName?: string;
}

import { anthropic } from "@ai-sdk/anthropic";
import { google, type GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { generateText, LanguageModelV1 } from "ai";

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

const openRouter = createOpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"],
});

export const modelPresets: Record<string, ModelPreset> = {
  // Claude models
  "claude-3-5-sonnet-20241022": {
    createModel: (id) => anthropic(id),
    cost: [3, 15],
    icon: "ri:claude-fill",
  },
  "claude-3-7-sonnet-20250219": {
    createModel: (id) => anthropic(id),
    cost: [3, 15],
    icon: "ri:claude-fill",
  },
  "claude-3-7-sonnet-20250219[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    cost: [3, 15],
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
    icon: "ri:claude-fill",
  },
  "claude-sonnet-4-20250514": {
    createModel: (id) => anthropic(id),
    cost: [3, 15],
    icon: "ri:claude-fill",
  },
  "claude-sonnet-4-20250514[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    cost: [3, 15],
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
    icon: "ri:claude-fill",
  },
  "claude-opus-4-20250514": {
    createModel: (id) => anthropic(id),
    cost: [15, 75],
    icon: "ri:claude-fill",
  },
  "claude-opus-4-20250514[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    cost: [15, 75],
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
    icon: "ri:claude-fill",
  },
  "claude-opus-4-1-20250805": {
    createModel: (id) => anthropic(id),
    cost: [15, 75],
    icon: "ri:claude-fill",
  },
  "claude-opus-4-1-20250805[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    cost: [15, 75],
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
    icon: "ri:claude-fill",
  },

  // Cohere models
  "command-a-03-2025": {
    createModel: (_id) => openRouter("cohere/command-a"),
    cost: [2.5, 10],
  },

  // DeepSeek Models
  "deepseek-chat-v3-0324": {
    createModel: (_id) => together("deepseek-ai/DeepSeek-V3"),
    cost: [1.5, 1.5],
    icon: "arcticons:deepseek",
  },
  // "deepseek-r1": {
  //   createModel: (_id) => together("deepseek-ai/DeepSeek-R1"),
  //   cost: [3, 7],
  //   icon: "arcticons:deepseek",
  // },
  "deepseek-r1-0528": {
    createModel: (id) => openRouter(`deepseek/${id}`),
    cost: [0.5, 2.15],
    icon: "arcticons:deepseek",
  },
  "deepseek-chat-v3.1": {
    createModel: (_id) =>
      openRouter("deepseek/deepseek-chat-v3.1", {
        extraBody: { reasoning: { enabled: false } },
      }),
    cost: [0.3, 1],
    icon: "arcticons:deepseek",
  },
  "deepseek-reasoner-v3.1": {
    createModel: (_id) =>
      openRouter("deepseek/deepseek-chat-v3.1", {
        extraBody: { reasoning: { enabled: true } },
      }),
    cost: [0.3, 1],
    icon: "arcticons:deepseek",
  },

  // Google Gemini models
  "gemini-1.5-pro-002": {
    createModel: (id) => google(id),
    cost: [1.25, 5],
    icon: "ri:gemini-fill",
  },
  "gemini-2.0-flash-001": {
    createModel: (id) => google(id),
    cost: [0.1, 0.4],
    icon: "ri:gemini-fill",
  },
  "gemini-2.0-flash-lite-001": {
    createModel: (id) => google(id),
    cost: [0.1, 0.4],
    icon: "ri:gemini-fill",
  },
  // "gemini-2.0-flash-thinking-exp-01-21": {
  //   createModel: (id) => google(id),
  //   cost: [0, 0],
  //   icon: "ri:gemini-fill",
  // },
  // "gemini-2.5-flash-preview-04-17": {
  //   createModel: (id) => google(id),
  //   cost: [0.15, 3.5],
  //   icon: "ri:gemini-fill",
  // },
  // "gemini-2.5-pro-preview-03-25": {
  //   createModel: (id) => google(id),
  //   cost: [1.25, 10],
  //   icon: "ri:gemini-fill",
  // },
  // "gemini-2.5-pro-preview-05-06": {
  //   createModel: (id) => google(id),
  //   cost: [1.25, 10],
  //   icon: "ri:gemini-fill",
  // },
  "gemini-2.5-pro": {
    createModel: (id) => google(id),
    cost: [1.25, 10],
    icon: "ri:gemini-fill",
  },
  // "gemini-2.5-flash-preview-04-17[no-thinking]": {
  //   createModel: (id) => google(id.replace(/\[.+$/, "")),
  //   cost: [0.15, 0.6],
  //   icon: "ri:gemini-fill",
  //   providerOptions: {
  //     google: {
  //       thinkingConfig: { thinkingBudget: 0 },
  //     } satisfies GoogleGenerativeAIProviderOptions,
  //   },
  // },
  // "gemini-2.5-flash-preview-05-20": {
  //   createModel: (id) => google(id),
  //   cost: [0.15, 3.5],
  //   icon: "ri:gemini-fill",
  // },
  // "gemini-2.5-flash-preview-05-20[no-thinking]": {
  //   createModel: (id) => google(id.replace(/\[.+$/, "")),
  //   cost: [0.15, 0.6],
  //   icon: "ri:gemini-fill",
  //   providerOptions: {
  //     google: {
  //       thinkingConfig: { thinkingBudget: 0 },
  //     } satisfies GoogleGenerativeAIProviderOptions,
  //   },
  // },
  "gemini-2.5-flash": {
    createModel: (id) => google(id),
    cost: [0.15, 3.5],
    icon: "ri:gemini-fill",
  },
  "gemini-2.5-flash[no-thinking]": {
    createModel: (id) => google(id.replace(/\[.+$/, "")),
    cost: [0.15, 0.6],
    icon: "ri:gemini-fill",
    providerOptions: {
      google: {
        thinkingConfig: { thinkingBudget: 0 },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  },

  // Google’s Gemma models
  "gemma-3-27b-it": {
    createModel: (_id) => openRouter("google/gemma-3-27b-it"),
    cost: [0.1, 0.2],
    icon: "ri:gemini-line",
  },

  // OpenAI GPT models
  "gpt-4.1-2025-04-14": {
    createModel: (id) => openai(id),
    cost: [2, 8],
    icon: "ri:openai-fill",
  },
  "gpt-4.1-mini-2025-04-14": {
    createModel: (id) => openai(id),
    cost: [0.4, 1.6],
    icon: "ri:openai-fill",
  },
  "gpt-4.1-nano-2025-04-14": {
    createModel: (id) => openai(id),
    cost: [0.1, 0.4],
    icon: "ri:openai-fill",
  },
  "gpt-4.5-preview-2025-02-27": {
    createModel: (id) => openai(id),
    cost: [75, 150],
    icon: "ri:openai-fill",
  },
  "gpt-4o-2024-08-06": {
    createModel: (id) => openai(id),
    cost: [2.5, 10],
    icon: "ri:openai-fill",
  },
  "gpt-4o-mini-2024-07-18": {
    createModel: (id) => openai(id),
    cost: [0.15, 0.6],
    icon: "ri:openai-fill",
  },
  "gpt-5-2025-08-07": {
    createModel: (id) => openai(id),
    cost: [1.25, 10],
    icon: "ri:openai-fill",
  },
  "gpt-5-mini-2025-08-07": {
    createModel: (id) => openai(id),
    cost: [0.25, 2],
    icon: "ri:openai-fill",
  },
  "gpt-5-nano-2025-08-07": {
    createModel: (id) => openai(id),
    cost: [0.05, 0.4],
    icon: "ri:openai-fill",
  },
  "gpt-oss-120b": {
    createModel: (_id) => openRouter("openai/gpt-oss-120b"),
    cost: [0.09, 0.45],
    icon: "ri:openai-fill",
  },
  "gpt-oss-20b": {
    createModel: (_id) => openRouter("openai/gpt-oss-20b"),
    cost: [0.04, 0.16],
    icon: "ri:openai-fill",
  },

  // xAI Grok models
  "grok-3-beta": {
    createModel: (id) => xai(id),
    cost: [3, 15],
    icon: "ri:twitter-x-line",
  },
  "grok-3-mini-beta": {
    createModel: (id) => xai(id),
    cost: [0.3, 0.5],
    icon: "ri:twitter-x-line",
    displayName: "grok-3-mini-beta[thinking]",
  },
  "grok-3": {
    createModel: (id) => xai(id),
    cost: [3, 15],
    icon: "ri:twitter-x-line",
  },
  "grok-3-mini": {
    createModel: (id) => xai(id),
    cost: [0.3, 0.5],
    icon: "ri:twitter-x-line",
    displayName: "grok-3-mini-beta[thinking]",
  },
  "grok-4": {
    createModel: () => openRouter("x-ai/grok-4"),
    cost: [3, 15],
    icon: "ri:twitter-x-line",
  },

  // Meta Llama
  "llama-4-maverick": {
    createModel: (_id) => openRouter("meta-llama/llama-4-maverick"),
    cost: [0.18, 0.6],
    icon: "ri:meta-fill",
  },
  "llama-4-scout": {
    createModel: (_id) => openRouter("meta-llama/llama-4-scout"),
    cost: [0.18, 0.6],
    icon: "ri:meta-fill",
  },
  "llama-3.3-70b-instruct": {
    createModel: (_id) => openRouter("meta-llama/llama-3.3-70b-instruct"),
    cost: [0.1, 0.25],
    icon: "ri:meta-fill",
  },

  // Mistral AI
  "mistral-large-2411": {
    createModel: (_id) => openRouter("mistralai/mistral-large-2411"),
    cost: [2, 6],
  },

  // Moonshot AI
  "kimi-k2": {
    createModel: () => openRouter("moonshotai/kimi-k2"),
    cost: [0.55, 2.2],
    icon: "ri:twitter-x-line",
  },

  // Amazon Nova models
  "nova-pro-v1": {
    createModel: (id) => openRouter(`amazon/${id}`),
    cost: [0.8, 3.2],
    icon: "ri:amazon-fill",
  },
  "nova-lite-v1": {
    createModel: (id) => openRouter(`amazon/${id}`),
    cost: [0.06, 0.24],
    icon: "ri:amazon-fill",
  },
  "nova-micro-v1": {
    createModel: (id) => openRouter(`amazon/${id}`),
    cost: [0.035, 0.14],
    icon: "ri:amazon-fill",
  },

  // OpenAI O models
  "o1-2024-12-17": {
    createModel: (_id) => openRouter("openai/o1"),
    cost: [15, 60],
    icon: "ri:openai-fill",
  },
  "o3-2025-04-16[high]": {
    createModel: (id) => openai(id.replace(/\[.+$/, "")),
    cost: [10, 40],
    providerOptions: { openai: { reasoningEffort: "high" } },
    icon: "ri:openai-fill",
  },
  "o3-2025-04-16[medium]": {
    createModel: (id) => openai(id.replace(/\[.+$/, "")),
    cost: [10, 40],
    providerOptions: { openai: { reasoningEffort: "medium" } },
    icon: "ri:openai-fill",
  },
  "o3-2025-04-16[low]": {
    createModel: (id) => openai(id.replace(/\[.+$/, "")),
    cost: [10, 40],
    providerOptions: { openai: { reasoningEffort: "low" } },
    icon: "ri:openai-fill",
  },
  "o3-mini-2025-01-31[low]": {
    createModel: (_id) => openRouter("openai/o3-mini"),
    cost: [1.1, 4.4],
    providerOptions: { openai: { reasoningEffort: "low" } },
    icon: "ri:openai-fill",
  },
  "o3-mini-2025-01-31[medium]": {
    createModel: (_id) => openRouter("openai/o3-mini"),
    cost: [1.1, 4.4],
    providerOptions: { openai: { reasoningEffort: "medium" } },
    icon: "ri:openai-fill",
  },
  "o3-mini-2025-01-31[high]": {
    createModel: (_id) => openRouter("openai/o3-mini-high"),
    cost: [1.1, 4.4],
    providerOptions: { openai: { reasoningEffort: "high" } },
    icon: "ri:openai-fill",
  },
  "o4-mini-2025-04-16[low]": {
    createModel: (_id) => openRouter("openai/o4-mini"),
    cost: [1.1, 4.4],
    providerOptions: { openai: { reasoningEffort: "low" } },
    icon: "ri:openai-fill",
  },
  "o4-mini-2025-04-16[medium]": {
    createModel: (_id) => openRouter("openai/o4-mini"),
    cost: [1.1, 4.4],
    providerOptions: { openai: { reasoningEffort: "medium" } },
    icon: "ri:openai-fill",
  },
  "o4-mini-2025-04-16[high]": {
    createModel: (_id) => openRouter("openai/o4-mini-high"),
    cost: [1.1, 4.4],
    providerOptions: { openai: { reasoningEffort: "high" } },
    icon: "ri:openai-fill",
  },

  // Microsoft's Phi model
  "phi-4": {
    createModel: (_id) => openRouter("microsoft/phi-4"),
    cost: [0.07, 0.14],
    icon: "ri:microsoft-fill",
  },
  // "phi-4-reasoning": {
  //   createModel: (_id) => openRouter("microsoft/phi-4-reasoning:free"),
  //   cost: [0, 0],
  //   icon: "ri:microsoft-fill",
  // },
  "phi-4-reasoning-plus": {
    createModel: (_id) => openRouter("microsoft/phi-4-reasoning-plus"),
    cost: [0.07, 0.35],
    icon: "ri:microsoft-fill",
  },

  // Alibaba's Qwen models
  "qwen-max-2025-01-25": {
    createModel: (_id) => openRouter("qwen/qwen-max"),
    cost: [1.6, 6.4],
    icon: "ri:alibaba-cloud-fill",
  },
  "qwq-32b": {
    // createModel: (id) => opentyphoon(id),
    createModel: (_id) => together("Qwen/QwQ-32B"),
    cost: [1.2, 1.2],
    icon: "ri:alibaba-cloud-fill",
  },
  "qwen3-30b-a3b": {
    createModel: (id) => openRouter(`qwen/${id}`),
    cost: [0.1, 0.3],
    icon: "ri:alibaba-cloud-fill",
  },
  "qwen3-32b": {
    createModel: (id) => openRouter(`qwen/${id}`),
    cost: [0.1, 0.3],
    icon: "ri:alibaba-cloud-fill",
  },
  "qwen3-235b-a22b": {
    createModel: (id) => openRouter(`qwen/${id}`),
    cost: [0.2, 0.6],
    icon: "ri:alibaba-cloud-fill",
  },

  // SCB 10X's Typhoon models
  "typhoon-v2-70b-instruct": {
    // createModel: (id) => opentyphoon(id),
    createModel: (_id) =>
      together("scb10x/scb10x-llama3-1-typhoon2-70b-instruct"),
    cost: [0.9, 0.9], // Based on https://www.together.ai/pricing
  },
  "typhoon-v2-r1-70b-preview": {
    createModel: (id) => opentyphoon(id),
    cost: [0.9, 0.9], // Based on https://www.together.ai/pricing
  },
  "typhoon-v2.1-12b-instruct": {
    createModel: (_id) => together("scb10x/scb10x-typhoon-2-1-gemma3-12b"),
    cost: [0.2, 0.2],
  },

  // Z.AI models
  "glm-4.5": {
    createModel: (_id) => openRouter("z-ai/glm-4.5"),
    cost: [0.55, 2],
  },
  "glm-4.5-air": {
    createModel: (_id) => openRouter("z-ai/glm-4.5-air"),
    cost: [0.2, 1.1],
  },
};

export interface ModelPreset {
  createModel: (id: string) => LanguageModelV1;
  cost: [prompt: number, completion: number];
  providerOptions?: ProviderOptions;
  displayName?: string;
  icon?: string;
}

type ProviderOptions = Parameters<typeof generateText>[0]["providerOptions"];

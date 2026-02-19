import { anthropic } from "@ai-sdk/anthropic";
import { google, type GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { generateText, LanguageModelV1 } from "ai";
import modelPresetsBaseJson from "./modelPresetsBase.json";

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

const modelPresetOverrides: Record<string, ModelPresetOverride> = {
  // Claude models
  "claude-3-5-sonnet-20241022": {
    createModel: (id) => anthropic(id),
  },
  "claude-3-7-sonnet-20250219": {
    createModel: (id) => anthropic(id),
  },
  "claude-3-7-sonnet-20250219[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
  },
  "claude-sonnet-4-20250514": {
    createModel: (id) => anthropic(id),
  },
  "claude-sonnet-4-20250514[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
  },
  "claude-opus-4-20250514": {
    createModel: (id) => anthropic(id),
  },
  "claude-opus-4-20250514[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
  },
  "claude-opus-4-1-20250805": {
    createModel: (id) => anthropic(id),
  },
  "claude-opus-4-1-20250805[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 12000 },
      },
    },
  },
  "claude-sonnet-4-5-20250929": {
    createModel: (id) => anthropic(id),
  },
  "claude-sonnet-4-5-20250929[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 16000 },
      },
    },
  },
  "claude-haiku-4-5-20251001": {
    createModel: (id) => anthropic(id),
  },
  "claude-haiku-4-5-20251001[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 16000 },
      },
    },
  },
  "claude-opus-4-5-20251101": {
    createModel: (id) => anthropic(id),
  },
  "claude-opus-4-5-20251101[thinking=16k]": {
    createModel: (id) => anthropic(id.replace(/\[.+$/, "")),
    providerOptions: {
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 16000 },
      },
    },
  },

  // DeepSeek Models
  // "deepseek-r1": {
  //   createModel: (_id) => together("deepseek-ai/DeepSeek-R1"),
  // },
  "deepseek-chat-v3-0324": {
    createModel: (_id) => together("deepseek-ai/DeepSeek-V3"),
  },

  // Google Gemini models
  "gemini-1.5-pro-002": {
    createModel: (id) => google(id),
  },
  "gemini-2.0-flash-001": {
    createModel: (id) => google(id),
  },
  "gemini-2.0-flash-lite-001": {
    createModel: (id) => google(id),
  },
  "gemini-2.5-pro": {
    createModel: (id) => google(id),
  },
  "gemini-2.5-flash": {
    createModel: (id) => google(id),
  },
  "gemini-2.5-flash[no-thinking]": {
    createModel: (id) => google(id.replace(/\[.+$/, "")),
    providerOptions: {
      google: {
        thinkingConfig: { thinkingBudget: 0 },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
  },
  "gemini-3-pro-preview": {
    createModel: (id) => google(id),
  },

  // OpenAI GPT models
  "gpt-4.1-2025-04-14": {
    createModel: (id) => openai(id),
  },
  "gpt-4.1-mini-2025-04-14": {
    createModel: (id) => openai(id),
  },
  "gpt-4.1-nano-2025-04-14": {
    createModel: (id) => openai(id),
  },
  "gpt-4.5-preview-2025-02-27": {
    createModel: (id) => openai(id),
  },
  "gpt-4o-2024-08-06": {
    createModel: (id) => openai(id),
  },
  "gpt-4o-mini-2024-07-18": {
    createModel: (id) => openai(id),
  },
  "gpt-5-2025-08-07": {
    createModel: (id) => openai(id),
  },
  "gpt-5.1-2025-11-13": {
    createModel: (id) => openai(id),
  },
  "gpt-5-mini-2025-08-07": {
    createModel: (id) => openai(id),
  },
  "gpt-5-nano-2025-08-07": {
    createModel: (id) => openai(id),
  },

  // xAI Grok models
  "grok-3-beta": {
    createModel: (id) => xai(id),
  },
  "grok-3-mini-beta": {
    createModel: (id) => xai(id),
    displayName: "grok-3-mini-beta[thinking]",
  },
  "grok-3": {
    createModel: (id) => xai(id),
  },
  "grok-3-mini": {
    createModel: (id) => xai(id),
    displayName: "grok-3-mini-beta[thinking]",
  },

  // OpenAI O models
  "o3-2025-04-16[high]": {
    createModel: (id) => openai(id.replace(/\[.+$/, "")),
    providerOptions: { openai: { reasoningEffort: "high" } },
  },
  "o3-2025-04-16[medium]": {
    createModel: (id) => openai(id.replace(/\[.+$/, "")),
    providerOptions: { openai: { reasoningEffort: "medium" } },
  },
  "o3-2025-04-16[low]": {
    createModel: (id) => openai(id.replace(/\[.+$/, "")),
    providerOptions: { openai: { reasoningEffort: "low" } },
  },
  "o3-mini-2025-01-31[low]": {
    createModel: (_id) => openRouter("openai/o3-mini"),
    providerOptions: { openai: { reasoningEffort: "low" } },
  },
  "o3-mini-2025-01-31[medium]": {
    createModel: (_id) => openRouter("openai/o3-mini"),
    providerOptions: { openai: { reasoningEffort: "medium" } },
  },
  "o3-mini-2025-01-31[high]": {
    createModel: (_id) => openRouter("openai/o3-mini-high"),
    providerOptions: { openai: { reasoningEffort: "high" } },
  },
  "o4-mini-2025-04-16[low]": {
    createModel: (_id) => openRouter("openai/o4-mini"),
    providerOptions: { openai: { reasoningEffort: "low" } },
  },
  "o4-mini-2025-04-16[medium]": {
    createModel: (_id) => openRouter("openai/o4-mini"),
    providerOptions: { openai: { reasoningEffort: "medium" } },
  },
  "o4-mini-2025-04-16[high]": {
    createModel: (_id) => openRouter("openai/o4-mini-high"),
    providerOptions: { openai: { reasoningEffort: "high" } },
  },

  // Alibaba's Qwen models
  "qwq-32b": {
    // createModel: (id) => opentyphoon(id),
    createModel: (_id) => together("Qwen/QwQ-32B"),
  },

  // SCB 10X's Typhoon models
  "typhoon-v2-70b-instruct": {
    // createModel: (id) => opentyphoon(id),
    createModel: (_id) =>
      together("scb10x/scb10x-llama3-1-typhoon2-70b-instruct"),
  },
  "typhoon-v2-r1-70b-preview": {
    createModel: (id) => opentyphoon(id),
  },
  "typhoon-v2.1-12b-instruct": {
    createModel: (_id) => together("scb10x/scb10x-typhoon-2-1-gemma3-12b"),
  },
};

export const modelPresets: Record<string, ModelPreset> = {};
export const legacyModelPresetIds = new Set<string>();

for (const base of modelPresetsBaseJson) {
  const override = modelPresetOverrides[base.id] ?? {};

  const baseCreateModel: (id: string) => LanguageModelV1 =
    base.model === "legacy"
      ? (_id) => {
          throw new Error(`Model "${base.id}" requires a createModel override`);
        }
      : (_id) =>
          openRouter(
            base.model,
            base.params
              ? { extraBody: base.params as Record<string, unknown> }
              : undefined,
          );
  if (base.model === 'legacy') {
    legacyModelPresetIds.add(base.id);
  }

  modelPresets[base.id] = {
    createModel: override.createModel ?? baseCreateModel,
    cost: [base.inputPrice, base.outputPrice],
    icon: base.icon || undefined,
    old: base.old,
    ...(override.providerOptions !== undefined && {
      providerOptions: override.providerOptions,
    }),
    ...(override.displayName !== undefined && {
      displayName: override.displayName,
    }),
  };
}

export interface ModelPresetBase {
  createModel: (id: string) => LanguageModelV1;
  cost: [prompt: number, completion: number];
  providerOptions?: ProviderOptions;
  icon?: string;
  displayName?: string;
  old?: boolean;
}

export interface ModelPresetOverride {
  createModel?: (id: string) => LanguageModelV1;
  providerOptions?: ProviderOptions;
  displayName?: string;
}

export type ModelPreset = ModelPresetBase;

type ProviderOptions = Parameters<typeof generateText>[0]["providerOptions"];

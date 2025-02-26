import type { LogEntry } from "./LogEntry";
import { logStorage } from "./logStorage";

const skus: Record<string, number> = {};

const costMap: Record<string, number> = {
  "openai.chat/gpt-4o-mini-2024-07-18:promptTokens": 0.15,
  "openai.chat/gpt-4o-mini-2024-07-18:completionTokens": 0.6,
  "openai.chat/gpt-4o-2024-08-06:promptTokens": 2.5,
  "openai.chat/gpt-4o-2024-08-06:completionTokens": 10,
  "openai.chat/o1-mini-2024-09-12:promptTokens": 1.1,
  "openai.chat/o1-mini-2024-09-12:completionTokens": 4.4,
  "deepseek.chat/deepseek-chat:promptTokens": 0.27,
  "deepseek.chat/deepseek-chat:completionTokens": 1.1,
  "deepseek.chat/deepseek-reasoner:promptTokens": 0.55,
  "deepseek.chat/deepseek-reasoner:completionTokens": 2.19,
  "google.generative-ai/gemini-1.5-flash-002:promptTokens": 0.075,
  "google.generative-ai/gemini-1.5-flash-002:completionTokens": 0.3,
  "google.generative-ai/gemini-1.5-flash-8b-001:promptTokens": 0.0375,
  "google.generative-ai/gemini-1.5-flash-8b-001:completionTokens": 0.075,
  "google.generative-ai/gemini-1.5-pro-002:promptTokens": 1.25,
  "google.generative-ai/gemini-1.5-pro-002:completionTokens": 5,
  "google.generative-ai/gemini-1.5-pro-001:promptTokens": 1.25,
  "google.generative-ai/gemini-1.5-pro-001:completionTokens": 5,
  "google.generative-ai/gemini-2.0-flash-001:promptTokens": 0.1,
  "google.generative-ai/gemini-2.0-flash-001:completionTokens": 0.4,
  "anthropic.messages/claude-3-5-sonnet-20240620:promptTokens": 3,
  "anthropic.messages/claude-3-5-sonnet-20240620:completionTokens": 15,
  "anthropic.messages/claude-3-5-sonnet-20241022:promptTokens": 3,
  "anthropic.messages/claude-3-5-sonnet-20241022:completionTokens": 15,
  "anthropic.messages/claude-3-7-sonnet-20250219:promptTokens": 3,
  "anthropic.messages/claude-3-7-sonnet-20250219:completionTokens": 15,
  "anthropic.messages/claude-3-5-haiku-20241022:promptTokens": 0.8,
  "anthropic.messages/claude-3-5-haiku-20241022:completionTokens": 4,
};

function increaseSku(id: string, value: number) {
  skus[id] = (skus[id] || 0) + value;
}

for (const [k, v] of logStorage as any) {
  const logEntry: LogEntry = JSON.parse(v);
  const prefix = logEntry.provider + "/" + logEntry.modelId;
  increaseSku(`${prefix}:promptTokens`, logEntry.result.usage.promptTokens);
  increaseSku(
    `${prefix}:completionTokens`,
    logEntry.result.usage.completionTokens
  );
}

const out = [];
let total = 0;
for (const [k, v] of Object.entries(skus)) {
  const cost = costMap[k] ? (v / 1e6) * costMap[k] : "???";
  if (typeof cost === "number") {
    total += cost;
  }
  out.push({
    sku: k,
    quantity: v,
    cost: typeof cost === "number" ? cost.toFixed(2) : cost,
  });
}

out.sort((a, b) => a.sku.localeCompare(b.sku));
console.table(out);

console.log("Total cost: $" + total.toFixed(2));

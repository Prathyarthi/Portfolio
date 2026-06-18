import { OpenRouter } from "@openrouter/sdk";

export const DEFAULT_OPENROUTER_MODEL = "moonshotai/kimi-k2.5";

export const FALLBACK_MODELS = [
  "moonshotai/kimi-k2.5",
  "google/gemini-flash-1.5",
  "meta-llama/llama-3.1-8b-instruct:free",
];

export function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return apiKey;
}

export function getOpenRouterModel() {
  return process.env.OPENROUTER_CHAT_MODEL || DEFAULT_OPENROUTER_MODEL;
}

export function getOpenRouterFallbackModels(): string[] {
  const fallbackEnv = process.env.OPENROUTER_FALLBACK_MODELS;
  if (fallbackEnv) {
    return fallbackEnv.split(",").map((m) => m.trim());
  }
  return FALLBACK_MODELS;
}

function createOpenRouterClient() {
  return new OpenRouter({
    apiKey: getOpenRouterApiKey(),
    httpReferer: process.env.OPENROUTER_HTTP_REFERER,
    appTitle: process.env.OPENROUTER_APP_TITLE,
  });
}

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function generateOpenRouterText({
  messages,
  model,
  temperature = 0.2,
  enableFallback = true,
}: {
  messages: OpenRouterMessage[];
  model?: string;
  temperature?: number;
  enableFallback?: boolean;
}) {
  const client = createOpenRouterClient();

  const primaryModel = model || getOpenRouterModel();
  const fallbackModels = enableFallback ? getOpenRouterFallbackModels() : [primaryModel];

  const completion = await client.chat.send({
    chatRequest: {
      models: fallbackModels,
      messages,
      temperature,
      provider: {
        allowFallbacks: true,
        order: ["DeepInfra", "Lepton", "Together", "Fireworks"],
      },
    },
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";

  if (!text) {
    throw new Error("OpenRouter returned an empty response");
  }

  return text;
}

import { createOpenAI } from "@ai-sdk/openai";
import { createSyntuxHandler } from "getsyntux/server";
import spec from "@/lib/getsyntux/spec";
import { DEFAULT_OPENROUTER_MODEL, getOpenRouterApiKey } from "@/lib/openrouter";

export async function POST(request: Request) {
  const openrouter = createOpenAI({
    apiKey: getOpenRouterApiKey(),
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
      ...(process.env.OPENROUTER_HTTP_REFERER
        ? { "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER }
        : {}),
      ...(process.env.OPENROUTER_APP_TITLE
        ? { "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE }
        : {}),
    },
  });

  const handler = createSyntuxHandler({
    model: openrouter(
      process.env.OPENROUTER_SYNTUX_MODEL ||
      process.env.OPENROUTER_CHAT_MODEL ||
      DEFAULT_OPENROUTER_MODEL
    ),
    spec,
  });
  return handler(request);
}

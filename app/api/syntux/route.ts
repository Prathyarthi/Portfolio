import { createOpenAI } from "@ai-sdk/openai";
import { createSyntuxHandler } from "getsyntux/server";
import spec from "@/lib/getsyntux/spec";
import { DEFAULT_OPENROUTER_MODEL, getOpenRouterApiKey } from "@/lib/openrouter";
import {
  AI_USER_CONTEXT_LIMIT_CHARS,
  guardAiRequest,
} from "@/lib/ai-request-guard";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const guard = await guardAiRequest(request);
    if (!guard.ok) return guard.response;

    let body: unknown;
    try {
      body = await guard.request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (
      !body
      || typeof body !== "object"
      || Array.isArray(body)
      || !("value" in body)
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const hint = "hint" in body ? body.hint : undefined;
    if (hint !== undefined && typeof hint !== "string") {
      return NextResponse.json({ error: "Hint must be a string" }, { status: 400 });
    }
    if (hint && hint.length > AI_USER_CONTEXT_LIMIT_CHARS) {
      return NextResponse.json(
        {
          error: `Hint must be at most ${AI_USER_CONTEXT_LIMIT_CHARS} characters`,
        },
        { status: 400 },
      );
    }

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
        process.env.OPENROUTER_SYNTUX_MODEL
        || process.env.OPENROUTER_CHAT_MODEL
        || DEFAULT_OPENROUTER_MODEL,
      ),
      spec,
    });

    const headers = new Headers(guard.request.headers);
    headers.delete("content-length");
    return handler(
      new Request(guard.request.url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: guard.request.signal,
      }),
    );
  } catch (error) {
    console.error("[POST /api/syntux] Generation failed", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}

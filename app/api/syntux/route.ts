import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createSyntuxHandler } from "getsyntux/server";
import spec from "@/lib/getsyntux/spec";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(request: Request) {
  const handler = createSyntuxHandler({
    model: google("gemini-2.0-flash"),
    spec,
  });
  return handler(request);
}

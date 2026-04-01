import Elysia from "elysia";
import { getSession } from "@/lib/session";
import { parseResume } from "@/lib/gemini";

export const resume = new Elysia({ prefix: "/resume" })
  .post("/parse", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }

    const formData = await ctx.request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      ctx.set.status = 400;
      return { error: "No PDF file provided" };
    }

    if (file.type !== "application/pdf") {
      ctx.set.status = 400;
      return { error: "File must be a PDF" };
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      ctx.set.status = 400;
      return { error: "File size must be less than 10MB" };
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parsed = await parseResume(buffer);
      return { success: true, data: parsed };
    } catch (error: any) {
      ctx.set.status = 500;
      return {
        error: "Failed to parse resume",
        details: error.message,
      };
    }
  });

import Elysia from "elysia";
import { getSession } from "@/lib/session";
import { extractTextFromPdf } from "@/lib/pdf-extract";
import { structureResumeWithAi } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { getPlanLimitMessage, resolveAccessForUser } from "@/lib/entitlements";

export const resume = new Elysia({ prefix: "/resume" })
  .post("/parse", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      ctx.set.status = 404;
      return { error: "User not found" };
    }

    const access = resolveAccessForUser(user);
    if (!access.canUseImports) {
      ctx.set.status = 403;
      return {
        error: getPlanLimitMessage(access),
        code: "PLAN_LIMITED",
        access,
      };
    }

    // Elysia already parses multipart/form-data into ctx.body before the handler runs.
    // Reading ctx.request.formData() again throws in production (body stream is single-use).
    const fileEntry = (ctx.body as { file?: unknown } | null)?.file;
    const file = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;

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

      const rawText = await extractTextFromPdf(buffer);

      if (!rawText.trim()) {
        ctx.set.status = 400;
        return { error: "Could not extract text from PDF. The file may be image-based or empty." };
      }

      const parsed = await structureResumeWithAi(rawText);

      return { success: true, data: parsed };
    } catch (error: any) {
      ctx.set.status = 500;
      return {
        error: "Failed to parse resume",
        details: error.message,
      };
    }
  });

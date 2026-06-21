import { prisma } from "@/lib/prisma";
import { fetchMicrolinkScreenshotUrl } from "@/lib/microlink";

/**
 * Fetches Microlink screenshots for enabled projects and stores them on
 * `project.imageUrl`. Clears `imageUrl` for disabled projects.
 * Called once when preview preferences are saved (import dialog or edit save).
 */
export async function syncLivePreviewImages(
  portfolioId: string,
  livePreviewProjectIds: string[]
): Promise<void> {
  const enabled = new Set(livePreviewProjectIds);
  const projects = await prisma.project.findMany({
    where: { portfolioId },
    select: { id: true, liveUrl: true },
  });

  await Promise.all(
    projects.map(async (project) => {
      const shouldEnable =
        enabled.has(project.id) && Boolean(project.liveUrl?.trim());

      if (!shouldEnable) {
        await prisma.project.update({
          where: { id: project.id },
          data: { imageUrl: null },
        });
        return;
      }

      const screenshotUrl = await fetchMicrolinkScreenshotUrl(project.liveUrl!);
      if (screenshotUrl) {
        await prisma.project.update({
          where: { id: project.id },
          data: { imageUrl: screenshotUrl },
        });
      }
    })
  );
}

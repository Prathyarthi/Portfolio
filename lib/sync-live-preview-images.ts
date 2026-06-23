import { prisma } from "@/lib/prisma";
import { fetchMicrolinkScreenshotUrl } from "@/lib/microlink";
import { isLivePreviewEnabledForProject } from "@/lib/live-preview";

export async function syncLivePreviewImages(
  portfolioId: string,
  livePreviewProjectIds: string[]
): Promise<void> {
  const projects = await prisma.project.findMany({
    where: { portfolioId },
    select: { id: true, liveUrl: true, imageUrl: true },
    orderBy: { sortOrder: "asc" },
  });

  for (const project of projects) {
    const enabled = isLivePreviewEnabledForProject(
      project.id,
      livePreviewProjectIds
    );
    const liveUrl = project.liveUrl?.trim();

    if (enabled && liveUrl) {
      const screenshotUrl = await fetchMicrolinkScreenshotUrl(liveUrl);
      if (!screenshotUrl) {
        console.warn(
          "[sync-live-preview] No screenshot returned for project",
          project.id,
          liveUrl
        );
        continue;
      }
      if (screenshotUrl !== project.imageUrl) {
        await prisma.project.update({
          where: { id: project.id },
          data: { imageUrl: screenshotUrl },
        });
      }
    } else if (project.imageUrl) {
      await prisma.project.update({
        where: { id: project.id },
        data: { imageUrl: null },
      });
    }
  }
}

/** Re-sync previews for projects that are enabled but missing a cached image. */
export async function healMissingLivePreviewImages(
  portfolioId: string,
  livePreviewProjectIds: string[]
): Promise<boolean> {
  if (!livePreviewProjectIds.length) return false;

  const projects = await prisma.project.findMany({
    where: { portfolioId, id: { in: livePreviewProjectIds } },
    select: { id: true, liveUrl: true, imageUrl: true },
  });

  const needsSync = projects.some(
    (project) => project.liveUrl?.trim() && !project.imageUrl?.trim()
  );

  if (!needsSync) return false;

  await syncLivePreviewImages(portfolioId, livePreviewProjectIds);
  return true;
}

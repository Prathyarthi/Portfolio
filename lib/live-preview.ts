export const FREE_TRIAL_MAX_LIVE_PREVIEWS = 2;
export const ACTIVE_MAX_LIVE_PREVIEWS = 7;

export function getMaxLivePreviews(
  subscriptionStatus: string | null | undefined
): number {
  if ((subscriptionStatus ?? "").toLowerCase() === "active") {
    return ACTIVE_MAX_LIVE_PREVIEWS;
  }
  return FREE_TRIAL_MAX_LIVE_PREVIEWS;
}

export function isProSubscriptionStatus(
  subscriptionStatus: string | null | undefined
): boolean {
  return (subscriptionStatus ?? "").toLowerCase() === "active";
}

export function isLivePreviewEnabledForProject(
  projectId: string,
  livePreviewProjectIds: string[] | null | undefined
): boolean {
  if (!livePreviewProjectIds?.length) return false;
  return livePreviewProjectIds.includes(projectId);
}

export function sanitizeLivePreviewProjectIds(
  requestedIds: string[],
  projects: Array<{ id: string; liveUrl: string | null }>,
  maxAllowed: number
): string[] {
  const eligible = new Set(
    projects
      .filter((project) => project.liveUrl?.trim())
      .map((project) => project.id)
  );

  const unique: string[] = [];
  for (const id of requestedIds) {
    if (!eligible.has(id) || unique.includes(id)) continue;
    unique.push(id);
    if (unique.length >= maxAllowed) break;
  }

  return unique;
}

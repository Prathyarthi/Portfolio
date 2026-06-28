import type { ImportSourceValue } from "@/features/portfolio/constants/import-sources";

type PortfolioLike = {
  title?: string | null;
  experiences?: unknown[] | null;
  projects?: unknown[] | null;
  articles?: unknown[] | null;
  socialProfiles?: Array<{ platform?: string | null }> | null;
} | null | undefined;

function hasSocialProfile(
  portfolio: PortfolioLike,
  platform: string
): boolean {
  return (
    portfolio?.socialProfiles?.some(
      (profile) => profile.platform?.toLowerCase() === platform
    ) ?? false
  );
}

export function isImportSourceConnected(
  source: ImportSourceValue,
  portfolio: PortfolioLike
): boolean {
  if (!portfolio) return false;

  switch (source) {
    case "resume":
      return (
        Boolean(portfolio.title?.trim()) &&
        (portfolio.experiences?.length ?? 0) > 0
      );
    case "github":
      return (
        hasSocialProfile(portfolio, "github") ||
        (portfolio.projects?.length ?? 0) > 0
      );
    case "medium":
      return (
        hasSocialProfile(portfolio, "medium") ||
        (portfolio.articles?.length ?? 0) > 0
      );
    case "leetcode":
      return hasSocialProfile(portfolio, "leetcode");
    default:
      return false;
  }
}

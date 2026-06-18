import { prisma } from "@/lib/prisma";
import {
  isReservedSubdomain,
  isValidPortfolioSlug,
  sanitizePortfolioSlug,
} from "@/lib/domain";

export function validatePortfolioSlug(slug: string): string | null {
  const normalized = sanitizePortfolioSlug(slug);
  if (!isValidPortfolioSlug(normalized) || isReservedSubdomain(normalized)) {
    return null;
  }
  return normalized;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
  const existing = await prisma.portfolio.findUnique({ where: { slug } });
  return Boolean(existing);
}

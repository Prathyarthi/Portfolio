import { prisma } from "@/lib/prisma";
import { normalizeOptionalStoredUrl } from "@/lib/content-policy";

type EnsurePortfolioUser = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export async function ensureUserPortfolio(
  userId: string,
  user?: EnsurePortfolioUser | null,
) {
  const existing = await prisma.portfolio.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  const dbUser =
    user ??
    (await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatar: true },
    }));
  let avatarUrl: string | null = null;
  try {
    avatarUrl = normalizeOptionalStoredUrl(dbUser?.avatar, "User avatar URL");
  } catch {
    // An invalid provider image must not become stored portfolio content.
  }

  return prisma.portfolio.create({
    data: {
      userId,
      slug: null,
      title: dbUser?.name ?? "",
      contactEmail: dbUser?.email ?? "",
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });
}

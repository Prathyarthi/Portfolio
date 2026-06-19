import { prisma } from "@/lib/prisma";

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

  return prisma.portfolio.create({
    data: {
      userId,
      slug: null,
      title: dbUser?.name ?? "",
      contactEmail: dbUser?.email ?? "",
      ...(dbUser?.avatar ? { avatarUrl: dbUser.avatar } : {}),
    },
  });
}

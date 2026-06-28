import { prisma } from "@/lib/prisma";
import { ensureUserPortfolio } from "@/lib/ensure-portfolio";

async function fetchGitHubLogin(accessToken: string): Promise<string | null> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Livefolio",
    },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { login?: string };
  return typeof data.login === "string" && data.login.trim()
    ? data.login.trim()
    : null;
}

export async function linkOAuthSocialProfile(params: {
  userId: string;
  provider: string;
  profile?: Record<string, unknown> | null;
  accessToken?: string | null;
}) {
  if (params.provider !== "github") return;

  const portfolio = await ensureUserPortfolio(params.userId);

  let username =
    typeof params.profile?.login === "string" && params.profile.login.trim()
      ? params.profile.login.trim()
      : null;

  if (!username && params.accessToken) {
    username = await fetchGitHubLogin(params.accessToken);
  }

  if (!username) return;

  const url = `https://github.com/${username}`;

  await prisma.socialProfile.upsert({
    where: {
      portfolioId_platform: {
        portfolioId: portfolio.id,
        platform: "github",
      },
    },
    update: {
      url,
      username,
    },
    create: {
      portfolioId: portfolio.id,
      platform: "github",
      url,
      username,
    },
  });

  await prisma.socialProfile.deleteMany({
    where: {
      portfolioId: portfolio.id,
      platform: "unknown",
      OR: [
        { username: { contains: username, mode: "insensitive" } },
        { url: { contains: username, mode: "insensitive" } },
      ],
    },
  });
}

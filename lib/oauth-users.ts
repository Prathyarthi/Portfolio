import { prisma } from "@/lib/prisma";

const GENERIC_OAUTH_NAMES = new Set(["GitHub User", "Google User"]);

export function normalizeOAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}

type GitHubEmailRecord = {
  email: string;
  primary: boolean;
  verified: boolean;
};

export async function fetchGitHubPrimaryEmail(
  accessToken: string,
): Promise<string | null> {
  const res = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Livefolio",
    },
  });

  if (!res.ok) return null;

  const emails = (await res.json()) as GitHubEmailRecord[];
  const primaryVerified = emails.find((entry) => entry.primary && entry.verified);
  if (primaryVerified) return primaryVerified.email;

  const verified = emails.find((entry) => entry.verified);
  return verified?.email ?? null;
}

export async function upsertOAuthUser(params: {
  email: string;
  name?: string | null;
  avatar?: string | null;
  defaultName?: string;
}) {
  const email = normalizeOAuthEmail(params.email);
  const fallbackName = params.defaultName ?? "User";
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (!existing) {
    return prisma.user.create({
      data: {
        name: params.name?.trim() || fallbackName,
        email,
        password: "",
        avatar: params.avatar ?? undefined,
      },
    });
  }

  return prisma.user.update({
    where: { email },
    data: {
      ...(params.avatar && !existing.avatar ? { avatar: params.avatar } : {}),
      ...(params.name?.trim() &&
      (GENERIC_OAUTH_NAMES.has(existing.name) || !existing.name.trim())
        ? { name: params.name.trim() }
        : {}),
    },
  });
}

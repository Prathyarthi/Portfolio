import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export function isGitHubAuthEnabled(): boolean {
  return Boolean(
    process.env.GITHUB_CLIENT_ID?.trim() &&
      process.env.GITHUB_CLIENT_SECRET?.trim(),
  );
}

export function isGoogleAuthEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export function createGitHubProvider() {
  if (!isGitHubAuthEnabled()) return null;

  return GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
  });
}

export function createGoogleProvider() {
  if (!isGoogleAuthEnabled()) return null;

  return GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    allowDangerousEmailAccountLinking: true,
  });
}

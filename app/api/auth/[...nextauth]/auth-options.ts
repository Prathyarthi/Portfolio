import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";
import { createGitHubProvider, createGoogleProvider } from "@/lib/auth-providers";
import {
  fetchGitHubPrimaryEmail,
  upsertOAuthUser,
} from "@/lib/oauth-users";

const githubProvider = createGitHubProvider();
const googleProvider = createGoogleProvider();

const OAUTH_PROVIDERS = new Set(["github", "google"]);

async function syncOAuthUser(
  provider: string,
  user: { email?: string | null; name?: string | null; image?: string | null },
  accessToken?: string | null,
): Promise<string | true> {
  let email = user.email;

  if (!email && provider === "github" && accessToken) {
    email = await fetchGitHubPrimaryEmail(accessToken);
  }

  if (!email) {
    return provider === "google"
      ? "/sign-in?error=GoogleEmailRequired"
      : "/sign-in?error=GitHubEmailRequired";
  }

  user.email = email;

  await upsertOAuthUser({
    email,
    name: user.name,
    avatar: user.image,
    defaultName: provider === "google" ? "Google User" : "GitHub User",
  });

  return true;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    ...(googleProvider ? [googleProvider] : []),
    ...(githubProvider ? [githubProvider] : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;

        const valid = await comparePassword(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar ?? undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.provider || !OAUTH_PROVIDERS.has(account.provider)) {
        return true;
      }

      return syncOAuthUser(account.provider, user, account.access_token);
    },
    async jwt({ token, user, account }) {
      if (account?.provider && OAUTH_PROVIDERS.has(account.provider)) {
        const email = user?.email ?? token.email;
        if (typeof email === "string") {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.avatar = dbUser.avatar ?? undefined;
            token.email = dbUser.email;
            token.name = dbUser.name;
          }
        }
        return token;
      }

      if (user) {
        token.id = user.id;
        token.avatar = user.avatar;
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;
      session.user.avatar = token.avatar as string | undefined;
      return session;
    },
  },
};

import Elysia, { t } from "elysia";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  buildGitHubCachedStats,
  fetchGitHubContributionsFromProfilePage,
  fetchGitHubProfile,
} from "@/lib/github";
import { fetchLeetCodeStats } from "@/lib/leetcode";
import { fetchMediumArticles } from "@/lib/medium";
import { getPlanLimitMessage, resolveAccessForUser } from "@/lib/entitlements";
import { ensureUserPortfolio } from "@/lib/ensure-portfolio";
import { sanitizeImportedStoredUrl } from "@/lib/content-policy";

async function requireImportEntitlement(request: Request) {
  const session = await getSession(request);
  if (!session) {
    return {
      ok: false as const,
      status: 401 as const,
      body: { error: "Unauthorized" },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) {
    return {
      ok: false as const,
      status: 404 as const,
      body: { error: "User not found" },
    };
  }

  const access = resolveAccessForUser(user);
  if (!access.canUseImports) {
    return {
      ok: false as const,
      status: 403 as const,
      body: {
        error: getPlanLimitMessage(access),
        code: "PLAN_LIMITED",
        access,
      },
    };
  }

  return { ok: true as const, session };
}

export const profile = new Elysia({ prefix: "/profile" })

  // ── GitHub ──────────────────────────────────────────────
  .post(
    "/github/fetch",
    async (ctx) => {
      const gate = await requireImportEntitlement(ctx.request);
      if (!gate.ok) {
        ctx.set.status = gate.status;
        return gate.body;
      }

      try {
        const data = await fetchGitHubProfile(
          ctx.body.username,
          process.env.GITHUB_TOKEN
        );
        return { success: true, data };
      } catch (error: unknown) {
        ctx.set.status = 400;
        const message =
          error instanceof Error ? error.message : "Failed to fetch GitHub data";
        const hint =
          message.includes("fetch") || message.includes("aborted")
            ? " (GitHub may be slow or unreachable; try again or set GITHUB_TOKEN in .env for higher rate limits.)"
            : "";
        return { error: `${message}${hint}` };
      }
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
      }),
    }
  )

  .post(
    "/github/import",
    async (ctx) => {
      const gate = await requireImportEntitlement(ctx.request);
      if (!gate.ok) {
        ctx.set.status = gate.status;
        return gate.body;
      }

      const portfolio = await ensureUserPortfolio(gate.session.userId);

      const existingCount = await prisma.project.count({
        where: { portfolioId: portfolio.id },
      });

      const projects = ctx.body.repos.map((repo, index) => ({
        portfolioId: portfolio.id,
        title: repo.name,
        description: repo.description || "",
        sourceUrl: sanitizeImportedStoredUrl(
          repo.url,
          `Repositories[${index}].url`,
        ),
        techStack: repo.topics,
        githubStars: repo.stars,
        githubForks: repo.forks,
        language: repo.language,
        sortOrder: existingCount + index,
      }));

      const result = await prisma.project.createMany({ data: projects });

      if (ctx.body.username) {
        const token = process.env.GITHUB_TOKEN;
        let cachedStats: Record<string, unknown> | undefined;
        let lastFetched: Date | undefined;
        try {
          const ghData = await fetchGitHubProfile(ctx.body.username, token);
          const calendar = await fetchGitHubContributionsFromProfilePage(
            ctx.body.username
          );
          cachedStats = buildGitHubCachedStats(ghData, calendar);
          lastFetched = new Date();
        } catch {
          // Projects are already saved; still link GitHub without cached stats.
        }

        await prisma.socialProfile.upsert({
          where: {
            portfolioId_platform: {
              portfolioId: portfolio.id,
              platform: "github",
            },
          },
          update: {
            url: `https://github.com/${ctx.body.username}`,
            username: ctx.body.username,
            ...(cachedStats != null
              ? {
                  cachedStats: cachedStats as object,
                  lastFetched,
                }
              : {}),
          },
          create: {
            portfolioId: portfolio.id,
            platform: "github",
            url: `https://github.com/${ctx.body.username}`,
            username: ctx.body.username,
            ...(cachedStats != null
              ? {
                  cachedStats: cachedStats as object,
                  lastFetched,
                }
              : {}),
          },
        });
      }

      return { success: true, imported: result.count };
    },
    {
      body: t.Object({
        username: t.String(),
        repos: t.Array(
          t.Object({
            name: t.String(),
            description: t.Union([t.String(), t.Null()]),
            url: t.String(),
            stars: t.Number(),
            forks: t.Number(),
            language: t.Union([t.String(), t.Null()]),
            topics: t.Array(t.String()),
          })
        ),
      }),
    }
  )

  // ── LeetCode ────────────────────────────────────────────
  .post(
    "/leetcode/fetch",
    async (ctx) => {
      const gate = await requireImportEntitlement(ctx.request);
      if (!gate.ok) {
        ctx.set.status = gate.status;
        return gate.body;
      }

      try {
        const data = await fetchLeetCodeStats(ctx.body.username);
        return { success: true, data };
      } catch (error: any) {
        ctx.set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
      }),
    }
  )

  .post(
    "/leetcode/import",
    async (ctx) => {
      const gate = await requireImportEntitlement(ctx.request);
      if (!gate.ok) {
        ctx.set.status = gate.status;
        return gate.body;
      }

      const portfolio = await ensureUserPortfolio(gate.session.userId);

      const result = await prisma.socialProfile.upsert({
        where: {
          portfolioId_platform: {
            portfolioId: portfolio.id,
            platform: "leetcode",
          },
        },
        update: {
          url: `https://leetcode.com/u/${ctx.body.username}`,
          username: ctx.body.username,
          cachedStats: {
            ranking: ctx.body.ranking,
            totalSolved: ctx.body.totalSolved,
            easySolved: ctx.body.easySolved,
            mediumSolved: ctx.body.mediumSolved,
            hardSolved: ctx.body.hardSolved,
          },
          lastFetched: new Date(),
        },
        create: {
          portfolioId: portfolio.id,
          platform: "leetcode",
          url: `https://leetcode.com/u/${ctx.body.username}`,
          username: ctx.body.username,
          cachedStats: {
            ranking: ctx.body.ranking,
            totalSolved: ctx.body.totalSolved,
            easySolved: ctx.body.easySolved,
            mediumSolved: ctx.body.mediumSolved,
            hardSolved: ctx.body.hardSolved,
          },
          lastFetched: new Date(),
        },
      });

      return { success: true, profile: result };
    },
    {
      body: t.Object({
        username: t.String(),
        ranking: t.Number(),
        totalSolved: t.Number(),
        easySolved: t.Number(),
        mediumSolved: t.Number(),
        hardSolved: t.Number(),
      }),
    }
  )

  // ── Medium ──────────────────────────────────────────────
  .post(
    "/medium/fetch",
    async (ctx) => {
      const gate = await requireImportEntitlement(ctx.request);
      if (!gate.ok) {
        ctx.set.status = gate.status;
        return gate.body;
      }

      try {
        const data = await fetchMediumArticles(ctx.body.username);
        return { success: true, data };
      } catch (error: unknown) {
        ctx.set.status = 400;
        const message =
          error instanceof Error ? error.message : "Failed to fetch Medium articles";
        return { error: message };
      }
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
      }),
    }
  )

  .post(
    "/medium/import",
    async (ctx) => {
      const gate = await requireImportEntitlement(ctx.request);
      if (!gate.ok) {
        ctx.set.status = gate.status;
        return gate.body;
      }

      const portfolio = await ensureUserPortfolio(gate.session.userId);

      const existingCount = await prisma.article.count({
        where: { portfolioId: portfolio.id },
      });

      const articles = ctx.body.articles.flatMap((article, index) => {
        const url = sanitizeImportedStoredUrl(
          article.url,
          `Articles[${index}].url`,
        );
        if (!url) return [];

          let publishedAt: Date | null = null;
          if (article.publishedAt) {
            const parsed = new Date(article.publishedAt);
            if (!Number.isNaN(parsed.getTime())) publishedAt = parsed;
          }
          return [{
            portfolioId: portfolio.id,
            title: article.title,
            description: article.description || "",
            url,
            tags: article.tags,
            publishedAt,
            readTime: article.readTime ?? null,
            sortOrder: existingCount + index,
          }];
      });

      const result = await prisma.article.createMany({ data: articles });

      if (ctx.body.username) {
        await prisma.socialProfile.upsert({
          where: {
            portfolioId_platform: {
              portfolioId: portfolio.id,
              platform: "medium",
            },
          },
          update: {
            url: `https://medium.com/@${ctx.body.username}`,
            username: ctx.body.username,
          },
          create: {
            portfolioId: portfolio.id,
            platform: "medium",
            url: `https://medium.com/@${ctx.body.username}`,
            username: ctx.body.username,
          },
        });
      }

      return { success: true, imported: result.count };
    },
    {
      body: t.Object({
        username: t.String(),
        articles: t.Array(
          t.Object({
            title: t.String(),
            description: t.String(),
            url: t.String(),
            publishedAt: t.String(),
            tags: t.Array(t.String()),
            readTime: t.Optional(t.Number()),
          })
        ),
      }),
    }
  );

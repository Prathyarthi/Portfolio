import Elysia, { t } from "elysia";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { fetchGitHubProfile } from "@/lib/github";
import { fetchLeetCodeStats } from "@/lib/leetcode";

export const profile = new Elysia({ prefix: "/profile" })

  // ── GitHub ──────────────────────────────────────────────
  .post(
    "/github/fetch",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }

      try {
        const data = await fetchGitHubProfile(ctx.body.username);
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
    "/github/import",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }

      const portfolio = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!portfolio) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

      const existingCount = await prisma.project.count({
        where: { portfolioId: portfolio.id },
      });

      const projects = ctx.body.repos.map((repo, index) => ({
        portfolioId: portfolio.id,
        title: repo.name,
        description: repo.description || "",
        sourceUrl: repo.url,
        techStack: repo.topics,
        githubStars: repo.stars,
        githubForks: repo.forks,
        language: repo.language,
        sortOrder: existingCount + index,
      }));

      const result = await prisma.project.createMany({ data: projects });

      // Also save GitHub as a social profile
      if (ctx.body.username) {
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
          },
          create: {
            portfolioId: portfolio.id,
            platform: "github",
            url: `https://github.com/${ctx.body.username}`,
            username: ctx.body.username,
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
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
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
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }

      const portfolio = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!portfolio) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

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
  );

import Elysia from "elysia";
import { prisma } from "@/lib/prisma";

export const publicPortfolio = new Elysia({ prefix: "/public" })

  // Get published portfolio by slug
  .get("/portfolio/:slug", async (ctx) => {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug: ctx.params.slug },
      include: {
        experiences: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        projects: { orderBy: { sortOrder: "asc" } },
        socialProfiles: true,
        certifications: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!portfolio) {
      ctx.set.status = 404;
      return { error: "Portfolio not found" };
    }

    if (!portfolio.isPublished) {
      ctx.set.status = 404;
      return { error: "Portfolio is not published" };
    }

    // Strip sensitive fields
    const { userId, ...publicData } = portfolio;

    return publicData;
  })

  // List available templates
  .get("/templates", async () => {
    const templates = await prisma.template.findMany({
      orderBy: { name: "asc" },
    });
    return templates;
  });

import Elysia, { t } from "elysia";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";

function toDateOrThrow(value: string) {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);

  if (Number.isNaN(normalized.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return normalized;
}

function toOptionalDate(value?: string | null) {
  if (!value) return null;
  return toDateOrThrow(value);
}

export const portfolio = new Elysia({ prefix: "/portfolio" })
  // Get current user's portfolio
  .get("/", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }

    const existing = await prisma.portfolio.findUnique({
      where: { userId: session.userId },
      include: {
        experiences: { orderBy: { sortOrder: "asc" } },
        educations: { orderBy: { sortOrder: "asc" } },
        skills: { orderBy: { sortOrder: "asc" } },
        projects: { orderBy: { sortOrder: "asc" } },
        socialProfiles: true,
        certifications: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!existing) {
      // Auto-create portfolio for user
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
      });
      const slug = await ensureUniqueSlug(
        generateSlug(user?.name ?? "portfolio")
      );

      const created = await prisma.portfolio.create({
        data: {
          userId: session.userId,
          slug,
          title: user?.name ?? "",
          contactEmail: user?.email ?? "",
          avatarUrl: user?.avatar ?? undefined,
        },
        include: {
          experiences: true,
          educations: true,
          skills: true,
          projects: true,
          socialProfiles: true,
          certifications: true,
        },
      });

      return created;
    }

    return existing;
  })

  // Update portfolio fields
  .patch(
    "/",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }

      const updated = await prisma.portfolio.update({
        where: { userId: session.userId },
        data: ctx.body,
      });

      return updated;
    },
    {
      body: t.Partial(
        t.Object({
          title: t.String(),
          headline: t.String(),
          summary: t.String(),
          avatarUrl: t.Union([t.String(), t.Null()]),
          contactEmail: t.Union([t.String(), t.Null()]),
          phone: t.Union([t.String(), t.Null()]),
          location: t.Union([t.String(), t.Null()]),
          websiteUrl: t.Union([t.String(), t.Null()]),
          metaTitle: t.Union([t.String(), t.Null()]),
          metaDescription: t.Union([t.String(), t.Null()]),
        })
      ),
    }
  )

  // Change template
  .patch(
    "/template",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }

      const updated = await prisma.portfolio.update({
        where: { userId: session.userId },
        data: { templateId: ctx.body.templateId },
      });

      return updated;
    },
    {
      body: t.Object({ templateId: t.String() }),
    }
  )

  // Publish/unpublish
  .patch(
    "/publish",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }

      const updated = await prisma.portfolio.update({
        where: { userId: session.userId },
        data: { isPublished: ctx.body.isPublished },
      });

      return updated;
    },
    {
      body: t.Object({ isPublished: t.Boolean() }),
    }
  )

  // Check slug availability
  .post(
    "/slug/check",
    async (ctx) => {
      const existing = await prisma.portfolio.findUnique({
        where: { slug: ctx.body.slug },
      });
      return { available: !existing };
    },
    {
      body: t.Object({ slug: t.String() }),
    }
  )

  // Change slug
  .patch(
    "/slug",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }

      const existing = await prisma.portfolio.findUnique({
        where: { slug: ctx.body.slug },
      });
      if (existing && existing.userId !== session.userId) {
        ctx.set.status = 409;
        return { error: "Slug already taken" };
      }

      const updated = await prisma.portfolio.update({
        where: { userId: session.userId },
        data: { slug: ctx.body.slug },
      });

      return updated;
    },
    {
      body: t.Object({ slug: t.String() }),
    }
  )

  // === EXPERIENCE CRUD ===
  .post(
    "/experience",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const p = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!p) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

      const count = await prisma.experience.count({
        where: { portfolioId: p.id },
      });

      try {
        return await prisma.experience.create({
          data: {
            ...ctx.body,
            portfolioId: p.id,
            sortOrder: count,
            startDate: toDateOrThrow(ctx.body.startDate),
            endDate: toOptionalDate(ctx.body.endDate),
          },
        });
      } catch (error) {
        ctx.set.status = 400;
        return {
          error:
            error instanceof Error ? error.message : "Failed to create experience",
        };
      }
    },
    {
      body: t.Object({
        company: t.String(),
        role: t.String(),
        description: t.String(),
        startDate: t.String(),
        endDate: t.Optional(t.Union([t.String(), t.Null()])),
        location: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    }
  )
  .patch(
    "/experience/:id",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        const data = {
          ...ctx.body,
          startDate: ctx.body.startDate
            ? toDateOrThrow(ctx.body.startDate)
            : undefined,
          endDate:
            ctx.body.endDate === undefined
              ? undefined
              : toOptionalDate(ctx.body.endDate),
        };

        return await prisma.experience.update({
          where: { id: ctx.params.id },
          data,
        });
      } catch (error) {
        ctx.set.status = 400;
        return {
          error:
            error instanceof Error ? error.message : "Failed to update experience",
        };
      }
    },
    {
      body: t.Partial(
        t.Object({
          company: t.String(),
          role: t.String(),
          description: t.String(),
          startDate: t.String(),
          endDate: t.Union([t.String(), t.Null()]),
          location: t.Union([t.String(), t.Null()]),
          sortOrder: t.Number(),
        })
      ),
    }
  )
  .delete("/experience/:id", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }
    await prisma.experience.delete({ where: { id: ctx.params.id } });
    return { success: true };
  })

  // === EDUCATION CRUD ===
  .post(
    "/education",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const p = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!p) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

      const count = await prisma.education.count({
        where: { portfolioId: p.id },
      });

      try {
        return await prisma.education.create({
          data: {
            ...ctx.body,
            portfolioId: p.id,
            sortOrder: count,
            startDate: toDateOrThrow(ctx.body.startDate),
            endDate: toOptionalDate(ctx.body.endDate),
          },
        });
      } catch (error) {
        ctx.set.status = 400;
        return {
          error:
            error instanceof Error ? error.message : "Failed to create education",
        };
      }
    },
    {
      body: t.Object({
        institution: t.String(),
        degree: t.String(),
        field: t.Optional(t.Union([t.String(), t.Null()])),
        description: t.Optional(t.Union([t.String(), t.Null()])),
        startDate: t.String(),
        endDate: t.Optional(t.Union([t.String(), t.Null()])),
        gpa: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    }
  )
  .patch(
    "/education/:id",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        const data = {
          ...ctx.body,
          startDate: ctx.body.startDate
            ? toDateOrThrow(ctx.body.startDate)
            : undefined,
          endDate:
            ctx.body.endDate === undefined
              ? undefined
              : toOptionalDate(ctx.body.endDate),
        };

        return await prisma.education.update({
          where: { id: ctx.params.id },
          data,
        });
      } catch (error) {
        ctx.set.status = 400;
        return {
          error:
            error instanceof Error ? error.message : "Failed to update education",
        };
      }
    },
    {
      body: t.Partial(
        t.Object({
          institution: t.String(),
          degree: t.String(),
          field: t.Union([t.String(), t.Null()]),
          description: t.Union([t.String(), t.Null()]),
          startDate: t.String(),
          endDate: t.Union([t.String(), t.Null()]),
          gpa: t.Union([t.String(), t.Null()]),
          sortOrder: t.Number(),
        })
      ),
    }
  )
  .delete("/education/:id", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }
    await prisma.education.delete({ where: { id: ctx.params.id } });
    return { success: true };
  })

  // === SKILLS ===
  .post(
    "/skill",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const p = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!p) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }
      return prisma.skill.create({
        data: { ...ctx.body, portfolioId: p.id },
      });
    },
    {
      body: t.Object({
        name: t.String(),
        category: t.Optional(t.String()),
        level: t.Optional(t.Union([t.Number(), t.Null()])),
      }),
    }
  )
  .delete("/skill/:id", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }
    await prisma.skill.delete({ where: { id: ctx.params.id } });
    return { success: true };
  })
  .post(
    "/skill/bulk",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const p = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!p) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

      // Delete existing and recreate
      await prisma.skill.deleteMany({ where: { portfolioId: p.id } });
      const created = await prisma.skill.createMany({
        data: ctx.body.skills.map((s, i) => ({
          ...s,
          portfolioId: p.id,
          sortOrder: i,
        })),
      });

      return { count: created.count };
    },
    {
      body: t.Object({
        skills: t.Array(
          t.Object({
            name: t.String(),
            category: t.Optional(t.String()),
            level: t.Optional(t.Union([t.Number(), t.Null()])),
          })
        ),
      }),
    }
  )

  // === PROJECTS CRUD ===
  .post(
    "/project",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const p = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!p) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

      const count = await prisma.project.count({
        where: { portfolioId: p.id },
      });

      return prisma.project.create({
        data: { ...ctx.body, portfolioId: p.id, sortOrder: count },
      });
    },
    {
      body: t.Object({
        title: t.String(),
        description: t.String(),
        imageUrl: t.Optional(t.Union([t.String(), t.Null()])),
        liveUrl: t.Optional(t.Union([t.String(), t.Null()])),
        sourceUrl: t.Optional(t.Union([t.String(), t.Null()])),
        techStack: t.Optional(t.Array(t.String())),
        featured: t.Optional(t.Boolean()),
        githubStars: t.Optional(t.Union([t.Number(), t.Null()])),
        githubForks: t.Optional(t.Union([t.Number(), t.Null()])),
        language: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    }
  )
  .patch(
    "/project/:id",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      return prisma.project.update({
        where: { id: ctx.params.id },
        data: ctx.body,
      });
    },
    {
      body: t.Partial(
        t.Object({
          title: t.String(),
          description: t.String(),
          imageUrl: t.Union([t.String(), t.Null()]),
          liveUrl: t.Union([t.String(), t.Null()]),
          sourceUrl: t.Union([t.String(), t.Null()]),
          techStack: t.Array(t.String()),
          featured: t.Boolean(),
          sortOrder: t.Number(),
        })
      ),
    }
  )
  .delete("/project/:id", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }
    await prisma.project.delete({ where: { id: ctx.params.id } });
    return { success: true };
  })

  // === CERTIFICATIONS CRUD ===
  .post(
    "/certification",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const p = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!p) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

      try {
        return await prisma.certification.create({
          data: {
            ...ctx.body,
            portfolioId: p.id,
            issueDate: toOptionalDate(ctx.body.issueDate),
            expiryDate: toOptionalDate(ctx.body.expiryDate),
          },
        });
      } catch (error) {
        ctx.set.status = 400;
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to create certification",
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        issuer: t.String(),
        issueDate: t.Optional(t.Union([t.String(), t.Null()])),
        expiryDate: t.Optional(t.Union([t.String(), t.Null()])),
        url: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    }
  )
  .patch(
    "/certification/:id",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      try {
        const data = {
          ...ctx.body,
          issueDate:
            ctx.body.issueDate === undefined
              ? undefined
              : toOptionalDate(ctx.body.issueDate),
          expiryDate:
            ctx.body.expiryDate === undefined
              ? undefined
              : toOptionalDate(ctx.body.expiryDate),
        };

        return await prisma.certification.update({
          where: { id: ctx.params.id },
          data,
        });
      } catch (error) {
        ctx.set.status = 400;
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to update certification",
        };
      }
    },
    {
      body: t.Partial(
        t.Object({
          name: t.String(),
          issuer: t.String(),
          issueDate: t.Union([t.String(), t.Null()]),
          expiryDate: t.Union([t.String(), t.Null()]),
          url: t.Union([t.String(), t.Null()]),
          sortOrder: t.Number(),
        })
      ),
    }
  )
  .delete("/certification/:id", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }
    await prisma.certification.delete({ where: { id: ctx.params.id } });
    return { success: true };
  })

  // === SOCIAL PROFILES ===
  .post(
    "/social",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const p = await prisma.portfolio.findUnique({
        where: { userId: session.userId },
      });
      if (!p) {
        ctx.set.status = 404;
        return { error: "Portfolio not found" };
      }

      return prisma.socialProfile.upsert({
        where: {
          portfolioId_platform: {
            portfolioId: p.id,
            platform: ctx.body.platform,
          },
        },
        update: {
          url: ctx.body.url,
          username: ctx.body.username,
        },
        create: {
          ...ctx.body,
          portfolioId: p.id,
        },
      });
    },
    {
      body: t.Object({
        platform: t.String(),
        url: t.String(),
        username: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    }
  )
  .delete("/social/:id", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }
    await prisma.socialProfile.delete({ where: { id: ctx.params.id } });
    return { success: true };
  });

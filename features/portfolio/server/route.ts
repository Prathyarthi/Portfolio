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

/** Parses dates often returned by resume parsers (not only ISO YYYY-MM-DD). */
function resumeDateOrThrow(value: string) {
  const v = value.trim();
  if (!v) {
    throw new Error("Invalid date: (empty)");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return toDateOrThrow(v);
  }

  const mdy = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const iso = `${y}-${m!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
    return toDateOrThrow(iso);
  }

  const my = v.match(/^(\d{1,2})[/.-](\d{4})$/);
  if (my) {
    const [, m, y] = my;
    return toDateOrThrow(`${y}-${m!.padStart(2, "0")}-01`);
  }

  if (/^\d{4}$/.test(v)) {
    return toDateOrThrow(`${v}-01-01`);
  }

  const parsed = Date.parse(v);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed);
  }

  return toDateOrThrow(v);
}

function toOptionalDate(value?: string | null) {
  if (!value) return null;
  return toDateOrThrow(value);
}

function toOptionalResumeEndDate(value?: string | null) {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (/^(present|current|now|ongoing|till date|to date)$/i.test(s)) return null;
  return resumeDateOrThrow(s);
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
        achievements: { orderBy: { sortOrder: "asc" } },
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
          achievements: true,
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

      const { customization, headline, summary, ...rest } = ctx.body;
      const existingCustomization = customization
        ? await prisma.portfolio.findUnique({
            where: { userId: session.userId },
            select: { customization: true },
          })
        : null;

      const portfolioFields = {
        ...rest,
        ...(headline !== undefined ? { headline: headline ?? "" } : {}),
        ...(summary !== undefined ? { summary: summary ?? "" } : {}),
      };

      const updated = await prisma.portfolio.update({
        where: { userId: session.userId },
        data: {
          ...portfolioFields,
          ...(customization
            ? {
                customization: {
                  ...(existingCustomization?.customization &&
                  typeof existingCustomization.customization === "object" &&
                  !Array.isArray(existingCustomization.customization)
                    ? existingCustomization.customization
                    : {}),
                  ...customization,
                },
              }
            : {}),
        },
      });

      return updated;
    },
    {
      body: t.Partial(
        t.Object({
          title: t.String(),
          headline: t.Union([t.String(), t.Null()]),
          summary: t.Union([t.String(), t.Null()]),
          avatarUrl: t.Union([t.String(), t.Null()]),
          contactEmail: t.Union([t.String(), t.Null()]),
          phone: t.Union([t.String(), t.Null()]),
          location: t.Union([t.String(), t.Null()]),
          websiteUrl: t.Union([t.String(), t.Null()]),
          metaTitle: t.Union([t.String(), t.Null()]),
          metaDescription: t.Union([t.String(), t.Null()]),
          customization: t.Object({
            navbar: t.Optional(
              t.Object({
                enabled: t.Optional(t.Boolean()),
                sections: t.Optional(
                  t.Object({
                    about: t.Optional(t.Boolean()),
                    work: t.Optional(t.Boolean()),
                    experience: t.Optional(t.Boolean()),
                    profiles: t.Optional(t.Boolean()),
                  })
                ),
              })
            ),
          }),
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

  // Remove sections typically filled by resume import (avoids duplicates on re-import)
  .post(
    "/clear-importable",
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

      await prisma.$transaction([
        prisma.experience.deleteMany({ where: { portfolioId: p.id } }),
        prisma.education.deleteMany({ where: { portfolioId: p.id } }),
        prisma.skill.deleteMany({ where: { portfolioId: p.id } }),
        prisma.project.deleteMany({ where: { portfolioId: p.id } }),
        prisma.certification.deleteMany({ where: { portfolioId: p.id } }),
        prisma.achievement.deleteMany({ where: { portfolioId: p.id } }),
      ]);

      return { success: true };
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
        const description =
          ctx.body.description != null && String(ctx.body.description).trim() !== ""
            ? String(ctx.body.description)
            : "";

        return await prisma.experience.create({
          data: {
            company: ctx.body.company,
            role: ctx.body.role,
            description,
            location: ctx.body.location ?? null,
            portfolioId: p.id,
            sortOrder: count,
            startDate: ctx.body.startDate ? resumeDateOrThrow(ctx.body.startDate) : null,
            endDate: toOptionalResumeEndDate(ctx.body.endDate),
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
        description: t.Optional(t.Union([t.String(), t.Null()])),
        startDate: t.Optional(t.Union([t.String(), t.Null()])),
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
        const data: any = { ...ctx.body };
        if (ctx.body.startDate !== undefined) {
          data.startDate = ctx.body.startDate ? toDateOrThrow(ctx.body.startDate) : null;
        }
        if (ctx.body.endDate !== undefined) {
          data.endDate = ctx.body.endDate ? toOptionalDate(ctx.body.endDate) : null;
        }

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
            startDate: ctx.body.startDate ? resumeDateOrThrow(ctx.body.startDate) : null,
            endDate: toOptionalResumeEndDate(ctx.body.endDate),
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
        startDate: t.Optional(t.Union([t.String(), t.Null()])),
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
        const data: any = { ...ctx.body };
        if (ctx.body.startDate !== undefined) {
          data.startDate = ctx.body.startDate ? toDateOrThrow(ctx.body.startDate) : null;
        }
        if (ctx.body.endDate !== undefined) {
          data.endDate = ctx.body.endDate ? toOptionalDate(ctx.body.endDate) : null;
        }

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
  })

  // === ACHIEVEMENTS CRUD ===
  .post(
    "/achievement",
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

      const count = await prisma.achievement.count({
        where: { portfolioId: p.id },
      });

      return prisma.achievement.create({
        data: {
          ...ctx.body,
          portfolioId: p.id,
          sortOrder: count,
          date: ctx.body.date ? resumeDateOrThrow(ctx.body.date) : null,
        },
      });
    },
    {
      body: t.Object({
        title: t.String(),
        date: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    }
  )
  .patch(
    "/achievement/:id",
    async (ctx) => {
      const session = await getSession(ctx.request);
      if (!session) {
        ctx.set.status = 401;
        return { error: "Unauthorized" };
      }
      const updateData: any = { ...ctx.body };
      if (ctx.body.date !== undefined) {
        updateData.date = ctx.body.date ? resumeDateOrThrow(ctx.body.date) : null;
      }
      return prisma.achievement.update({
        where: { id: ctx.params.id },
        data: updateData,
      });
    },
    {
      body: t.Partial(
        t.Object({
          title: t.String(),
          date: t.Union([t.String(), t.Null()]),
          sortOrder: t.Number(),
        })
      ),
    }
  )
  .delete("/achievement/:id", async (ctx) => {
    const session = await getSession(ctx.request);
    if (!session) {
      ctx.set.status = 401;
      return { error: "Unauthorized" };
    }
    await prisma.achievement.delete({ where: { id: ctx.params.id } });
    return { success: true };
  });

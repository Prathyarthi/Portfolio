import { prisma } from "@/lib/prisma";
import type { PortfolioData } from "@/features/templates/types";
import {
  sanitizeImportedStoredUrl,
  sanitizeImportedStoredUrlsInJson,
} from "@/lib/content-policy";

/**
 * Bulk imports generated portfolio data into the database.
 * Creates or updates all sections (experiences, skills, projects, etc.) in a single transaction.
 */
export async function bulkImportPortfolioData(
  userId: string,
  data: PortfolioData
) {
  const portfolioId = (
    await prisma.portfolio.findUnique({
      where: { userId },
      select: { id: true },
    })
  )?.id;

  if (!portfolioId) {
    throw new Error("Portfolio not found. Create a portfolio first.");
  }

  // Validate all URLs before the destructive replacement begins.
  const websiteUrl = sanitizeImportedStoredUrl(
    data.portfolio.websiteUrl,
    "Portfolio website URL",
  );
  const avatarUrl = sanitizeImportedStoredUrl(
    data.portfolio.avatarUrl,
    "Portfolio avatar URL",
  );
  const projects = data.projects.map((project, index) => ({
    ...project,
    imageUrl: sanitizeImportedStoredUrl(
      project.imageUrl,
      `Projects[${index}].imageUrl`,
    ),
    liveUrl: sanitizeImportedStoredUrl(
      project.liveUrl,
      `Projects[${index}].liveUrl`,
    ),
    sourceUrl: sanitizeImportedStoredUrl(
      project.sourceUrl,
      `Projects[${index}].sourceUrl`,
    ),
  }));
  const socialProfiles = data.socialProfiles.flatMap((social, index) => {
    const url = sanitizeImportedStoredUrl(
      social.url,
      `Social profiles[${index}].url`,
    );
    return url ? [{ ...social, url }] : [];
  });
  const certifications = data.certifications.map((certification, index) => ({
    ...certification,
    url: sanitizeImportedStoredUrl(
      certification.url,
      `Certifications[${index}].url`,
    ),
  }));
  const customSections = data.customSections.map((section, index) => ({
    ...section,
    items: sanitizeImportedStoredUrlsInJson(
      section.items,
      `Custom sections[${index}].items`,
    ) as Record<string, unknown>[],
  }));

  // Delete existing data to avoid conflicts (parallel delete is faster)
  await Promise.all([
    prisma.experience.deleteMany({ where: { portfolioId } }),
    prisma.education.deleteMany({ where: { portfolioId } }),
    prisma.skill.deleteMany({ where: { portfolioId } }),
    prisma.project.deleteMany({ where: { portfolioId } }),
    prisma.article.deleteMany({ where: { portfolioId } }),
    prisma.socialProfile.deleteMany({ where: { portfolioId } }),
    prisma.certification.deleteMany({ where: { portfolioId } }),
    prisma.achievement.deleteMany({ where: { portfolioId } }),
    prisma.customSection.deleteMany({ where: { portfolioId } }),
  ]);

  // Update portfolio base fields
  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      title: data.portfolio.title || "",
      headline: data.portfolio.headline || "",
      summary: data.portfolio.summary || "",
      contactEmail: data.portfolio.contactEmail,
      phone: data.portfolio.phone,
      location: data.portfolio.location,
      websiteUrl,
      avatarUrl,
    },
  });

  // Helper to parse dates
  function toDateOrNull(value?: string | null): Date | null {
    if (!value) return null;
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }

  // Bulk create all related data (30 second timeout for large imports)
  await prisma.$transaction(
    async (tx) => {
      // Experiences
      await Promise.all(
        data.experiences.map((exp, idx) =>
          tx.experience.create({
            data: {
              portfolioId,
              company: exp.company,
              role: exp.role,
              description: exp.description || "",
              startDate: toDateOrNull(exp.startDate),
              endDate: toDateOrNull(exp.endDate),
              location: exp.location,
              sortOrder: idx,
            },
          })
        )
      );

      // Education
      await Promise.all(
        data.educations.map((edu, idx) =>
          tx.education.create({
            data: {
              portfolioId,
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field,
              startDate: toDateOrNull(edu.startDate),
              endDate: toDateOrNull(edu.endDate),
              gpa: edu.gpa,
              sortOrder: idx,
            },
          })
        )
      );

      // Skills
      await Promise.all(
        data.skills.map((skill, idx) =>
          tx.skill.create({
            data: {
              portfolioId,
              name: skill.name,
              category: skill.category || "General",
              level: skill.level,
              sortOrder: idx,
            },
          })
        )
      );

      // Projects
      await Promise.all(
        projects.map((proj, idx) =>
          tx.project.create({
            data: {
              portfolioId,
              title: proj.title,
              description: proj.description || "",
              imageUrl: proj.imageUrl,
              liveUrl: proj.liveUrl,
              sourceUrl: proj.sourceUrl,
              techStack: proj.techStack || [],
              featured: proj.featured ?? false,
              githubStars: proj.githubStars,
              githubForks: proj.githubForks,
              language: proj.language,
              sortOrder: idx,
            },
          })
        )
      );

      // Social profiles
      await Promise.all(
        socialProfiles.map((social) =>
          tx.socialProfile.create({
            data: {
              portfolioId,
              platform: social.platform,
              url: social.url,
              username: social.username,
              cachedStats: social.cachedStats as any,
            },
          })
        )
      );

      // Certifications
      await Promise.all(
        certifications.map((cert, idx) =>
          tx.certification.create({
            data: {
              portfolioId,
              name: cert.name,
              issuer: cert.issuer || "",
              issueDate: toDateOrNull(cert.issueDate),
              url: cert.url,
              sortOrder: idx,
            },
          })
        )
      );

      // Achievements
      await Promise.all(
        data.achievements.map((ach, idx) =>
          tx.achievement.create({
            data: {
              portfolioId,
              title: ach.title,
              date: toDateOrNull(ach.date),
              sortOrder: idx,
            },
          })
        )
      );

      // Custom sections
      await Promise.all(
        customSections.map((section, idx) =>
          tx.customSection.create({
            data: {
              portfolioId,
              sectionType: section.sectionType,
              label: section.label,
              items: section.items as any,
              sortOrder: idx,
            },
          })
        )
      );
    },
    {
      timeout: 30000, // 30 second timeout for large imports
    }
  );

  // Return updated portfolio
  return prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      experiences: { orderBy: { sortOrder: "asc" } },
      educations: { orderBy: { sortOrder: "asc" } },
      skills: { orderBy: { sortOrder: "asc" } },
      projects: { orderBy: { sortOrder: "asc" } },
      articles: { orderBy: { sortOrder: "asc" } },
      socialProfiles: true,
      certifications: { orderBy: { sortOrder: "asc" } },
      achievements: { orderBy: { sortOrder: "asc" } },
      customSections: { orderBy: { sortOrder: "asc" } },
    },
  });
}

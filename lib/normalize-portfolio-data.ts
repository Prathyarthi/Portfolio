import type { PortfolioData } from "@/features/templates/types";

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v);
}

function strOrNull(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/**
 * Coerce AI / resume output into a stable PortfolioData shape for Syntux bindings.
 * Avoids undefined arrays and achievement entries that break `$item.title` loops.
 */
export function normalizePortfolioData(raw: unknown): PortfolioData {
  const o = asRecord(raw) ?? {};
  const portfolio = asRecord(o.portfolio) ?? {};

  const experiences = (Array.isArray(o.experiences) ? o.experiences : []).map(
    (item, i) => {
      const e = asRecord(item) ?? {};
      return {
        id: str(e.id, `exp_${i}`),
        company: str(e.company),
        role: str(e.role),
        description: str(e.description),
        startDate: strOrNull(e.startDate),
        endDate: strOrNull(e.endDate),
        location: strOrNull(e.location),
      };
    },
  );

  const educations = (Array.isArray(o.educations) ? o.educations : []).map(
    (item, i) => {
      const e = asRecord(item) ?? {};
      return {
        id: str(e.id, `edu_${i}`),
        institution: str(e.institution),
        degree: str(e.degree),
        field: strOrNull(e.field),
        startDate: strOrNull(e.startDate),
        endDate: strOrNull(e.endDate),
        gpa: strOrNull(e.gpa),
      };
    },
  );

  const skills = (Array.isArray(o.skills) ? o.skills : []).map((item, i) => {
    const s = asRecord(item) ?? {};
    return {
      id: str(s.id, `skill_${i}`),
      name: str(s.name),
      category: str(s.category, "General") || "General",
      level: typeof s.level === "number" ? s.level : null,
    };
  });

  const projects = (Array.isArray(o.projects) ? o.projects : []).map(
    (item, i) => {
      const p = asRecord(item) ?? {};
      const tech = p.techStack ?? p.tech_stack;
      return {
        id: str(p.id, `proj_${i}`),
        title: str(p.title),
        description: str(p.description),
        imageUrl: strOrNull(p.imageUrl),
        liveUrl: strOrNull(p.liveUrl),
        sourceUrl: strOrNull(p.sourceUrl),
        techStack: Array.isArray(tech) ? tech.map((t) => String(t)) : [],
        featured: Boolean(p.featured),
        githubStars:
          typeof p.githubStars === "number" ? p.githubStars : null,
        githubForks:
          typeof p.githubForks === "number" ? p.githubForks : null,
        language: strOrNull(p.language),
      };
    },
  );

  const achievements = (Array.isArray(o.achievements) ? o.achievements : []).map(
    (item, i) => {
      if (typeof item === "string") {
        return { id: `ach_${i}`, title: item, date: null };
      }
      const a = asRecord(item) ?? {};
      return {
        id: str(a.id, `ach_${i}`),
        title: str(a.title ?? a.name ?? a.achievement),
        date: strOrNull(a.date),
      };
    },
  ).filter((a) => a.title.trim() !== "");

  const certifications = (
    Array.isArray(o.certifications) ? o.certifications : []
  ).map((item, i) => {
    const c = asRecord(item) ?? {};
    return {
      id: str(c.id, `cert_${i}`),
      name: str(c.name),
      issuer: str(c.issuer),
      issueDate: strOrNull(c.issueDate),
      url: strOrNull(c.url),
    };
  });

  const socialProfiles = (
    Array.isArray(o.socialProfiles) ? o.socialProfiles : []
  )
    .map((item) => {
      const s = asRecord(item) ?? {};
      const url = strOrNull(s.url);
      if (!url) return null;
      return {
        platform: str(s.platform, "unknown"),
        url,
        username: strOrNull(s.username),
        cachedStats:
          s.cachedStats && typeof s.cachedStats === "object"
            ? (s.cachedStats as Record<string, unknown>)
            : null,
      };
    })
    .filter((s): s is PortfolioData["socialProfiles"][number] => s !== null);

  const customSections = (
    Array.isArray(o.customSections) ? o.customSections : []
  ).map((item, i) => {
    const cs = asRecord(item) ?? {};
    return {
      id: str(cs.id, `cs_${i}`),
      sectionType: str(cs.sectionType ?? cs.section_type),
      label: str(cs.label),
      items: Array.isArray(cs.items)
        ? cs.items.filter(
            (entry): entry is Record<string, unknown> =>
              !!entry && typeof entry === "object" && !Array.isArray(entry),
          )
        : [],
    };
  });

  return {
    portfolio: {
      title: str(portfolio.title),
      headline: str(portfolio.headline),
      summary: str(portfolio.summary),
      avatarUrl: strOrNull(portfolio.avatarUrl),
      contactEmail: strOrNull(portfolio.contactEmail),
      phone: strOrNull(portfolio.phone),
      location: strOrNull(portfolio.location),
      websiteUrl: strOrNull(portfolio.websiteUrl),
      customization:
        portfolio.customization &&
        typeof portfolio.customization === "object" &&
        !Array.isArray(portfolio.customization)
          ? (portfolio.customization as PortfolioData["portfolio"]["customization"])
          : {},
    },
    experiences,
    educations,
    skills,
    projects,
    articles: Array.isArray(o.articles)
      ? o.articles.map((item, i) => {
          const a = asRecord(item) ?? {};
          return {
            id: str(a.id, `article_${i}`),
            title: str(a.title),
            description: str(a.description),
            url: str(a.url),
            tags: Array.isArray(a.tags) ? a.tags.map((t) => String(t)) : [],
            publishedAt: strOrNull(a.publishedAt),
            readTime: typeof a.readTime === "number" ? a.readTime : null,
          };
        })
      : [],
    socialProfiles,
    certifications,
    achievements,
    customSections,
    livePreviewProjectIds: Array.isArray(o.livePreviewProjectIds)
      ? o.livePreviewProjectIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}

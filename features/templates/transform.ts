import type { PortfolioData } from "./types";

export function portfolioToTemplateData(portfolio: any): PortfolioData {
  return {
    portfolio: {
      title: portfolio.title ?? "",
      headline: portfolio.headline ?? "",
      summary: portfolio.summary ?? "",
      avatarUrl: portfolio.avatarUrl ?? null,
      contactEmail: portfolio.contactEmail ?? null,
      phone: portfolio.phone ?? null,
      location: portfolio.location ?? null,
      websiteUrl: portfolio.websiteUrl ?? null,
      customization:
        typeof portfolio.customization === "object"
          ? portfolio.customization
          : {},
    },
    experiences: (portfolio.experiences ?? []).map((e: any) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      description: e.description,
      startDate:
        typeof e.startDate === "string"
          ? e.startDate
          : new Date(e.startDate).toISOString(),
      endDate: e.endDate
        ? typeof e.endDate === "string"
          ? e.endDate
          : new Date(e.endDate).toISOString()
        : null,
      location: e.location ?? null,
    })),
    educations: (portfolio.educations ?? []).map((e: any) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      field: e.field ?? null,
      startDate:
        typeof e.startDate === "string"
          ? e.startDate
          : new Date(e.startDate).toISOString(),
      endDate: e.endDate
        ? typeof e.endDate === "string"
          ? e.endDate
          : new Date(e.endDate).toISOString()
        : null,
      gpa: e.gpa ?? null,
    })),
    skills: (portfolio.skills ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category ?? "general",
      level: s.level ?? null,
    })),
    projects: (portfolio.projects ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl ?? null,
      liveUrl: p.liveUrl ?? null,
      sourceUrl: p.sourceUrl ?? null,
      techStack: p.techStack ?? [],
      featured: p.featured ?? false,
      githubStars: p.githubStars ?? null,
      githubForks: p.githubForks ?? null,
      language: p.language ?? null,
    })),
    socialProfiles: (portfolio.socialProfiles ?? []).map((s: any) => ({
      platform: s.platform,
      url: s.url,
      username: s.username ?? null,
      cachedStats: s.cachedStats ?? null,
    })),
    certifications: (portfolio.certifications ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate
        ? typeof c.issueDate === "string"
          ? c.issueDate
          : new Date(c.issueDate).toISOString()
        : null,
      url: c.url ?? null,
    })),
    achievements: (portfolio.achievements ?? []).map((a: any) => ({
      id: a.id,
      title: a.title,
      date: a.date
        ? typeof a.date === "string"
          ? a.date
          : new Date(a.date).toISOString()
        : null,
    })),
  };
}

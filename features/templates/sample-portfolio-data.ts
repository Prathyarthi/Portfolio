import type { PortfolioData } from "./types";

/** Shared demo content for template picker / landing previews. */
export const SAMPLE_PORTFOLIO_DATA: PortfolioData = {
  portfolio: {
    title: "Alex Morgan",
    headline: "Senior Product Designer",
    summary:
      "I design clear, human-centered products for teams that ship quickly without sacrificing craft.",
    avatarUrl: null,
    contactEmail: "alex@example.com",
    phone: null,
    location: "San Francisco, CA",
    websiteUrl: "https://example.com",
    customization: {
      navbar: {
        enabled: true,
        sections: { about: true, work: true, experience: true, profiles: true },
      },
      heroTagline: "Design systems · Product strategy · Prototyping",
    },
  },
  experiences: [
    {
      id: "sample-exp-1",
      company: "Northwind Labs",
      role: "Lead Product Designer",
      description:
        "Led end-to-end design for onboarding, dashboards, and a component library used by 40+ engineers.",
      startDate: "2022-01-01",
      endDate: null,
      location: "Remote",
    },
    {
      id: "sample-exp-2",
      company: "Acme Studio",
      role: "Product Designer",
      description:
        "Shipped marketing sites, design systems, and conversion experiments for SaaS clients.",
      startDate: "2019-06-01",
      endDate: "2021-12-01",
      location: "New York, NY",
    },
  ],
  educations: [
    {
      id: "sample-edu-1",
      institution: "State University",
      degree: "BFA",
      field: "Interaction Design",
      startDate: "2015-09-01",
      endDate: "2019-05-01",
      gpa: "3.8",
    },
  ],
  skills: [
    { id: "sample-skill-1", name: "Figma", category: "Design", level: 5 },
    { id: "sample-skill-2", name: "React", category: "Engineering", level: 4 },
    { id: "sample-skill-3", name: "Prototyping", category: "Design", level: 5 },
    { id: "sample-skill-4", name: "TypeScript", category: "Engineering", level: 4 },
    { id: "sample-skill-5", name: "Research", category: "Design", level: 4 },
  ],
  projects: [
    {
      id: "sample-proj-1",
      title: "Flowboard",
      description:
        "A collaborative whiteboard for async product teams with real-time cursors and comments.",
      imageUrl: null,
      liveUrl: null,
      sourceUrl: "https://github.com",
      techStack: ["Next.js", "Figma", "PostgreSQL"],
      featured: true,
      githubStars: 128,
      githubForks: 24,
      language: "TypeScript",
    },
    {
      id: "sample-proj-2",
      title: "Pulse Analytics",
      description:
        "Lightweight analytics dashboard for SaaS founders with weekly insight summaries.",
      imageUrl: null,
      liveUrl: null,
      sourceUrl: "https://github.com",
      techStack: ["React", "D3", "Tailwind"],
      featured: false,
      githubStars: 56,
      githubForks: 11,
      language: "TypeScript",
    },
  ],
  articles: [
    {
      id: "sample-article-1",
      title: "Designing for clarity at scale",
      description: "Notes on systems thinking for growing product teams.",
      url: "https://example.com",
      tags: ["Design", "Systems"],
      publishedAt: "2024-03-01",
      readTime: 6,
    },
  ],
  socialProfiles: [
    {
      platform: "github",
      url: "https://github.com",
      username: "alexmorgan",
      cachedStats: null,
    },
    {
      platform: "linkedin",
      url: "https://linkedin.com",
      username: "alexmorgan",
      cachedStats: null,
    },
  ],
  certifications: [
    {
      id: "sample-cert-1",
      name: "Google UX Design",
      issuer: "Google",
      issueDate: "2021-08-01",
      url: null,
    },
  ],
  achievements: [
    {
      id: "sample-ach-1",
      title: "Design Excellence Award",
      date: "2023-11-01",
    },
  ],
  customSections: [],
  livePreviewProjectIds: [],
};

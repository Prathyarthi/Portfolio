export interface PortfolioData {
  portfolio: {
    title: string;
    headline: string;
    summary: string;
    avatarUrl: string | null;
    contactEmail: string | null;
    phone: string | null;
    location: string | null;
    websiteUrl: string | null;
    customization: Record<string, unknown>;
  };
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    description: string;
    startDate: string;
    endDate: string | null;
    location: string | null;
  }>;
  educations: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string | null;
    startDate: string;
    endDate: string | null;
    gpa: string | null;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category: string;
    level: number | null;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    liveUrl: string | null;
    sourceUrl: string | null;
    techStack: string[];
    featured: boolean;
    githubStars: number | null;
    githubForks: number | null;
    language: string | null;
  }>;
  socialProfiles: Array<{
    platform: string;
    url: string;
    username: string | null;
    cachedStats: Record<string, unknown> | null;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string | null;
    url: string | null;
  }>;
}

export interface TemplateComponent {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  category: string;
  component: React.ComponentType<{ data: PortfolioData }>;
}

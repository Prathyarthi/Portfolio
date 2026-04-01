import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/features/templates/registry";
import { portfolioToTemplateData } from "@/features/templates/transform";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug, isPublished: true },
  });

  if (!portfolio) return {};

  return {
    title: portfolio.metaTitle || portfolio.title || "Portfolio",
    description: portfolio.metaDescription || portfolio.headline || "",
    openGraph: {
      title: portfolio.title,
      description: portfolio.headline,
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params;

  const portfolio = await prisma.portfolio.findUnique({
    where: { slug, isPublished: true },
    include: {
      experiences: { orderBy: { sortOrder: "asc" } },
      educations: { orderBy: { sortOrder: "asc" } },
      skills: { orderBy: { sortOrder: "asc" } },
      projects: { orderBy: { sortOrder: "asc" } },
      socialProfiles: true,
      certifications: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!portfolio) notFound();

  const template = getTemplate(portfolio.templateId);
  const TemplateComponent = template.component;
  const data = portfolioToTemplateData(portfolio);

  return <TemplateComponent data={data} />;
}

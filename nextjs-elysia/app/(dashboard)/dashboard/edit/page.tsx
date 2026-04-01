"use client";

import { usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PortfolioForm } from "@/features/portfolio/components/portfolio-form";
import { ExperienceForm } from "@/features/portfolio/components/experience-form";
import { EducationForm } from "@/features/portfolio/components/education-form";
import { SkillsEditor } from "@/features/portfolio/components/skills-editor";
import { ProjectForm } from "@/features/portfolio/components/project-form";
import { SocialLinksEditor } from "@/features/portfolio/components/social-links-editor";
import { PublishButton } from "@/features/portfolio/components/publish-button";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderKanban,
  Globe,
  Eye,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function EditPortfolioPage() {
  const { data: portfolio, isLoading } = usePortfolio();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Build your professional portfolio by filling in each section below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-9 w-[120px]" />
          ) : (
            <>
              {portfolio?.isPublished ? (
                <Badge
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
              {portfolio?.slug && (
                <ShareDialog
                  slug={portfolio.slug}
                  isPublished={portfolio.isPublished ?? false}
                >
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </ShareDialog>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/preview">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="basic" className="gap-1.5">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Basic Info</span>
            <span className="sm:hidden">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-1.5">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Experience</span>
            <span className="sm:hidden">Exp</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-1.5">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
            <span className="sm:hidden">Edu</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1.5">
            <Wrench className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-1.5">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Social Links</span>
            <span className="sm:hidden">Social</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <PortfolioForm />
          <Separator />
          <PublishButton />
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceForm />
        </TabsContent>

        <TabsContent value="education">
          <EducationForm />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsEditor />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectForm />
        </TabsContent>

        <TabsContent value="social">
          <SocialLinksEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Share2, User, Briefcase, GraduationCap, Wrench, FolderKanban, Globe, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { useCreatePortfolio, usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { EducationForm } from "@/features/portfolio/components/education-form";
import { ExperienceForm } from "@/features/portfolio/components/experience-form";
import { PortfolioForm } from "@/features/portfolio/components/portfolio-form";
import { ProjectForm } from "@/features/portfolio/components/project-form";
import { SocialLinksEditor } from "@/features/portfolio/components/social-links-editor";
import { AchievementForm } from "@/features/portfolio/components/achievement-form";
import { PublishButton } from "@/features/portfolio/components/publish-button";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";
import { SkillsEditor } from "@/features/portfolio/components/skills-editor";

const STEPS = [
  { value: "basic", label: "Basic Info", short: "Basic", icon: User },
  { value: "experience", label: "Experience", short: "Exp", icon: Briefcase },
  { value: "education", label: "Education", short: "Edu", icon: GraduationCap },
  { value: "skills", label: "Skills", short: "Skills", icon: Wrench },
  { value: "projects", label: "Projects", short: "Projects", icon: FolderKanban },
  { value: "social", label: "Social Links", short: "Social", icon: Globe },
] as const;

type StepValue = (typeof STEPS)[number]["value"];

export default function EditPortfolioPage() {
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const [activeStep, setActiveStep] = useState<StepValue>("basic");

  const activeIndex = useMemo(
    () => STEPS.findIndex((step) => step.value === activeStep),
    [activeStep]
  );

  const goPrevious = () => {
    if (activeIndex <= 0) {
      router.push("/dashboard");
      return;
    }
    setActiveStep(STEPS[activeIndex - 1].value);
  };

  const goNext = () => {
    if (activeIndex < STEPS.length - 1) {
      setActiveStep(STEPS[activeIndex + 1].value);
      return;
    }
    router.push("/dashboard/templates");
  };

  const handleCreatePortfolio = async () => {
    try {
      await createPortfolio.mutateAsync();
      toast.success("Portfolio created");
    } catch {
      toast.error("Failed to create portfolio");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-112 w-full rounded-[2rem]" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-112 w-full rounded-[2rem]" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="space-y-6">
        <Card className="glass-card rounded-[2rem] border-white/8 bg-white/3">
          <CardHeader>
            <CardTitle className="text-zinc-100">Create your portfolio first</CardTitle>
            <CardDescription className="text-zinc-400">
              A portfolio needs to exist before you can edit sections, choose a template, or preview it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={handleCreatePortfolio} disabled={createPortfolio.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Overview</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Portfolio</h1>
          <p className="mt-1 text-muted-foreground">
            Build your professional portfolio by filling in each section below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {portfolio.isPublished ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              Published
            </Badge>
          ) : (
            <Badge variant="secondary">Draft</Badge>
          )}
          {portfolio.slug && (
            <ShareDialog slug={portfolio.slug} isPublished={portfolio.isPublished ?? false}>
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
        </div>
      </div>

      <Separator />

      <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as StepValue)} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <TabsTrigger key={step.value} value={step.value} className="gap-1.5">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </TabsTrigger>
            );
          })}
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
          <TabsTrigger value="achievements" className="gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Awards</span>
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

        <TabsContent value="achievements">
          <AchievementForm />
        </TabsContent>
      </Tabs>

      <FlowFooter
        previous={
          activeIndex <= 0
            ? { href: "/dashboard", label: "Back to Overview" }
            : { label: "Previous", onClick: goPrevious }
        }
        next={{
          label: activeIndex === STEPS.length - 1 ? "Next: Templates" : "Next",
          onClick: goNext,
        }}
      />
    </div>
  );
}

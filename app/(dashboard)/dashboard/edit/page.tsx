"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { CreatePortfolioPrompt } from "@/features/portfolio/components/create-portfolio-prompt";
import { EditStepContent } from "@/features/portfolio/components/edit-step-content";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";
import { EDIT_STEPS, type EditStepValue } from "@/features/portfolio/constants/edit-steps";

export default function EditPortfolioPage() {
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();
  const [activeStep, setActiveStep] = useState<EditStepValue>("basic");

  const activeIndex = useMemo(
    () => EDIT_STEPS.findIndex((step) => step.value === activeStep),
    [activeStep]
  );

  const goPrevious = () => {
    if (activeIndex <= 0) {
      router.push("/dashboard");
      return;
    }
    setActiveStep(EDIT_STEPS[activeIndex - 1].value);
  };

  const goNext = () => {
    if (activeIndex < EDIT_STEPS.length - 1) {
      setActiveStep(EDIT_STEPS[activeIndex + 1].value);
      return;
    }
    router.push("/dashboard/templates");
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
              Choose a subdomain, then you can edit sections, pick a template, and preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CreatePortfolioPrompt />
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
            Build your portfolio here, or scan a PDF resume on Import to pre-fill
            sections.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {portfolio.isPublished ? (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              Published
            </Badge>
          ) : (
            <Badge variant="secondary">Draft</Badge>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/import">
              <FileText className="mr-2 h-4 w-4" />
              Import resume (PDF)
            </Link>
          </Button>
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

      <Tabs value={activeStep} onValueChange={(value) => setActiveStep(value as EditStepValue)} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          {EDIT_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <TabsTrigger key={step.value} value={step.value} className="gap-1.5">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.short}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {EDIT_STEPS.map((step) => (
          <TabsContent key={step.value} value={step.value} className="space-y-6">
            <EditStepContent step={step.value} />
          </TabsContent>
        ))}
      </Tabs>

      <FlowFooter
        previous={
          activeIndex <= 0
            ? { href: "/dashboard", label: "Back to Overview" }
            : { label: "Previous", onClick: goPrevious }
        }
        next={{
          label: activeIndex === EDIT_STEPS.length - 1 ? "Next: Templates" : "Next",
          onClick: goNext,
        }}
      />
    </div>
  );
}

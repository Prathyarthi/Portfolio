"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Share2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { CreatePortfolioPrompt } from "@/features/portfolio/components/create-portfolio-prompt";
import { EditStepContent } from "@/features/portfolio/components/edit-step-content";
import {
  EditStepProgressBar,
  EditStepTracker,
} from "@/features/portfolio/components/edit-step-tracker";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";
import {
  EDIT_STEP_DESCRIPTIONS,
  EDIT_STEPS,
  type EditStepValue,
} from "@/features/portfolio/constants/edit-steps";

export default function EditPortfolioPage() {
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();
  const [activeStep, setActiveStep] = useState<EditStepValue>("basic");

  const activeIndex = useMemo(
    () => EDIT_STEPS.findIndex((step) => step.value === activeStep),
    [activeStep]
  );

  const currentStep = EDIT_STEPS[activeIndex];

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
        <Skeleton className="h-112 w-full max-w-3xl rounded-[2rem]" />
        <Skeleton className="h-14 w-full max-w-3xl rounded-2xl" />
        <Skeleton className="h-112 w-full max-w-3xl rounded-[2rem]" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card className="p-2">
          <CardHeader>
            <CardTitle className="text-h3 text-text-primary">
              Create your portfolio first
            </CardTitle>
            <CardDescription className="text-body-sm text-text-secondary">
              Create your portfolio first, then you can edit sections, pick a template, and preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
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
    <div className="flex flex-col lg:h-[calc(100svh-4rem-3rem)] lg:max-h-[calc(100svh-4rem-3rem)] lg:overflow-hidden">
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-h2 text-text-primary">Edit portfolio</h1>
            <p className="mt-1 max-w-2xl text-body-sm text-text-secondary">
              Work through one section at a time. Use the progress tracker on the
              right to jump between steps.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {portfolio.isPublished ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="neutral">Draft</Badge>
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
      </div>

      <div className="grid min-h-0 w-full flex-1 grid-cols-1 pt-6 lg:grid-cols-[1fr_auto] lg:gap-12 lg:overflow-hidden xl:gap-20">
        <div className="min-h-0 overflow-y-auto overscroll-contain pb-6 pr-1">
          <div className="mx-auto w-full max-w-3xl">
          <EditStepProgressBar activeStep={activeStep} />

          <div className="mb-6">
            <p className="eyebrow hidden lg:block">
              Step {activeIndex + 1} of {EDIT_STEPS.length}
            </p>
            <h2 className="mt-1 text-h3 text-text-primary">{currentStep.label}</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              {EDIT_STEP_DESCRIPTIONS[activeStep]}
            </p>
          </div>

          <EditStepContent step={activeStep} />

          <FlowFooter
            message={null}
            previous={
              activeIndex <= 0
                ? { href: "/dashboard", label: "Back to Overview" }
                : { label: "Previous", onClick: goPrevious }
            }
            next={{
              label:
                activeIndex === EDIT_STEPS.length - 1
                  ? "Next: Templates"
                  : "Next section",
              onClick: goNext,
            }}
          />
          </div>
        </div>

        <aside className="hidden shrink-0 self-start lg:block lg:w-56 lg:pr-2 xl:w-64 xl:pr-4">
          <EditStepTracker
            activeStep={activeStep}
            onStepChange={setActiveStep}
            portfolio={portfolio}
          />
        </aside>
      </div>
    </div>
  );
}

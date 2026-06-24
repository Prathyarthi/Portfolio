"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Share2, Globe, Monitor, Smartphone, BarChart3, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import {
  usePortfolio,
  usePublishPortfolio,
  useUpdateTemplate,
} from "@/features/portfolio/api/use-portfolio";
import { CreatePortfolioPrompt } from "@/features/portfolio/components/create-portfolio-prompt";
import {
  PreviewEditSidebar,
  PreviewEditToggle,
} from "@/features/portfolio/components/preview-edit-sidebar";
import { PublishDialog } from "@/features/portfolio/components/publish-dialog";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";
import { getTemplate, templateRegistry } from "@/features/templates/registry";
import { portfolioToTemplateData } from "@/features/templates/transform";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PreviewPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const updateTemplate = useUpdateTemplate();
  const publishPortfolio = usePublishPortfolio();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [allowedTemplateIds, setAllowedTemplateIds] = useState<string[] | null>(
    null
  );
  const isMobile = useIsMobile();
  const [editOpen, setEditOpen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  useEffect(() => {
    setEditOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    let cancelled = false;
    const loadAccess = async () => {
      try {
        const res = await fetch("/api/billing/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as {
          access?: { allowedTemplateIds?: string[] };
        };
        if (cancelled) return;
        setAllowedTemplateIds(data.access?.allowedTemplateIds ?? null);
      } catch {
        if (cancelled) return;
        setAllowedTemplateIds(null);
      }
    };
    loadAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      previewTemplate &&
      allowedTemplateIds &&
      !allowedTemplateIds.includes(previewTemplate)
    ) {
      setPreviewTemplate("minimal");
    }
  }, [allowedTemplateIds, previewTemplate]);

  const handleTemplatePreview = (next: string) => {
    if (allowedTemplateIds && !allowedTemplateIds.includes(next)) {
      toast.error("Your free month has ended. Upgrade to Pro to unlock this template.");
      return;
    }
    setPreviewTemplate(next);
  };

  const savedTemplateId = portfolio?.templateId ?? "minimal";

  const handleTemplateSave = async () => {
    const templateToSave = previewTemplate ?? savedTemplateId;
    if (templateToSave === savedTemplateId) return;

    try {
      await updateTemplate.mutateAsync(templateToSave);
      setPreviewTemplate(null);
      const appliedName = getTemplate(templateToSave).name;
      if (portfolio?.isPublished) {
        toast.success(`${appliedName} is now live on your portfolio`);
      } else {
        toast.success(`${appliedName} template applied`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    }
  };

  const handlePublishClick = async () => {
    if (!portfolio) return;

    if (previewTemplate && previewTemplate !== savedTemplateId) return;

    if (portfolio.isPublished) {
      try {
        await publishPortfolio.mutateAsync(false);
        toast.success("Portfolio unpublished");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update publish status",
        );
      }
      return;
    }

    setPublishDialogOpen(true);
  };

  const templateOptions = useMemo(() => Object.values(templateRegistry), []);

  const isTemplateLocked = (templateId: string) =>
    allowedTemplateIds ? !allowedTemplateIds.includes(templateId) : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card className="p-2">
          <CardHeader>
            <CardTitle className="text-h3 text-text-primary">
              Create your portfolio before previewing it
            </CardTitle>
            <CardDescription className="text-body-sm text-text-secondary">
              Preview depends on your saved portfolio content. Create the portfolio first, then continue through the flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <CreatePortfolioPrompt />
            <Button variant="outline" asChild>
              <Link href="/dashboard/import">Back to Import</Link>
            </Button>
          </CardContent>
        </Card>

        <FlowFooter
          previous={{ href: "/dashboard/import", label: "Previous: Import" }}
        />
      </div>
    );
  }

  const effectiveTemplate = previewTemplate ?? portfolio.templateId ?? "minimal";
  const templateId =
    allowedTemplateIds && !allowedTemplateIds.includes(effectiveTemplate)
      ? "minimal"
      : effectiveTemplate;
  const hasUnsavedTemplate =
    templateId !== (portfolio.templateId ?? "minimal");
  const template = getTemplate(templateId);
  const TemplateComponent = template.component;
  const liveTemplate = getTemplate(savedTemplateId);
  const data = portfolioToTemplateData(portfolio);

  const isPublished = portfolio.isPublished ?? false;
  const slug = portfolio.slug ?? "";

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-4 xl:h-[calc(100dvh-4rem-3rem)] xl:min-h-0 xl:flex-row xl:overflow-hidden">
      <div className="min-w-0 w-full flex-1 space-y-4 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
        <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] glass-panel p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 px-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  hasUnsavedTemplate && isPublished
                    ? "bg-warning"
                    : isPublished
                      ? "bg-success"
                      : "bg-text-muted"
                )}
                aria-hidden
              />
              <span className="text-body-sm font-medium text-text-primary">
                {hasUnsavedTemplate
                  ? `Previewing ${template.name}`
                  : isPublished
                    ? `${liveTemplate.name} is live`
                    : "Portfolio builder"}
              </span>
            </div>
            {hasUnsavedTemplate && isPublished ? (
              <p className="mt-1 pl-4 text-xs text-text-muted">
                Your live site still uses {liveTemplate.name}. Apply this template to switch.
              </p>
            ) : hasUnsavedTemplate ? (
              <p className="mt-1 pl-4 text-xs text-text-muted">
                Apply this template before publishing.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Device toggle */}
            <div
              className="flex items-center gap-1 rounded-[var(--radius-md)] bg-surface-sunken p-0.5"
              role="group"
              aria-label="Preview device"
            >
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Desktop preview"
                aria-pressed={device === "desktop"}
                onClick={() => setDevice("desktop")}
                className={cn(device === "desktop" && "bg-surface-base text-brand-primary")}
              >
                <Monitor className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Mobile preview"
                aria-pressed={device === "mobile"}
                onClick={() => setDevice("mobile")}
                className={cn(device === "mobile" && "bg-surface-base text-brand-primary")}
              >
                <Smartphone className="h-4 w-4" aria-hidden />
              </Button>
            </div>
            <PreviewEditToggle open={editOpen} onOpenChange={setEditOpen} />
            {hasUnsavedTemplate ? (
              <Button
                type="button"
                size="sm"
                onClick={() => void handleTemplateSave()}
                disabled={updateTemplate.isPending}
                className="bg-success text-white hover:bg-success/90"
              >
                {updateTemplate.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {isPublished ? `Apply ${template.name}` : `Use ${template.name}`}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant={isPublished ? "outline" : "default"}
                onClick={() => void handlePublishClick()}
                disabled={
                  publishPortfolio.isPending || (!isPublished && !slug)
                }
                className={
                  isPublished
                    ? undefined
                    : "bg-success text-white hover:bg-success/90"
                }
              >
                {publishPortfolio.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                {isPublished ? "Unpublish" : "Publish"}
              </Button>
            )}
            {isPublished && !hasUnsavedTemplate && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/dashboard/analytics">
                  <BarChart3 className="mr-2 h-3 w-3" />
                  Analytics
                </Link>
              </Button>
            )}
            {slug && (
              <ShareDialog slug={slug} isPublished={isPublished}>
                <Button variant="outline" size="sm">
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </ShareDialog>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-surface-sunken p-3 shadow-[var(--shadow-modal)]">
          <div
            className={cn(
              "mx-auto min-w-0 overflow-x-auto rounded-[var(--radius-md)] bg-surface-base transition-[max-width] duration-200 ease-[var(--ease-out)]",
              device === "mobile" ? "max-w-[390px]" : "w-full max-w-full"
            )}
          >
            <div className="min-w-0">
              <TemplateComponent data={data} />
            </div>
          </div>
        </div>

        <FlowFooter
          previous={{ href: "/dashboard/import", label: "Previous: Import" }}
        />

        <PublishDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          currentSlug={slug}
        />
      </div>

      <PreviewEditSidebar 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        templateId={templateId}
        savedTemplateId={portfolio.templateId ?? "minimal"}
        isPublished={isPublished}
        hasUnsavedTemplate={hasUnsavedTemplate}
        isSavingTemplate={updateTemplate.isPending}
        onTemplateChange={handleTemplatePreview}
        onTemplateSave={handleTemplateSave}
        templateOptions={templateOptions}
        isTemplateLocked={isTemplateLocked}
      />
    </div>
  );
}

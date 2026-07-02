"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
import { CreatePortfolioPrompt, PORTFOLIO_ACTION_BUTTON_CLASS } from "@/features/portfolio/components/create-portfolio-prompt";
import {
  PreviewEditSidebar,
} from "@/features/portfolio/components/preview-edit-sidebar";
import { PreviewToolbar } from "@/features/portfolio/components/preview-toolbar";
import { PublishDialog } from "@/features/portfolio/components/publish-dialog";
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
        <Card>
          <CardHeader>
            <CardTitle className="text-h3 text-text-primary">
              Create your portfolio before previewing it
            </CardTitle>
            <CardDescription className="text-body-sm text-text-secondary">
              Preview depends on your saved portfolio content. Create the portfolio first, then continue through the flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CreatePortfolioPrompt />
            <Button variant="outline" className={PORTFOLIO_ACTION_BUTTON_CLASS} asChild>
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

  const panelProps = {
    templateId,
    savedTemplateId: portfolio.templateId ?? "minimal",
    isPublished,
    hasUnsavedTemplate,
    isSavingTemplate: updateTemplate.isPending,
    onTemplateChange: handleTemplatePreview,
    onTemplateSave: handleTemplateSave,
    templateOptions,
    isTemplateLocked,
  };

  return (
    <div className="flex min-h-0 w-full max-w-full flex-col gap-4 lg:h-[calc(100dvh-4rem)] lg:min-h-0 lg:flex-row lg:overflow-hidden">
      <PreviewEditSidebar
        open={editOpen}
        onOpenChange={setEditOpen}
        {...panelProps}
      />

      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4 lg:overflow-hidden">
        <div className="flex shrink-0 flex-col gap-3 rounded-[var(--radius-lg)] glass-panel p-3 lg:flex-row lg:items-start lg:justify-between xl:items-center">
          <div className="min-w-0 flex-1 px-2">
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
          <PreviewToolbar
            device={device}
            onDeviceChange={setDevice}
            editOpen={editOpen}
            onEditOpenChange={setEditOpen}
            hasUnsavedTemplate={hasUnsavedTemplate}
            isPublished={isPublished}
            templateName={template.name}
            isSavingTemplate={updateTemplate.isPending}
            onTemplateSave={() => void handleTemplateSave()}
            isPublishing={publishPortfolio.isPending}
            onPublishClick={() => void handlePublishClick()}
            slug={slug}
            showAnalytics={isPublished && !hasUnsavedTemplate}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-surface-sunken p-2 shadow-[var(--shadow-modal)] sm:p-3">
          <div
            className={cn(
              "@container mx-auto min-h-0 min-w-0 w-full flex-1 overflow-x-clip overflow-y-auto rounded-[var(--radius-md)] bg-surface-base transition-[max-width] duration-200 ease-[var(--ease-out)]",
              device === "mobile" ? "max-w-[390px] px-1" : "max-w-full"
            )}
          >
            <div className="min-w-0 overflow-x-clip">
              <TemplateComponent data={data} />
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <FlowFooter
            previous={{ href: "/dashboard/import", label: "Previous: Import" }}
          />
        </div>

        <PublishDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          currentSlug={slug}
        />
      </div>
    </div>
  );
}

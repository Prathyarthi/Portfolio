"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Share2, Globe } from "lucide-react";
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

  const handleTemplateChange = async (next: string) => {
    if (allowedTemplateIds && !allowedTemplateIds.includes(next)) {
      toast.error("Your free month has ended. Upgrade to Pro to unlock this template.");
      return;
    }
    setPreviewTemplate(next);
    if (next === portfolio?.templateId) return;
    try {
      await updateTemplate.mutateAsync(next);
      toast.success("Template updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update template");
    }
  };

  const handlePublishToggle = async (next: boolean) => {
    if (next && !portfolio?.slug) {
      toast.error("Choose a subdomain in the Publish step before going live");
      return;
    }

    try {
      await publishPortfolio.mutateAsync(next);
      toast.success(next ? "Portfolio published" : "Portfolio unpublished");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update publish status",
      );
    }
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
      <div className="space-y-6">
        <Card className="glass-card rounded-[2rem] border border-white/8 bg-white/3">
          <CardHeader>
            <CardTitle className="text-zinc-100">Create your portfolio before previewing it</CardTitle>
            <CardDescription className="text-zinc-400">
              Preview depends on your saved portfolio content. Create the portfolio first, then continue through the flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
  const template = getTemplate(templateId);
  const TemplateComponent = template.component;
  const data = portfolioToTemplateData(portfolio);

  const isPublished = portfolio.isPublished ?? false;
  const slug = portfolio.slug ?? "";

  return (
    <div className="flex gap-0">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="glass-card flex flex-col gap-4 rounded-2xl border border-white/8 p-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">Portfolio Builder</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PreviewEditToggle open={editOpen} onOpenChange={setEditOpen} />
            <Button
              type="button"
              size="sm"
              variant={isPublished ? "outline" : "default"}
              onClick={() => handlePublishToggle(!isPublished)}
              disabled={publishPortfolio.isPending || (!isPublished && !slug)}
              className={
                isPublished
                  ? "rounded-full border-white/8 bg-white/4 text-zinc-200 h-8 text-xs"
                  : "rounded-full bg-emerald-500 text-white hover:bg-emerald-600 h-8 text-xs"
              }
            >
              {publishPortfolio.isPending ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Globe className="mr-2 h-3 w-3" />
              )}
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
            {slug && (
              <ShareDialog slug={slug} isPublished={isPublished}>
                <Button variant="outline" size="sm" className="rounded-full border-white/8 bg-white/4 h-8 text-xs">
                  <Share2 className="mr-2 h-3 w-3" />
                  Share
                </Button>
              </ShareDialog>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-[1.75rem] border border-white/8 bg-black/10 shadow-2xl">
          <TemplateComponent data={data} />
        </div>

        <FlowFooter
          previous={{ href: "/dashboard/import", label: "Previous: Import" }}
        />
      </div>

      <PreviewEditSidebar 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        templateId={templateId}
        onTemplateChange={handleTemplateChange}
        templateOptions={templateOptions}
        isTemplateLocked={isTemplateLocked}
      />
    </div>
  );
}

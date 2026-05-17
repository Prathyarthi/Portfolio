"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Share2, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCreatePortfolio,
  usePortfolio,
  usePublishPortfolio,
  useUpdateTemplate,
} from "@/features/portfolio/api/use-portfolio";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";
import { getTemplate, templateRegistry } from "@/features/templates/registry";
import { portfolioToTemplateData } from "@/features/templates/transform";

export default function PreviewPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const updateTemplate = useUpdateTemplate();
  const publishPortfolio = usePublishPortfolio();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [allowedTemplateIds, setAllowedTemplateIds] = useState<string[] | null>(
    null
  );

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

  const handleCreatePortfolio = async () => {
    try {
      await createPortfolio.mutateAsync();
      toast.success("Portfolio created");
    } catch {
      toast.error("Failed to create portfolio");
    }
  };

  const handleTemplateChange = async (next: string) => {
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
    try {
      await publishPortfolio.mutateAsync(next);
      toast.success(next ? "Portfolio published" : "Portfolio unpublished");
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  const templateOptions = useMemo(
    () =>
      Object.values(templateRegistry).filter((templateInfo) =>
        allowedTemplateIds ? allowedTemplateIds.includes(templateInfo.id) : true
      ),
    [allowedTemplateIds]
  );

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
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={handleCreatePortfolio} disabled={createPortfolio.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
            </Button>
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
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-4 rounded-[2rem] border border-white/8 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">Preview</p>
          <h1 className="mt-2 text-3xl font-bold">Review your public page</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={templateId} onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-48 rounded-full border-white/8 bg-white/4">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant={isPublished ? "outline" : "default"}
            onClick={() => handlePublishToggle(!isPublished)}
            disabled={publishPortfolio.isPending}
            className={
              isPublished
                ? "rounded-full border-white/8 bg-white/4 text-zinc-200"
                : "rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
            }
          >
            {publishPortfolio.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Globe className="mr-2 h-4 w-4" />
            )}
            {isPublished ? "Unpublish" : "Publish"}
          </Button>
          {slug && (
            <ShareDialog slug={slug} isPublished={isPublished}>
              <Button variant="outline" size="sm" className="rounded-full border-white/8 bg-white/4">
                <Share2 className="mr-2 h-4 w-4" />
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
  );
}

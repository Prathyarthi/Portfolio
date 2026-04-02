"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePortfolio, usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { getTemplate, templateRegistry } from "@/features/templates/registry";
import { portfolioToTemplateData } from "@/features/templates/transform";

export default function PreviewPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

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

  const templateId = previewTemplate ?? portfolio.templateId ?? "minimal";
  const template = getTemplate(templateId);
  const TemplateComponent = template.component;
  const data = portfolioToTemplateData(portfolio);

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-4 rounded-[2rem] border border-white/8 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">Preview</p>
          <h1 className="mt-2 text-3xl font-bold">Review your public page</h1>
        </div>
        <Select value={templateId} onValueChange={setPreviewTemplate}>
          <SelectTrigger className="w-48 rounded-full border-white/8 bg-white/4">
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(templateRegistry).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

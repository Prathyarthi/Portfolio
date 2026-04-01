"use client";

import { usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { templateRegistry, getTemplate } from "@/features/templates/registry";
import { portfolioToTemplateData } from "@/features/templates/transform";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function PreviewPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!portfolio) {
    return <p className="text-muted-foreground">No portfolio found.</p>;
  }

  const templateId = previewTemplate ?? portfolio.templateId ?? "minimal";
  const template = getTemplate(templateId);
  const TemplateComponent = template.component;
  const data = portfolioToTemplateData(portfolio);

  return (
    <div className="space-y-4">
      <div className="glass-card flex items-center justify-between rounded-[2rem] border border-white/8 p-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            Preview
          </p>
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
    </div>
  );
}

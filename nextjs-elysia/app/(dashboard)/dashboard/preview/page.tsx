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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Preview</h1>
        <Select value={templateId} onValueChange={setPreviewTemplate}>
          <SelectTrigger className="w-48">
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
      <div className="border rounded-lg overflow-hidden bg-white">
        <TemplateComponent data={data} />
      </div>
    </div>
  );
}

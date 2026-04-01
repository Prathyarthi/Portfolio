"use client";

import {
  usePortfolio,
  useUpdateTemplate,
} from "@/features/portfolio/api/use-portfolio";
import { templateRegistry } from "@/features/templates/registry";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

export default function TemplatesPage() {
  const { data: portfolio } = usePortfolio();
  const updateTemplate = useUpdateTemplate();

  const currentTemplate = portfolio?.templateId ?? "minimal";

  const handleSelect = (templateId: string) => {
    updateTemplate.mutate(templateId, {
      onSuccess: () => toast.success(`Template changed to ${templateId}`),
      onError: () => toast.error("Failed to change template"),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Choose a Template</h1>
        <p className="text-muted-foreground mt-1">
          Select a template for your portfolio. You can change it anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(templateRegistry).map((template) => {
          const isActive = currentTemplate === template.id;
          return (
            <Card
              key={template.id}
              className={`relative overflow-hidden transition-all ${
                isActive
                  ? "ring-2 ring-primary"
                  : "hover:ring-1 hover:ring-border"
              }`}
            >
              <div className="aspect-[4/3] bg-muted flex items-center justify-center border-b">
                <div className="text-center p-4">
                  <p className="text-4xl mb-2">
                    {template.id === "minimal" && "🎯"}
                    {template.id === "modern" && "🎨"}
                    {template.id === "developer" && "💻"}
                    {template.id === "creative" && "🌈"}
                    {template.id === "corporate" && "💼"}
                  </p>
                  <p className="text-sm text-muted-foreground">{template.name} Preview</p>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{template.description}</CardDescription>
                <Button
                  className="w-full"
                  variant={isActive ? "secondary" : "default"}
                  disabled={updateTemplate.isPending}
                  onClick={() => handleSelect(template.id)}
                >
                  {updateTemplate.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : isActive ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Active
                    </>
                  ) : (
                    "Use Template"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

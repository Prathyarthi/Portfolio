"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { useCreatePortfolio, usePortfolio, useUpdateTemplate } from "@/features/portfolio/api/use-portfolio";
import { templateRegistry } from "@/features/templates/registry";

function TemplatePreview({ templateId }: { templateId: string }) {
  const theme: Record<string, string> = {
    minimal: "from-stone-100 to-stone-200",
    modern: "from-violet-500/50 to-cyan-400/40",
    developer: "from-green-500/40 to-emerald-400/30",
    creative: "from-pink-500/40 to-orange-400/30",
    corporate: "from-sky-500/40 to-slate-300/30",
  };

  return (
    <div className={`aspect-4/3 rounded-3xl bg-linear-to-br ${theme[templateId] ?? theme.minimal} p-4`}>
      <div className="h-full rounded-2xl border border-white/20 bg-black/10 p-4">
        <div className="h-3 w-24 rounded-full bg-white/40" />
        <div className="mt-4 h-16 rounded-2xl bg-white/15" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-16 rounded-2xl bg-white/15" />
          <div className="h-16 rounded-2xl bg-white/15" />
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const updateTemplate = useUpdateTemplate();
  const currentTemplate = portfolio?.templateId ?? "minimal";

  const handleSelect = (templateId: string) => {
    updateTemplate.mutate(templateId, {
      onSuccess: () => toast.success(`Template changed to ${templateId}`),
      onError: () => toast.error("Failed to change template"),
    });
  };

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
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="space-y-6">
        <Card className="glass-card rounded-[2rem] border border-white/8 bg-white/3">
          <CardHeader>
            <CardTitle className="text-zinc-100">Create your portfolio before choosing a template</CardTitle>
            <CardDescription className="text-zinc-400">
              The template controls the look and feel of your portfolio. Create the portfolio first so the selection can be saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={handleCreatePortfolio} disabled={createPortfolio.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/edit">Back to Edit</Link>
            </Button>
          </CardContent>
        </Card>

        <FlowFooter
          previous={{ href: "/dashboard/edit", label: "Back to Edit" }}
          next={{ label: "Next: Import Data", onClick: () => router.push("/dashboard/import") }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <div className="glass-card rounded-[2rem] border border-white/8 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">Templates</p>
        <h1 className="mt-3 text-3xl font-bold">Choose a presentation system</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick the visual language that best fits your work. Content stays the same while layout, rhythm, and tone shift with the template.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(templateRegistry).map((template) => {
          const isActive = currentTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={`glass-card relative overflow-hidden rounded-[1.75rem] border-white/8 bg-white/3 transition-all ${isActive ? "ring-2 ring-primary" : "hover:-translate-y-1 hover:ring-1 hover:ring-border"
                }`}
            >
              <div className="border-b border-white/8 p-4">
                <TemplatePreview templateId={template.id} />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-zinc-100">{template.name}</CardTitle>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={!isActive ? "bg-white/6 text-zinc-300" : undefined}
                  >
                    {template.category}
                  </Badge>
                </div>
                <CardDescription className="text-zinc-400">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant={isActive ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => handleSelect(template.id)}
                  disabled={updateTemplate.isPending}
                >
                  {isActive ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Current Template
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

      <FlowFooter
        previous={{ href: "/dashboard/edit", label: "Previous: Edit" }}
        next={{ href: "/dashboard/import", label: "Next: Import Data" }}
      />
    </div>
  );
}
/*
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { useCreatePortfolio, usePortfolio, useUpdateTemplate } from "@/features/portfolio/api/use-portfolio";
import { templateRegistry } from "@/features/templates/registry";

function TemplatePreview({ templateId }: { templateId: string }) {
  const theme: Record<string, string> = {
    minimal: "from-stone-100 to-stone-200",
    modern: "from-violet-500/50 to-cyan-400/40",
    developer: "from-green-500/40 to-emerald-400/30",
    creative: "from-pink-500/40 to-orange-400/30",
    corporate: "from-sky-500/40 to-slate-300/30",
  };

  return (
    <div className={`aspect-4/3 rounded-3xl bg-linear-to-br ${theme[templateId] ?? theme.minimal} p-4`}>
      <div className="h-full rounded-2xl border border-white/20 bg-black/10 p-4">
        <div className="h-3 w-24 rounded-full bg-white/40" />
        <div className="mt-4 h-16 rounded-2xl bg-white/15" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-16 rounded-2xl bg-white/15" />
          <div className="h-16 rounded-2xl bg-white/15" />
        </div>
      </div>
    </div>
  );
}
export default function TemplatesPage() {
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const updateTemplate = useUpdateTemplate();
  const currentTemplate = portfolio?.templateId ?? "minimal";

  const handleSelect = (templateId: string) => {
    updateTemplate.mutate(templateId, {
      onSuccess: () => toast.success(`Template changed to ${templateId}`),
      onError: () => toast.error("Failed to change template"),
    });
  };

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
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="space-y-6">
        <Card className="glass-card rounded-[2rem] border border-white/8 bg-white/3">
          <CardHeader>
            <CardTitle className="text-zinc-100">Create your portfolio before choosing a template</CardTitle>
            <CardDescription className="text-zinc-400">
              The template controls the look and feel of your portfolio. Create the portfolio first so the selection can be saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={handleCreatePortfolio} disabled={createPortfolio.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/edit">Back to Edit</Link>
            </Button>
          </CardContent>
        </Card>

        <FlowFooter
          previous={{ href: "/dashboard/edit", label: "Back to Edit" }}
          next={{ label: "Next: Import Data", onClick: () => router.push("/dashboard/import") }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <div className="glass-card rounded-[2rem] border border-white/8 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">Templates</p>
        <h1 className="mt-3 text-3xl font-bold">Choose a presentation system</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick the visual language that best fits your work. Content stays the same while layout, rhythm, and tone shift with the template.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(templateRegistry).map((template) => {
          const isActive = currentTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={`glass-card relative overflow-hidden rounded-[1.75rem] border-white/8 bg-white/3 transition-all ${isActive ? "ring-2 ring-primary" : "hover:-translate-y-1 hover:ring-1 hover:ring-border"
                }`}
            >
              <div className="border-b border-white/8 p-4">
                <TemplatePreview templateId={template.id} />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-zinc-100">{template.name}</CardTitle>
                  <Badge variant={isActive ? "default" : "secondary"} className={!isActive ? "bg-white/6 text-zinc-300" : undefined}>
                    {template.category}
                  </Badge>
                </div>
                <CardDescription className="text-zinc-400">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant={isActive ? "secondary" : "outline"}
                  className="w-full"
                  onClick={() => handleSelect(template.id)}
                  disabled={updateTemplate.isPending}
                >
                  {isActive ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Current Template
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

      <FlowFooter
        previous={{ href: "/dashboard/edit", label: "Previous: Edit" }}
        next={{ href: "/dashboard/import", label: "Next: Import Data" }}
      />
    </div>
  );
}
/*

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePortfolio, useUpdateTemplate, useCreatePortfolio } from "@/features/portfolio/api/use-portfolio";
import { templateRegistry } from "@/features/templates/registry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { toast } from "sonner";
import { Check, Loader2, Plus } from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const updateTemplate = useUpdateTemplate();

  const currentTemplate = portfolio?.templateId ?? "minimal";

  const handleSelect = (templateId: string) => {
    updateTemplate.mutate(templateId, {
      onSuccess: () => toast.success(`Template changed to ${templateId}`),
      "use client";

      import Link from "next/link";
      import { useRouter } from "next/navigation";
      import { Check, Loader2, Plus } from "lucide-react";
      import { toast } from "sonner";
      import { Badge } from "@/components/ui/badge";
      import { Button } from "@/components/ui/button";
      import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
      import { FlowFooter } from "@/features/dashboard/components/flow-footer";
      import { useCreatePortfolio, usePortfolio, useUpdateTemplate } from "@/features/portfolio/api/use-portfolio";
      import { templateRegistry } from "@/features/templates/registry";

      function TemplatePreview({ templateId }: { templateId: string }) {
      const theme: Record<string, string> = {
      minimal: "from-stone-100 to-stone-200",
      modern: "from-violet-500/50 to-cyan-400/40",
      developer: "from-green-500/40 to-emerald-400/30",
      creative: "from-pink-500/40 to-orange-400/30",
      corporate: "from-sky-500/40 to-slate-300/30",
    };

    return (
      <div className={`aspect-4/3 rounded-3xl bg-linear-to-br ${theme[templateId] ?? theme.minimal} p-4`}>
        <div className="h-full rounded-2xl border border-white/20 bg-black/10 p-4">
          <div className="h-3 w-24 rounded-full bg-white/40" />
          <div className="mt-4 h-16 rounded-2xl bg-white/15" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-16 rounded-2xl bg-white/15" />
            <div className="h-16 rounded-2xl bg-white/15" />
          </div>
        </div>
      </div>
    );
  }

  export default function TemplatesPage() {
    const router = useRouter();
    const { data: portfolio, isLoading } = usePortfolio();
    const createPortfolio = useCreatePortfolio();
    const updateTemplate = useUpdateTemplate();
    const currentTemplate = portfolio?.templateId ?? "minimal";

    const handleSelect = (templateId: string) => {
      updateTemplate.mutate(templateId, {
        onSuccess: () => toast.success(`Template changed to ${templateId}`),
        onError: () => toast.error("Failed to change template"),
      });
    };

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
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!portfolio) {
      return (
        <div className="space-y-6">
          <Card className="glass-card rounded-[2rem] border border-white/8 bg-white/3">
            <CardHeader>
              <CardTitle className="text-zinc-100">Create your portfolio before choosing a template</CardTitle>
              <CardDescription className="text-zinc-400">
                The template controls the look and feel of your portfolio. Create the portfolio first so the selection can be saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={handleCreatePortfolio} disabled={createPortfolio.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/edit">Back to Edit</Link>
              </Button>
            </CardContent>
          </Card>

          <FlowFooter
                "use client";

          import Link from "next/link";
          import {useRouter} from "next/navigation";
          import {Check, Loader2, Plus} from "lucide-react";
          import {toast} from "sonner";
          import {Badge} from "@/components/ui/badge";
          import {Button} from "@/components/ui/button";
          import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
          import {FlowFooter} from "@/features/dashboard/components/flow-footer";
          import {useCreatePortfolio, usePortfolio, useUpdateTemplate} from "@/features/portfolio/api/use-portfolio";
          import {templateRegistry} from "@/features/templates/registry";

          function TemplatePreview({templateId}: {templateId: string }) {
                  const theme: Record<string, string> = {
            minimal: "from-stone-100 to-stone-200",
          modern: "from-violet-500/50 to-cyan-400/40",
          developer: "from-green-500/40 to-emerald-400/30",
          creative: "from-pink-500/40 to-orange-400/30",
          corporate: "from-sky-500/40 to-slate-300/30",
                  };

          return (
          <div className={`aspect-4/3 rounded-3xl bg-linear-to-br ${theme[templateId] ?? theme.minimal} p-4`}>
            <div className="h-full rounded-2xl border border-white/20 bg-black/10 p-4">
              <div className="h-3 w-24 rounded-full bg-white/40" />
              <div className="mt-4 h-16 rounded-2xl bg-white/15" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="h-16 rounded-2xl bg-white/15" />
                <div className="h-16 rounded-2xl bg-white/15" />
              </div>
            </div>
          </div>
          );
                }

          export default function TemplatesPage() {
                  const router = useRouter();
          const {data: portfolio, isLoading } = usePortfolio();
          const createPortfolio = useCreatePortfolio();
          const updateTemplate = useUpdateTemplate();
          const currentTemplate = portfolio?.templateId ?? "minimal";

                  const handleSelect = (templateId: string) => {
            updateTemplate.mutate(templateId, {
              onSuccess: () => toast.success(`Template changed to ${templateId}`),
              onError: () => toast.error("Failed to change template"),
            });
                  };

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
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
          );
                  }

          if (!portfolio) {
                    return (
          <div className="space-y-6">
            <Card className="glass-card rounded-[2rem] border border-white/8 bg-white/3">
              <CardHeader>
                <CardTitle className="text-zinc-100">Create your portfolio before choosing a template</CardTitle>
                <CardDescription className="text-zinc-400">
                  The template controls the look and feel of your portfolio. Create the portfolio first so the selection can be saved.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={handleCreatePortfolio} disabled={createPortfolio.isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/edit">Back to Edit</Link>
                </Button>
              </CardContent>
            </Card>

            <FlowFooter
              previous={{ href: "/dashboard/edit", label: "Back to Edit" }}
              next={{ label: "Next: Import Data", onClick: () => router.push("/dashboard/import") }}
            />
          </div>
          );
                  }

          return (
          <div className="space-y-8 pb-6">
            <div className="glass-card rounded-[2rem] border border-white/8 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">Templates</p>
              <h1 className="mt-3 text-3xl font-bold">Choose a presentation system</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Pick the visual language that best fits your work. Content stays the same while layout, rhythm, and tone shift with the template.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(templateRegistry).map((template) => {
                const isActive = currentTemplate === template.id;

                return (
                  <Card
                    key={template.id}
                    className={`glass-card relative overflow-hidden rounded-[1.75rem] border-white/8 bg-white/3 transition-all ${isActive ? "ring-2 ring-primary" : "hover:-translate-y-1 hover:ring-1 hover:ring-border"
                      }`}
                  >
                    <div className="border-b border-white/8 p-4">
                      <TemplatePreview templateId={template.id} />
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-zinc-100">{template.name}</CardTitle>
                        <Badge variant={isActive ? "default" : "secondary"} className={!isActive ? "bg-white/6 text-zinc-300" : undefined}>
                          {template.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-zinc-400">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant={isActive ? "secondary" : "outline"}
                        className="w-full"
                        onClick={() => handleSelect(template.id)}
                        disabled={updateTemplate.isPending}
                      >
                        {isActive ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Current Template
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

            <FlowFooter
              previous={{ href: "/dashboard/edit", label: "Previous: Edit" }}
              next={{ href: "/dashboard/import", label: "Next: Import Data" }}
            />
          </div>
          );
                }
                  >
          {template.category}
        </Badge>
                </div >
              </CardHeader >
        <CardContent className="space-y-3">
          <CardDescription className="text-zinc-400">
            {template.description}
          </CardDescription>
          <Button
            className="w-full rounded-full"
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
            </Card >
          );
    })
  }
      </div >

    <FlowFooter
      previous={{ href: "/dashboard/edit", label: "Previous: Edit" }}
      next={{ href: "/dashboard/import", label: "Next: Import Data" }}
    />
    </div >
  );
}
function TemplatePreview({ templateId }: { templateId: string }) {
  const styles: Record<
    string,
    {
      shell: string;
      top: string;
      accent: string;
      card: string;
    }
  > = {
    minimal: {
      shell: "bg-[#f7f3eb]",
      top: "bg-[#fbf8f1]",
      accent: "bg-stone-900/80",
      card: "bg-white/90 border-stone-200",
    },
    modern: {
      shell: "bg-[#0a1020]",
      top: "bg-gradient-to-br from-violet-500/30 via-slate-900 to-cyan-400/10",
      accent: "bg-linear-to-r from-violet-400 to-cyan-300",
      card: "bg-white/6 border-white/8",
    },
    developer: {
      shell: "bg-gray-950",
      top: "bg-black/30",
      accent: "bg-green-400/80",
      card: "bg-green-950/20 border-green-900/40",
    },
    creative: {
      shell: "bg-white",
      top: "bg-linear-to-r from-pink-400/30 via-orange-300/25 to-yellow-300/25",
      accent: "bg-linear-to-r from-pink-500 to-orange-400",
      card: "bg-white border-gray-200",
    },
    corporate: {
      shell: "bg-slate-100",
      top: "bg-slate-900",
      accent: "bg-sky-500/80",
      card: "bg-white border-slate-200",
    },
  };

  const style = styles[templateId] ?? styles.minimal;

  return (
    <div className={`aspect-4/3 overflow-hidden rounded-4xl border ${style.card} ${style.shell}`}>
      <div className={`h-[38%] px-4 py-3 ${style.top}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className={`h-2.5 w-24 rounded-full ${style.accent}`} />
            <div className="h-2 w-36 rounded-full bg-white/20" />
            <div className="h-2 w-24 rounded-full bg-white/15" />
          </div>
          <div className="h-10 w-10 rounded-2xl bg-white/15 ring-1 ring-white/15" />
        </div>
      </div>

      <div className="grid gap-2 p-4">
        <div className={`h-14 rounded-xl border ${style.card}`} />
        <div className="grid grid-cols-2 gap-2">
          <div className={`h-20 rounded-xl border ${style.card}`} />
          <div className={`h-20 rounded-xl border ${style.card}`} />
        </div>
        <div className="flex gap-2">
          <div className={`h-7 w-20 rounded-full border ${style.card}`} />
          <div className={`h-7 w-16 rounded-full border ${style.card}`} />
          <div className={`h-7 w-24 rounded-full border ${style.card}`} />
        </div>
      </div>
    </div>
  );
} "use client";

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
      <div className="glass-card rounded-[2rem] border border-white/8 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          Templates
        </p>
        <h1 className="mt-3 text-3xl font-bold">Choose a presentation system</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick the visual language that best fits your work. Content stays the
          same while layout, rhythm, and tone shift with the template.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(templateRegistry).map((template) => {
          const isActive = currentTemplate === template.id;
          return (
            <Card
              key={template.id}
              className={`glass-card relative overflow-hidden rounded-[1.75rem] border-white/8 bg-white/3 transition-all ${isActive
                ? "ring-2 ring-primary"
                : "hover:-translate-y-1 hover:ring-1 hover:ring-border"
                }`}
            >
              <div className="border-b border-white/8 p-4">
                <TemplatePreview templateId={template.id} />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-zinc-100">
                    {template.name}
                  </CardTitle>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={!isActive ? "bg-white/6 text-zinc-300" : undefined}
                  >
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-zinc-400">
                  {template.description}
                </CardDescription>
                <Button
                  className="w-full rounded-full"
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
function TemplatePreview({ templateId }: { templateId: string }) {
  const styles: Record<
    string,
    {
      shell: string;
      top: string;
      accent: string;
      card: string;
    }
  > = {
    minimal: {
      shell: "bg-[#f7f3eb]",
      top: "bg-[#fbf8f1]",
      accent: "bg-stone-900/80",
      card: "bg-white/90 border-stone-200",
    },
    modern: {
      shell: "bg-[#0a1020]",
      top: "bg-gradient-to-br from-violet-500/30 via-slate-900 to-cyan-400/10",
      accent: "bg-linear-to-r from-violet-400 to-cyan-300",
      card: "bg-white/6 border-white/8",
    },
    developer: {
      shell: "bg-gray-950",
      top: "bg-black/30",
      accent: "bg-green-400/80",
      card: "bg-green-950/20 border-green-900/40",
    },
    creative: {
      shell: "bg-white",
      top: "bg-linear-to-r from-pink-400/30 via-orange-300/25 to-yellow-300/25",
      accent: "bg-linear-to-r from-pink-500 to-orange-400",
      card: "bg-white border-gray-200",
    },
    corporate: {
      shell: "bg-slate-100",
      top: "bg-slate-900",
      accent: "bg-sky-500/80",
      card: "bg-white border-slate-200",
    },
  };

  const style = styles[templateId] ?? styles.minimal;

  return (
    <div className={`aspect-4/3 overflow-hidden rounded-4xl border ${style.card} ${style.shell}`}>
      <div className={`h-[38%] px-4 py-3 ${style.top}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className={`h-2.5 w-24 rounded-full ${style.accent}`} />
            <div className="h-2 w-36 rounded-full bg-white/20" />
            <div className="h-2 w-24 rounded-full bg-white/15" />
          </div>
          <div className="h-10 w-10 rounded-2xl bg-white/15 ring-1 ring-white/15" />
        </div>
      </div>

      <div className="grid gap-2 p-4">
        <div className={`h-14 rounded-xl border ${style.card}`} />
        <div className="grid grid-cols-2 gap-2">
          <div className={`h-20 rounded-xl border ${style.card}`} />
          <div className={`h-20 rounded-xl border ${style.card}`} />
        </div>
        <div className="flex gap-2">
          <div className={`h-7 w-20 rounded-full border ${style.card}`} />
          <div className={`h-7 w-16 rounded-full border ${style.card}`} />
          <div className={`h-7 w-24 rounded-full border ${style.card}`} />
        </div>
      </div>
    </div>
  );
}
*/

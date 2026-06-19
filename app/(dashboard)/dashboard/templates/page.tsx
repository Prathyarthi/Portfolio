"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import {
  usePortfolio,
  useUpdateTemplate,
} from "@/features/portfolio/api/use-portfolio";
import { CreatePortfolioPrompt } from "@/features/portfolio/components/create-portfolio-prompt";
import { templateRegistry } from "@/features/templates/registry";

function TemplatePreview({ templateId }: { templateId: string }) {
  const theme: Record<string, string> = {
    minimal: "from-stone-100 to-stone-200",
    modern: "from-violet-500/50 to-cyan-400/40",
    developer: "from-green-500/40 to-emerald-400/30",
    creative: "from-pink-500/40 to-orange-400/30",
    corporate: "from-sky-500/40 to-slate-300/30",
    spotlight: "from-[#fc3]/50 to-[#fbfffe]",
    retro: "from-[#ff90e8]/80 to-[#ffc900]/80",
    bento: "from-zinc-100 to-zinc-200",
    vibrant: "from-fuchsia-600/60 to-cyan-500/60",
    space: "from-[#030014] to-[#0B0F19]",
    windows: "from-[#3a6ea5] to-[#3a6ea5]",
    paper: "from-[#f4f1ea] to-[#e8e4db]",
    cyberpunk: "from-[#050505] to-[#050505]",
    pastel: "from-[#fff5f8] to-[#ffdfba]",
    monochrome: "from-white to-gray-100",
    synthwave: "from-[#120458] to-[#000000]",
    artdeco: "from-[#0b132b] to-[#111c3d]",
    blueprint: "from-[#003366] to-[#002244]",
  };

  return (
    <div
      className={`aspect-4/3 rounded-3xl bg-linear-to-br ${theme[templateId] ?? theme.minimal} p-4`}
    >
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
  const updateTemplate = useUpdateTemplate();
  const [allowedTemplateIds, setAllowedTemplateIds] = useState<string[] | null>(
    null
  );
  const [accessTier, setAccessTier] = useState<
    "free" | "trial" | "pro" | null
  >(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);
  const currentTemplate = portfolio?.templateId ?? "minimal";

  useEffect(() => {
    let cancelled = false;
    const loadAccess = async () => {
      try {
        const res = await fetch("/api/billing/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as {
          access?: {
            allowedTemplateIds?: string[];
            tier?: "free" | "trial" | "pro";
            trialDaysRemaining?: number;
          };
        };
        if (cancelled) return;
        setAllowedTemplateIds(data.access?.allowedTemplateIds ?? null);
        setAccessTier(data.access?.tier ?? null);
        setTrialDaysRemaining(data.access?.trialDaysRemaining ?? 0);
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

  const handleSelect = (templateId: string) => {
    if (allowedTemplateIds && !allowedTemplateIds.includes(templateId)) {
      toast.error("Upgrade to Pro to unlock this template.", {
        action: {
          label: "View Billing",
          onClick: () => router.push("/dashboard/billing"),
        },
      });
      return;
    }

    updateTemplate.mutate(templateId, {
      onSuccess: () => toast.success(`Template changed to ${templateId}`),
      onError: (error) =>
        toast.error(
          error instanceof Error ? error.message : "Failed to change template"
        ),
    });
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
            <CardTitle className="text-zinc-100">
              Create your portfolio before choosing a template
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Create your portfolio first so your template selection can be
              saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CreatePortfolioPrompt />
            <Button variant="outline" asChild>
              <Link href="/dashboard/edit">Back to Edit</Link>
            </Button>
          </CardContent>
        </Card>

        <FlowFooter
          previous={{ href: "/dashboard/edit", label: "Back to Edit" }}
          next={{
            label: "Next: Import Data",
            onClick: () => router.push("/dashboard/import"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <div className="glass-card rounded-[2rem] border border-white/8 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          Templates
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          Choose a presentation system
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick the visual language that best fits your work. Content stays the
          same while layout, rhythm, and tone shift with the template.
        </p>
        {accessTier === "trial" && (
          <p className="mt-3 text-sm text-emerald-400/90">
            Free trial active — {trialDaysRemaining} day
            {trialDaysRemaining === 1 ? "" : "s"} left to use all templates.
          </p>
        )}
        {accessTier === "free" && (
          <p className="mt-3 text-sm text-amber-300/90">
            Your free trial ended. Minimal stays available.{" "}
            <Link
              href="/dashboard/billing"
              className="underline underline-offset-4 hover:text-amber-200"
            >
              Upgrade to Pro
            </Link>{" "}
            to unlock all templates.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(templateRegistry).map((template) => {
          const isActive = currentTemplate === template.id;
          const isLocked = allowedTemplateIds
            ? !allowedTemplateIds.includes(template.id)
            : false;

          return (
            <Card
              key={template.id}
              className={`glass-card relative overflow-hidden rounded-[1.75rem] border-white/8 bg-white/3 transition-all ${
                isActive
                  ? "ring-2 ring-primary"
                  : isLocked
                    ? "opacity-75"
                    : "hover:-translate-y-1 hover:ring-1 hover:ring-border"
              }`}
            >
              <div className="relative border-b border-white/8 p-4">
                <TemplatePreview templateId={template.id} />
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-t-[1.75rem] bg-black/40 backdrop-blur-[2px]">
                    <Lock className="h-6 w-6 text-zinc-300" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-zinc-100">
                    {template.name}
                  </CardTitle>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={
                      isLocked
                        ? "border-teal-400/30 bg-teal-500/15 text-teal-300"
                        : !isActive
                          ? "bg-white/6 text-zinc-300"
                          : undefined
                    }
                  >
                    {isLocked ? "Pro" : isActive ? "Active" : template.category}
                  </Badge>
                </div>
                <CardDescription className="text-zinc-400">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLocked ? (
                  <Button
                    asChild
                    className="w-full rounded-full bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 border border-teal-500/20"
                    variant="outline"
                  >
                    <Link href="/dashboard/billing">Upgrade to unlock</Link>
                  </Button>
                ) : (
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
                )}
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

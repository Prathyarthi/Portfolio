"use client";

import { useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePortfolio } from "@/features/portfolio/api/use-portfolio";
import { getPortfolioRootDomain, sanitizePortfolioSlug } from "@/lib/domain";
import { cn } from "@/lib/utils";

type CreatePortfolioPromptProps = {
  onCreated?: () => void;
  submitLabel?: string;
  className?: string;
  buttonClassName?: string;
};

export function CreatePortfolioPrompt({
  onCreated,
  submitLabel = "Create portfolio",
  className,
  buttonClassName,
}: CreatePortfolioPromptProps) {
  const rootDomain = getPortfolioRootDomain();
  const createPortfolio = useCreatePortfolio();
  const [slug, setSlug] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  async function checkAvailability(value: string) {
    if (!value) {
      setAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const res = await fetch("/api/portfolio/slug/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: value }),
      });
      const data = await res.json();
      setAvailable(Boolean(data.available));
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug || available !== true) return;

    try {
      await createPortfolio.mutateAsync(slug);
      toast.success("Portfolio created");
      onCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create portfolio",
      );
    }
  }

  const canSubmit =
    slug.length >= 2 && available === true && !createPortfolio.isPending && !checking;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="portfolio-slug">Choose your subdomain</Label>
        <div className="flex items-center gap-2">
          <Input
            id="portfolio-slug"
            value={slug}
            onChange={(e) => {
              const value = sanitizePortfolioSlug(e.target.value);
              setSlug(value);
              void checkAvailability(value);
            }}
            placeholder="your-name"
            className="font-mono"
          />
          <span className="shrink-0 text-sm text-muted-foreground">
            .{rootDomain}
          </span>
        </div>
        {checking && (
          <p className="text-xs text-muted-foreground">Checking availability...</p>
        )}
        {!checking && available === true && (
          <p className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" />
            Available
          </p>
        )}
        {!checking && available === false && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <X className="h-3 w-3" />
            Already taken or invalid
          </p>
        )}
      </div>

      <Button type="submit" disabled={!canSubmit} className={buttonClassName}>
        {createPortfolio.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            {submitLabel}
          </>
        )}
      </Button>
    </form>
  );
}

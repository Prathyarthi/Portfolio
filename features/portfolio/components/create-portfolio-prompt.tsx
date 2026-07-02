"use client";

import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCreatePortfolio } from "@/features/portfolio/api/use-portfolio";
import { cn } from "@/lib/utils";

export const PORTFOLIO_ACTION_BUTTON_CLASS =
  "box-border h-11 min-h-11 w-full justify-center py-0";

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
  const createPortfolio = useCreatePortfolio();

  async function handleCreate() {
    try {
      await createPortfolio.mutateAsync();
      toast.success("Portfolio created");
      onCreated?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create portfolio",
      );
    }
  }

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <Button
        type="button"
        onClick={handleCreate}
        disabled={createPortfolio.isPending}
        className={cn(PORTFOLIO_ACTION_BUTTON_CLASS, buttonClassName)}
      >
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
    </div>
  );
}

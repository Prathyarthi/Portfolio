"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateLivePreview } from "@/features/portfolio/api/use-portfolio";
import {
  getMaxLivePreviews,
  isProSubscriptionStatus,
  sanitizeLivePreviewProjectIds,
} from "@/lib/live-preview";
import { toast } from "sonner";

export interface LivePreviewCandidate {
  id: string;
  title: string;
  liveUrl: string;
}

interface LivePreviewSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: LivePreviewCandidate[];
  selectedProjectIds: string[];
  subscriptionStatus: string | null;
  /** save = persist to API; pre-import = return selection to parent (e.g. before resume import) */
  variant?: "save" | "pre-import";
  onConfirm?: (projectIds: string[]) => void | Promise<void>;
  onSaved?: () => void;
  isConfirming?: boolean;
}

export function LivePreviewSelectionDialog({
  open,
  onOpenChange,
  candidates,
  selectedProjectIds,
  subscriptionStatus,
  variant = "save",
  onConfirm,
  onSaved,
  isConfirming = false,
}: LivePreviewSelectionDialogProps) {
  const maxAllowed = getMaxLivePreviews(subscriptionStatus);
  const isPro = isProSubscriptionStatus(subscriptionStatus);
  const updateLivePreview = useUpdateLivePreview();

  const eligibleCandidates = useMemo(
    () => candidates.filter((item) => item.liveUrl.trim()),
    [candidates]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    const eligible = new Set(eligibleCandidates.map((item) => item.id));
    const restored = selectedProjectIds.filter((id) => eligible.has(id));
    setSelectedIds(restored);
  }, [open, eligibleCandidates, selectedProjectIds]);

  const selectedCount = selectedIds.length;
  const exceedsPlan = selectedCount > maxAllowed;
  const overLimitItems = eligibleCandidates.filter((item) => {
    const index = selectedIds.indexOf(item.id);
    return index >= 0 && index >= maxAllowed;
  });

  function toggleProject(projectId: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(projectId)) return prev;
        return [...prev, projectId];
      }
      return prev.filter((id) => id !== projectId);
    });
  }

  function buildSanitizedIds(): string[] {
    return sanitizeLivePreviewProjectIds(
      selectedIds,
      eligibleCandidates.map((item) => ({
        id: item.id,
        liveUrl: item.liveUrl,
      })),
      maxAllowed
    );
  }

  async function handleSave() {
    const sanitized = buildSanitizedIds();

    if (variant === "pre-import") {
      try {
        await onConfirm?.(sanitized);
        onOpenChange(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to continue import"
        );
      }
      return;
    }

    try {
      await updateLivePreview.mutateAsync(sanitized);
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save live preview preferences"
      );
    }
  }

  const isPending = variant === "pre-import" ? isConfirming : updateLivePreview.isPending;
  const confirmLabel =
    variant === "pre-import" ? "Import to portfolio" : "Save selection";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose live preview links</DialogTitle>
          <DialogDescription>
            {variant === "pre-import"
              ? "Select which imported projects should show a live preview. You can change this later in Projects."
              : "Choose which projects should show a live preview in the Projects section."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
          <p>
            Plan:{" "}
            <span className="font-medium">
              {isPro ? "Pro (active)" : "Free trial"}
            </span>
          </p>
          <p>
            Selected:{" "}
            <span
              className={
                exceedsPlan ? "font-medium text-destructive" : "font-medium"
              }
            >
              {selectedCount}
            </span>{" "}
            / {maxAllowed} allowed
          </p>
          {exceedsPlan && (
            <p className="text-destructive">
              Only the first {maxAllowed} selections will be used on your plan.
            </p>
          )}
        </div>

        {eligibleCandidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No project live URLs found. Add live URLs to your projects first.
          </p>
        ) : (
          <div className="space-y-3">
            {eligibleCandidates.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);
              const isOverLimit =
                isSelected && selectedIds.indexOf(item.id) >= maxAllowed;

              return (
                <div
                  key={item.id}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
                    isOverLimit
                      ? "border-destructive/50 bg-destructive/5"
                      : "border-border/60"
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{item.liveUrl}</span>
                    </a>
                    {isOverLimit && (
                      <p className="text-xs text-destructive">
                        Exceeds your plan limit.
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pt-0.5">
                    <Label htmlFor={`live-preview-${index}`} className="sr-only">
                      Enable preview for {item.title}
                    </Label>
                    <Switch
                      id={`live-preview-${index}`}
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        toggleProject(item.id, checked)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {overLimitItems.length > 0 && (
          <p className="text-sm text-destructive">
            {overLimitItems.length} selected preview
            {overLimitItems.length === 1 ? "" : "s"} exceed your plan. Only the
            first {maxAllowed} will be saved unless you upgrade.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!isPro && (
            <Button type="button" variant="outline" asChild>
              <Link href="/pricing">Upgrade plan</Link>
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={eligibleCandidates.length === 0 || isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
  onSaved?: () => void;
}

export function LivePreviewSelectionDialog({
  open,
  onOpenChange,
  candidates,
  selectedProjectIds,
  subscriptionStatus,
  onSaved,
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

  async function handleSave() {
    try {
      await updateLivePreview.mutateAsync(selectedIds);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="space-y-4 overflow-y-auto px-6 pt-6 pb-4">
          <DialogHeader className="space-y-1.5">
            <DialogTitle>Choose live preview links</DialogTitle>
            <DialogDescription>
              Choose which projects should show a live preview in the Projects section.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
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
            </div>
            {exceedsPlan && (
              <p className="mt-2 text-destructive">
                Please upgrade the plan for more preview links.
              </p>
            )}
          </div>

          {eligibleCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No project live URLs found. Add live URLs to your projects first.
            </p>
          ) : (
            <div className="space-y-2">
              {eligibleCandidates.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                const isOverLimit =
                  isSelected && selectedIds.indexOf(item.id) >= maxAllowed;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 ${
                      isOverLimit
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.liveUrl}</span>
                      </a>
                      {isOverLimit && (
                        <p className="text-xs text-destructive">
                          Exceeds your plan limit — please upgrade the plan for more
                          preview links.
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center">
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
        </div>

        <DialogFooter className="gap-2 border-t border-border/60 bg-muted/10 px-6 py-4 sm:justify-end">
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
            disabled={
              eligibleCandidates.length === 0 || updateLivePreview.isPending
            }
          >
            {updateLivePreview.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

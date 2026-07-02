"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Check,
  Globe,
  Loader2,
  Monitor,
  MoreHorizontal,
  Share2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PreviewEditToggle } from "@/features/portfolio/components/preview-edit-sidebar";
import { ShareDialog } from "@/features/portfolio/components/share-dialog";

type PreviewToolbarProps = {
  device: "desktop" | "mobile";
  onDeviceChange: (device: "desktop" | "mobile") => void;
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  hasUnsavedTemplate: boolean;
  isPublished: boolean;
  templateName: string;
  isSavingTemplate: boolean;
  onTemplateSave: () => void;
  isPublishing: boolean;
  onPublishClick: () => void;
  slug: string;
  showAnalytics: boolean;
};

export function PreviewToolbar({
  device,
  onDeviceChange,
  editOpen,
  onEditOpenChange,
  hasUnsavedTemplate,
  isPublished,
  templateName,
  isSavingTemplate,
  onTemplateSave,
  isPublishing,
  onPublishClick,
  slug,
  showAnalytics,
}: PreviewToolbarProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const applyLabel = isPublished ? `Apply ${templateName}` : `Use ${templateName}`;
  const publishLabel = isPublished ? "Unpublish" : "Publish";
  const showOverflow = Boolean(slug) || showAnalytics;

  return (
    <>
      <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
        <div
          className="flex shrink-0 items-center gap-0.5 rounded-[var(--radius-md)] bg-surface-sunken p-0.5"
          role="group"
          aria-label="Preview device"
        >
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Desktop preview"
            aria-pressed={device === "desktop"}
            onClick={() => onDeviceChange("desktop")}
            className={cn(device === "desktop" && "bg-surface-base text-brand-primary")}
          >
            <Monitor className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Mobile preview"
            aria-pressed={device === "mobile"}
            onClick={() => onDeviceChange("mobile")}
            className={cn(device === "mobile" && "bg-surface-base text-brand-primary")}
          >
            <Smartphone className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <PreviewEditToggle open={editOpen} onOpenChange={onEditOpenChange} compact />

        {hasUnsavedTemplate ? (
          <Button
            type="button"
            size="sm"
            className="shrink-0 gap-1.5 px-2.5"
            onClick={onTemplateSave}
            disabled={isSavingTemplate}
            title={applyLabel}
          >
            {isSavingTemplate ? (
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="hidden xl:inline">{applyLabel}</span>
            <span className="xl:hidden">Apply</span>
          </Button>
        ) : null}

        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1.5 px-2.5"
          variant={isPublished ? "outline" : "default"}
          onClick={onPublishClick}
          disabled={isPublishing}
          title={publishLabel}
          aria-label={publishLabel}
        >
          {isPublishing ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          ) : (
            <Globe className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="hidden xl:inline">{publishLabel}</span>
        </Button>

        {showOverflow ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="More preview actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
              {slug ? (
                <DropdownMenuItem onSelect={() => setShareOpen(true)}>
                  <Share2 className="h-4 w-4" />
                  Share
                </DropdownMenuItem>
              ) : null}
              {showAnalytics ? (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      {slug ? (
        <ShareDialog
          slug={slug}
          isPublished={isPublished}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />
      ) : null}
    </>
  );
}

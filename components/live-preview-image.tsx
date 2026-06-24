"use client";

import { useState } from "react";
import { getPreviewImage } from "@/lib/link-preview-code";
import { isLivePreviewEnabledForProject } from "@/lib/live-preview";
import { cn } from "@/lib/utils";
import {
  ProjectPreviewPlaceholderGraphic,
  type PreviewPlaceholderVariant,
} from "@/components/project-preview-placeholder-graphic";

interface LivePreviewImageProps {
  liveUrl?: string | null;
  alt: string;
  projectId?: string;
  livePreviewProjectIds?: string[] | null;
  enabled?: boolean;
  className?: string;
  containerClassName?: string;
  placeholderClassName?: string;
  placeholderVariant?: PreviewPlaceholderVariant;
  loading?: "lazy" | "eager";
}

export function LivePreviewImage({
  liveUrl,
  alt,
  projectId,
  livePreviewProjectIds,
  enabled: enabledProp,
  className,
  containerClassName,
  placeholderClassName,
  placeholderVariant = "default",
  loading = "lazy",
}: LivePreviewImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const enabled =
    enabledProp ??
    (projectId
      ? isLivePreviewEnabledForProject(projectId, livePreviewProjectIds)
      : false);

  const showPreview = enabled && Boolean(liveUrl?.trim()) && !imageFailed;
  const src = showPreview ? getPreviewImage(liveUrl!) : undefined;

  return (
    <div
      className={cn(
        "relative aspect-[8/5] w-full shrink-0 overflow-hidden bg-stone-900/20",
        containerClassName
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={cn("block h-full w-full object-cover object-top", className)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <ProjectPreviewPlaceholderGraphic
          title={alt}
          seedKey={projectId ?? alt}
          variant={placeholderVariant}
          className={placeholderClassName}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { isLivePreviewEnabledForProject } from "@/lib/live-preview";
import { GenerativeProjectCover } from "@/features/templates/corporate/generativeprojectcover";
import { cn } from "@/lib/utils";

interface LivePreviewImageProps {
  liveUrl?: string | null;
  imageUrl?: string | null;
  alt: string;
  projectId?: string;
  livePreviewProjectIds?: string[] | null;
  enabled?: boolean;
  className?: string;
  containerClassName?: string;
  placeholderClassName?: string;
  loading?: "lazy" | "eager";
}

export function LivePreviewImage({
  liveUrl,
  imageUrl,
  alt,
  projectId,
  livePreviewProjectIds,
  enabled: enabledProp,
  className,
  containerClassName,
  placeholderClassName,
  loading = "lazy",
}: LivePreviewImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const enabled =
    enabledProp ??
    (projectId
      ? isLivePreviewEnabledForProject(projectId, livePreviewProjectIds)
      : false);

  const coverSeed = projectId ?? alt;
  const cachedSrc =
    enabled && imageUrl?.trim() && !imageFailed ? imageUrl.trim() : null;

  return (
    <div
      className={cn(
        "relative aspect-[8/5] w-full shrink-0 overflow-hidden bg-stone-900/20",
        containerClassName
      )}
    >
      {cachedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cachedSrc}
          alt={alt}
          loading={loading}
          className={cn("block h-full w-full object-cover object-top", className)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className={cn("h-full w-full", placeholderClassName)}>
          <GenerativeProjectCover seed={coverSeed} />
        </div>
      )}
    </div>
  );
}

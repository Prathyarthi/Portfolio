"use client";

import { useState } from "react";
import { getPreviewImage } from "@/lib/link-preview-code";
import { isLivePreviewEnabledForProject } from "@/lib/live-preview";
import { cn } from "@/lib/utils";

interface LivePreviewImageProps {
  liveUrl?: string | null;
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
        <div
          className={cn(
            "flex h-full w-full items-center justify-center bg-stone-100/90 px-4",
            placeholderClassName
          )}
        >
          <p className="line-clamp-2 text-center text-sm font-medium leading-snug text-stone-500">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
}

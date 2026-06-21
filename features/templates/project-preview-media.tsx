"use client";

import { LivePreviewImage } from "@/components/live-preview-image";
import { isLivePreviewEnabledForProject } from "@/lib/live-preview";
import { GenerativeProjectCover } from "@/features/templates/corporate/generativeprojectcover";

interface ProjectPreviewMediaProps {
  projectId: string;
  liveUrl: string | null;
  imageUrl: string | null;
  livePreviewProjectIds: string[];
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export function ProjectPreviewMedia({
  projectId,
  liveUrl,
  imageUrl,
  livePreviewProjectIds,
  alt,
  className,
  loading = "lazy",
}: ProjectPreviewMediaProps) {
  const previewEnabled =
    Boolean(liveUrl?.trim()) &&
    isLivePreviewEnabledForProject(projectId, livePreviewProjectIds);

  if (previewEnabled && imageUrl) {
    return (
      <LivePreviewImage
        previewImageUrl={imageUrl}
        enabled
        alt={alt}
        loading={loading}
        className={className}
        coverSeed={projectId}
      />
    );
  }

  return <GenerativeProjectCover seed={projectId} />;
}

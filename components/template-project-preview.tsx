"use client";

import { LivePreviewImage } from "@/components/live-preview-image";
import { getTemplateProjectPreviewConfig } from "@/features/templates/project-preview-palettes";

export type TemplateProjectPreviewProps = {
  templateId: string;
  liveUrl?: string | null;
  alt: string;
  projectId?: string;
  livePreviewProjectIds?: string[] | null;
  enabled?: boolean;
  className?: string;
  containerClassName?: string;
  placeholderClassName?: string;
  loading?: "lazy" | "eager";
};

/**
 * Shared project preview for all portfolio templates.
 * Shows a Microlink screenshot when available; otherwise a themed placeholder
 * whose colors match the template via `project-preview-palettes`.
 */
export function TemplateProjectPreview({
  templateId,
  placeholderClassName,
  ...props
}: TemplateProjectPreviewProps) {
  const config = getTemplateProjectPreviewConfig(templateId);

  return (
    <LivePreviewImage
      {...props}
      templateId={templateId}
      placeholderVariant={config?.variant ?? "default"}
      placeholderClassName={placeholderClassName}
    />
  );
}

"use client";

import { useState } from "react";
import { GenerativeProjectCover } from "@/features/templates/corporate/generativeprojectcover";

interface LivePreviewImageProps {
  previewImageUrl: string | null;
  enabled: boolean;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  coverSeed: string;
}

export function LivePreviewImage({
  previewImageUrl,
  enabled,
  alt,
  className,
  loading = "lazy",
  coverSeed,
}: LivePreviewImageProps) {
  const [failed, setFailed] = useState(false);

  if (!enabled || !previewImageUrl || failed) {
    return <GenerativeProjectCover seed={coverSeed} />;
  }

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
      <img
        src={previewImageUrl}
        alt={alt}
        loading={loading}
        className={className ?? "h-full w-full object-cover object-top"}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

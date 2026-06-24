"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getTemplate } from "@/features/templates/registry";
import { SAMPLE_PORTFOLIO_DATA } from "@/features/templates/sample-portfolio-data";

const PREVIEW_CANVAS_WIDTH = 1440;

type TemplateLivePreviewProps = {
  templateId: string;
  className?: string;
  compact?: boolean;
};

export function TemplateLivePreview({
  templateId,
  className,
  compact = false,
}: TemplateLivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.22);
  const [visible, setVisible] = useState(false);

  const template = getTemplate(templateId);
  const Component = template.component;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      setScale(el.clientWidth / PREVIEW_CANVAS_WIDTH);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const intersection = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          intersection.disconnect();
        }
      },
      { rootMargin: "160px" }
    );

    intersection.observe(el);
    return () => intersection.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-4/3 w-full overflow-hidden border border-border-default bg-surface-base",
        compact ? "rounded-xl" : "rounded-2xl",
        className
      )}
      aria-hidden
    >
      {!visible ? (
        <div className="absolute inset-0 skeleton-shimmer" />
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="pointer-events-none absolute left-0 top-0 select-none"
            style={{
              width: PREVIEW_CANVAS_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Component data={SAMPLE_PORTFOLIO_DATA} />
          </div>
        </div>
      )}
    </div>
  );
}

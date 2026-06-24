import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { templateRegistry } from "@/features/templates/registry";
import type { TemplateComponent } from "@/features/templates/types";
import { TemplatePreviewThumbnail } from "@/features/templates/template-preview-thumbnail";

const SHOWCASE_TEMPLATE_IDS = [
  "minimal",
  "developer",
  "modern",
  "corporate",
  "creative",
  "retro",
  "blueprint",
  "spotlight",
] as const;

function ShowcaseCard({ template }: { template: TemplateComponent }) {
  return (
    <Link
      href="/sign-up"
      className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-xl)] glass-panel outline-none transition-all duration-200 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-border-strong focus-visible:shadow-[var(--shadow-focus)]"
    >
      <div className="border-b border-border-default p-4">
        <TemplatePreviewThumbnail templateId={template.id} />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-h4 text-text-primary">{template.name}</p>
            <p className="mt-1 line-clamp-2 text-body-sm text-text-secondary">
              {template.description}
            </p>
          </div>
          <ArrowUpRight
            className="mt-0.5 h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-brand-primary"
            aria-hidden
          />
        </div>
        <Badge variant="neutral" className="w-fit capitalize">
          {template.category}
        </Badge>
      </div>
    </Link>
  );
}

export function TemplateShowcase() {
  const templates = SHOWCASE_TEMPLATE_IDS.map(
    (id) => templateRegistry[id] ?? templateRegistry.minimal
  );
  const templateCount = Object.keys(templateRegistry).length;

  return (
    <section
      id="showcase"
      className="scroll-mt-16 bg-surface-raised px-6 py-[var(--space-9)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow uppercase">Examples</p>
            <h2 className="mt-3 text-h1 text-text-primary">
              See what Foliofy creates
            </h2>
            <p className="prose-measure mt-4 text-body text-text-secondary">
              Real layouts generated from a resume. Same content, your choice of
              personality.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex shrink-0 items-center gap-1 text-body-sm font-medium text-brand-primary hover:text-brand-dark"
          >
            Browse all {templateCount} templates
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mt-[var(--space-6)]">
        <div className="mx-auto flex max-w-[1200px] snap-x gap-[var(--space-5)] overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
          {templates.map((template) => (
            <ShowcaseCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </section>
  );
}

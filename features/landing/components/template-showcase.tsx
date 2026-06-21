import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Preview = {
  name: string;
  role: string;
  template: string;
  hue: string;
};

const PREVIEWS: Preview[] = [
  { name: "Maya Chen", role: "Product Designer", template: "Minimal", hue: "#6c5ce7" },
  { name: "Dev Patel", role: "Frontend Engineer", template: "Developer", hue: "#00b894" },
  { name: "Sara Lind", role: "Marketing Lead", template: "Modern", hue: "#a29bfe" },
  { name: "Omar Reed", role: "Data Scientist", template: "Corporate", hue: "#4834d4" },
  { name: "Ivy Nakamura", role: "Illustrator", template: "Creative", hue: "#e17055" },
  { name: "Leo Martins", role: "Full-stack Dev", template: "Spotlight", hue: "#fdcb6e" },
];

function PreviewCard({ p }: { p: Preview }) {
  return (
    <Link
      href="/sign-up"
      className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border-default bg-surface-raised shadow-[var(--shadow-card)] outline-none transition-all duration-200 ease-[var(--ease-out)] hover:-translate-y-1 hover:border-border-strong focus-visible:shadow-[var(--shadow-focus)]"
    >
      {/* Mock portfolio thumbnail */}
      <div className="relative h-[150px] overflow-hidden bg-surface-base">
        <div className="h-14 w-full" style={{ background: p.hue, opacity: 0.16 }} />
        <div
          className="absolute left-4 top-7 h-12 w-12 rounded-full border-4 border-surface-raised"
          style={{ background: p.hue }}
        />
        <div className="space-y-2 px-4 pt-7">
          <div className="h-2.5 w-1/2 rounded-full bg-text-primary/70" />
          <div className="h-2 w-1/3 rounded-full" style={{ background: p.hue, opacity: 0.6 }} />
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 w-10 rounded-[var(--radius-sm)] bg-surface-sunken" />
            <div className="h-4 w-12 rounded-[var(--radius-sm)] bg-surface-sunken" />
            <div className="h-4 w-8 rounded-[var(--radius-sm)] bg-surface-sunken" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border-default px-4 py-3.5">
        <div>
          <p className="text-h4 text-text-primary">{p.name}</p>
          <p className="text-body-sm text-text-secondary">{p.role}</p>
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-text-muted transition-colors group-hover:text-brand-primary"
          aria-hidden
        />
      </div>
    </Link>
  );
}

export function TemplateShowcase() {
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
            Browse all 18 templates
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mt-[var(--space-6)]">
        <div className="mx-auto flex max-w-[1200px] snap-x gap-[var(--space-5)] overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
          {PREVIEWS.map((p) => (
            <PreviewCard key={p.name} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

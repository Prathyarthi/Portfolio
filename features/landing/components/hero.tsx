import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { UploadZone } from "@/features/landing/components/upload-zone";
import { TransformRail } from "@/features/landing/components/transform-rail";

/** Pure-CSS resume → portfolio transform (no JS animation libraries). */
function ResumeToPortfolio() {
  return (
    <div
      className="relative flex h-[240px] w-full items-center justify-center max-[480px]:h-[200px]"
      aria-label="Animated preview: a resume transforming into a portfolio site"
      role="img"
    >
      <div className="folio-resume absolute left-2 top-1/2 w-[148px] -translate-y-1/2 rounded-[var(--radius-lg)] border border-border-default bg-surface-base p-3 shadow-[var(--shadow-card)]">
        <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] text-text-muted">
          <FileText className="h-3 w-3" aria-hidden />
          <span>resume.pdf</span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-3/4 rounded-full bg-surface-sunken" />
          <div className="h-1.5 w-full rounded-full bg-surface-sunken" />
          <div className="h-1.5 w-5/6 rounded-full bg-surface-sunken" />
          <div className="h-1.5 w-full rounded-full bg-surface-sunken" />
          <div className="h-1.5 w-2/3 rounded-full bg-surface-sunken" />
        </div>
      </div>

      <div className="folio-wand relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand-secondary font-mono text-xs font-bold text-white shadow-[var(--shadow-card)]">
        →
      </div>

      <div className="folio-portfolio absolute right-2 top-1/2 w-[168px] -translate-y-1/2 overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-surface-base shadow-[var(--shadow-card)]">
        <div className="h-9 bg-brand-light" />
        <div className="-mt-4 px-3">
          <div className="h-8 w-8 rounded-full border-2 border-surface-base bg-brand-primary" />
          <div className="mt-2 space-y-1.5 pb-3">
            <div className="h-2 w-2/3 rounded-full bg-text-primary/80" />
            <div className="h-1.5 w-1/2 rounded-full bg-success" />
            <div className="mt-2 flex gap-1.5">
              <div className="h-4 w-10 rounded-[var(--radius-sm)] bg-brand-light" />
              <div className="h-4 w-8 rounded-[var(--radius-sm)] bg-surface-sunken" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-[var(--space-9)] pb-[var(--space-8)]">
      <div className="hero-blob" aria-hidden />

      <div className="relative mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-3xl text-center">
          <TransformRail className="mx-auto mb-6 max-w-md justify-center" />

          <p className="eyebrow uppercase">Resume → portfolio</p>

          <h1 className="text-display mt-3 text-balance text-text-primary">
            Your resume. Your portfolio. Done.
          </h1>

          <p className="prose-measure mx-auto mt-5 text-body-lg text-text-secondary">
            Upload your resume and get a beautiful portfolio site in under 60
            seconds. No code, no design skills.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/sign-up">
                Get started — it&apos;s free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#showcase">
                See examples
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-[var(--space-8)] grid max-w-4xl items-center gap-[var(--space-6)] md:grid-cols-2">
          <div className="flex justify-center">
            <UploadZone />
          </div>
          <div className="rounded-[var(--radius-xl)] border border-border-default bg-surface-raised p-2 shadow-[var(--shadow-card)]">
            <ResumeToPortfolio />
          </div>
        </div>
      </div>
    </section>
  );
}

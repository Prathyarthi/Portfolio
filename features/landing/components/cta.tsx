import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="px-6 py-[var(--space-9)]">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[var(--radius-xl)] bg-brand-light px-6 py-[var(--space-8)] text-center">
        <div className="hero-blob" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-h1 text-text-primary">
            Drop your resume. Get a portfolio.
          </h2>
          <p className="prose-measure mx-auto mt-4 text-body-lg text-text-secondary">
            It is free to start and takes under 60 seconds. No credit card, no
            design skills, no waiting.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/sign-up">
                Get started — it&apos;s free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

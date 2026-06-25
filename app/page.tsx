import { Hero } from "@/features/landing/components/hero";
import { SocialProof } from "@/features/landing/components/social-proof";
import { Features } from "@/features/landing/components/features";
import { TemplateShowcase } from "@/features/landing/components/template-showcase";
import { Pricing } from "@/features/landing/components/pricing";
import { CTA } from "@/features/landing/components/cta";
import { LandingNav } from "@/features/landing/components/landing-nav";

export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-[var(--radius-md)] focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <div className="min-h-screen overflow-x-hidden bg-surface-base relative">
        <div className="glass-ambient" aria-hidden />
        <div className="relative z-[1]">
        <LandingNav />

        <main id="main">
          <Hero />
          <SocialProof />
          <Features />
          <TemplateShowcase />
          <Pricing />
          <CTA />
        </main>
        </div>
      </div>
    </>
  );
}

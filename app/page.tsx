import { Hero } from "@/features/landing/components/hero";
import { Features } from "@/features/landing/components/features";
import { TemplateShowcase } from "@/features/landing/components/template-showcase";
import { CTA } from "@/features/landing/components/cta";
import { Footer } from "@/features/landing/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#080b14]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text tracking-wide">
              Foliofy
            </span>
            <span className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              Beta
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="rounded-full px-5">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <Hero />
      <Features />
      <TemplateShowcase />
      <CTA />
      <Footer />
    </div>
  );
}

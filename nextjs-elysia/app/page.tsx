import { Hero } from "@/features/landing/components/hero";
import { Features } from "@/features/landing/components/features";
import { TemplateShowcase } from "@/features/landing/components/template-showcase";
import { CTA } from "@/features/landing/components/cta";
import { Footer } from "@/features/landing/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            Foliofy
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
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

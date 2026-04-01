import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CTA() {
  return (
    <section className="px-4 py-20 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Card className="glass-card rounded-[2rem] border-white/8 bg-white/3 text-center">
          <CardContent className="p-8 md:p-12">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
              Final Step
            </p>
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
              Ship a portfolio that feels <span className="gradient-text">intentional</span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Start with imports if they help, but finish with a portfolio that
              reflects your work, your taste, and your strongest proof points.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="rounded-full px-8">
                <Link href="/sign-up">
                  Create Your Portfolio <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="rounded-full border-white/10 bg-white/3 px-8 text-zinc-300 hover:bg-white/6"
              >
                <Link href="/sign-in">Sign in to continue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

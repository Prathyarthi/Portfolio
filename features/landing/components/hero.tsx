import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Layers3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPortfolioRootDomain } from "@/lib/domain";
import { landingSurfaceMuted } from "@/features/landing/surface";
import { HeroPreviewShell } from "@/features/landing/components/hero-preview-shell";

export function Hero() {
  const rootDomain = getPortfolioRootDomain();
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20">
      <div className="absolute inset-0 -z-10">
        <div className="grid-glow absolute inset-x-0 top-0 h-[30rem]" />
        <div className="absolute left-[10%] top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute right-[8%] top-12 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div className="text-center lg:text-left">
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-zinc-300" />
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            For developers who want a real site, not a PDF
          </div>

          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-balance md:text-6xl md:leading-[1.08]">
            A portfolio <span className="gradient-text">presence</span>
            <br />
            you can actually send
          </h1>

          <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0">
            Import GitHub and LeetCode, tune the story in the editor, pick a
            template, and publish one memorable link.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button size="lg" asChild className="rounded-full px-7">
              <Link href="/sign-up">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full border-white/10 bg-white/[0.02] px-7 text-zinc-300 hover:bg-white/[0.05]"
            >
              <Link href="#showcase">Browse templates</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {["Imports", "Templates", "Live link"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <HeroPreviewShell>
            <div className={cn(landingSurfaceMuted, "p-1")}>
              <div className="relative rounded-[1.35rem] border border-white/[0.05] bg-black/30 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-zinc-500">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                  <span className="truncate">your-name.{rootDomain}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-zinc-200">
                      <Layers3 className="h-4 w-4 text-violet-300/90" />
                      Readiness
                    </div>
                    <span className="font-mono text-xs tabular-nums text-zinc-500">84%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-violet-400/90 to-cyan-300/80 transition-[width] duration-700 ease-out" />
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    One workspace: content, layout, preview, publish—without tab
                    overload.
                  </p>
                </div>
              </div>
            </div>
          </HeroPreviewShell>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Globe,
  Layers3,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 md:px-6 md:pb-28 md:pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="grid-glow absolute inset-x-0 top-0 h-[34rem]" />
        <div className="absolute left-[10%] top-20 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute right-[8%] top-16 h-80 w-80 rounded-full bg-cyan-400/12 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="text-center lg:text-left">
          <div className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-zinc-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-ring rounded-full bg-zinc-200" />
            <Sparkles className="h-3.5 w-3.5" />
            Portfolio builder for developers and creators
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-balance md:text-7xl">
            Build a <span className="gradient-text">portfolio presence</span>
            <br />
            not just another profile page
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
            Pull in proof from GitHub and LeetCode, shape it into a polished site,
            choose a visual style, and publish a link recruiters can actually
            remember. Resume import is optional. Your public portfolio is the
            product.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/sign-up">
                Start Building <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full border-white/10 bg-white/3 px-8 text-zinc-300 hover:bg-white/6"
            >
              <Link href="#showcase">Explore Templates</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {[
              "GitHub and LeetCode imports",
              "Five polished public templates",
              "Publishable recruiter-ready link",
            ].map((item) => (
              <div
                key={item}
                className="glass rounded-full px-4 py-2 text-xs text-zinc-400"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="glass-card relative overflow-hidden rounded-[2rem] p-4 md:p-5">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-violet-500/14 via-cyan-400/10 to-transparent blur-2xl" />

            <div className="relative rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                    Portfolio OS
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-zinc-100">
                    Creator workspace
                  </h3>
                </div>
                <div className="glass rounded-full px-3 py-1 text-xs text-zinc-300">
                  Live Preview
                </div>
              </div>

              <div className="grid gap-3">
                <div className="glass rounded-2xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-200">
                      <Layers3 className="h-4 w-4 text-violet-300" />
                      Content completeness
                    </div>
                    <span className="text-xs text-zinc-400">84%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/6">
                    <div className="h-2 w-[84%] rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="glass rounded-2xl p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-zinc-200">
                      <WandSparkles className="h-4 w-4 text-cyan-300" />
                      Smart onboarding
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Import raw material from GitHub, LeetCode, or a resume and
                      refine it into a stronger story.
                    </p>
                  </div>

                  <div className="glass rounded-2xl p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-zinc-200">
                      <Globe className="h-4 w-4 text-violet-300" />
                      Public delivery
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Publish a clean `/p/slug` page that feels like a real product,
                      not an exported document.
                    </p>
                  </div>
                </div>

                <div className="glass rounded-2xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-200">Active template</span>
                    <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] text-zinc-400">
                      Developer
                    </span>
                  </div>
                  <div className="grid gap-2">
                    <div className="rounded-xl border border-white/6 bg-white/4 p-3 text-sm text-zinc-300">
                      Hero, projects, experience, and social proof all aligned for
                      public viewing.
                    </div>
                    <div className="flex gap-2">
                      <div className="h-16 flex-1 rounded-xl border border-white/6 bg-gradient-to-br from-white/7 to-white/2" />
                      <div className="h-16 w-24 rounded-xl border border-white/6 bg-gradient-to-br from-violet-400/20 to-cyan-300/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-4 glass rounded-2xl px-4 py-3 text-xs text-zinc-400">
            Recruiter-facing site in minutes
          </div>
        </div>
      </div>
    </section>
  );
}

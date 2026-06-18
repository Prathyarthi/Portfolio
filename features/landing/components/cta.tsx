"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getPortfolioRootDomain } from "@/lib/domain";
import { landingSurfaceInteractive } from "@/features/landing/surface";
import { cn } from "@/lib/utils";

export function CTA() {
  const reducedMotion = useReducedMotion();
  const reduce = Boolean(reducedMotion);
  const [subdomain, setSubdomain] = useState("");

  const rootDomain = getPortfolioRootDomain();

  return (
    <section className="px-4 py-20 md:px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className={cn(landingSurfaceInteractive, "px-6 py-10 text-center md:px-10 md:py-12")}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-48px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduce ? undefined : { y: -2 }}
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Ready
          </p>
          <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Ship a portfolio that feels <span className="gradient-text">intentional</span>
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-zinc-500 md:text-[15px]">
            Start with imports if they help—finish with a public page that matches how
            you actually work.
          </p>
          <form
            className="mx-auto mb-5 flex w-full max-w-xl flex-col items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/sign-up";
            }}
          >
            <div className="flex w-full items-stretch gap-3">
              <div className="flex h-12 flex-1 items-center rounded-full border border-white/10 bg-white/4 px-4 text-left shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]">
                <input
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="alex"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                  aria-label="Subdomain"
                />
                <div className="mx-3 h-6 w-px bg-white/10" aria-hidden="true" />
                <span className="shrink-0 text-sm text-zinc-400">.{rootDomain}</span>
              </div>

              <Button type="submit" size="lg" className="h-12 rounded-full px-7">
                Get started
              </Button>
            </div>

            <p className="text-sm text-zinc-500">
              Check and connect this domain when you publish.
            </p>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild className="rounded-full px-7">
              <Link href="/sign-up">
                Create your portfolio <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full border-white/10 bg-transparent px-7 text-zinc-300 hover:bg-white/5"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

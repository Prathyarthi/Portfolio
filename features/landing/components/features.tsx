"use client";

import { Code2, Globe, Palette } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { landingSurfaceInteractive } from "@/features/landing/surface";
import {
  landingGridContainerVariants,
  landingGridItemVariants,
  landingSectionHeaderProps,
} from "@/features/landing/motion-presets";
import { getPortfolioRootDomain } from "@/lib/domain";

const featureItems = (rootDomain: string) =>
  [
  {
    icon: GithubIcon,
    label: "GitHub import",
    tagline: "Structured proof",
    blurb: "Repos and profile pulled in as structured proof, not pasted bullets.",
    barClass: "bg-zinc-400/80",
  },
  {
    icon: Code2,
    label: "LeetCode signal",
    tagline: "Depth, not jargon",
    blurb: "Live stats that read as depth instead of a generic skills grid.",
    barClass: "bg-emerald-400/82",
  },
  {
    icon: Palette,
    label: "Template switch",
    tagline: "Same content",
    blurb: "Swap presentation without rewriting content—find the tone that fits.",
    barClass: "bg-violet-400/85",
  },
  {
    icon: Globe,
    label: "Public URL",
    tagline: "Shareable site",
    blurb: `A shareable subdomain like you.${rootDomain} that feels intentional, not like an export.`,
    barClass: "bg-cyan-400/78",
  },
  ] as const;

export function Features() {
  const reducedMotion = useReducedMotion();
  const reduce = Boolean(reducedMotion);
  const features = featureItems(getPortfolioRootDomain());

  const containerVariants = landingGridContainerVariants(reduce);
  const tileVariants = landingGridItemVariants(reduce);
  const headerMotion = landingSectionHeaderProps(reduce);

  return (
    <section id="features" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center md:mb-16"
          {...headerMotion}
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Essentials
          </p>
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-balance md:text-3xl">
            Everything you need, <span className="gradient-text">nothing noisy</span>
          </h2>
          <p className="text-sm leading-relaxed text-zinc-500 md:text-[15px]">
            Four pillars: import proof, shape the story, pick a look, ship a link.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-3 sm:grid-cols-2 sm:gap-4"
          variants={containerVariants}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, margin: "-40px", amount: 0.12 }}
        >
          {features.map((feature, index) => {
            const idx = String(index + 1).padStart(2, "0");
            return (
              <motion.div key={feature.label} variants={tileVariants} className="min-h-0">
                <article
                  className={cn(
                    landingSurfaceInteractive,
                    "group relative flex h-full flex-col p-5 md:p-6"
                  )}
                >
                  <motion.div
                    className="flex h-full w-full flex-col"
                    whileHover={reduce ? undefined : { y: -2 }}
                    transition={{ type: "spring", stiffness: 440, damping: 30 }}
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tabular-nums tracking-widest text-zinc-600">
                        {idx}
                      </span>
                      <div
                        className={cn(
                          "h-[3px] origin-left rounded-full transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                          "w-11 opacity-60 group-hover:w-[4.25rem] group-hover:opacity-100",
                          feature.barClass
                        )}
                      />
                    </div>

                    <div className="mb-3 flex items-center gap-2.5">
                      <feature.icon className="h-4 w-4 shrink-0 text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400" />
                      <h3 className="text-lg font-medium tracking-tight text-zinc-100 md:text-xl">
                        {feature.label}
                      </h3>
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                      {feature.tagline}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500 md:text-[15px]">
                      {feature.blurb}
                    </p>
                  </motion.div>
                </article>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mt-12 text-center text-xs text-zinc-600">
          Edit → preview → publish in one calm loop.
        </p>
      </div>
    </section>
  );
}

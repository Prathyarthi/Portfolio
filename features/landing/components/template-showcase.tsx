"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { landingSurfaceInteractive, landingFocusRing } from "@/features/landing/surface";
import {
  landingGridContainerVariants,
  landingGridItemVariants,
  landingSectionHeaderProps,
} from "@/features/landing/motion-presets";
import { TemplateMicroScene } from "@/features/landing/components/template-micro-scenes";

const templates = [
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Quiet structure",
    description: "Generous space and restrained type for a confident, calm read.",
    barClass: "bg-zinc-400/80",
  },
  {
    id: "modern",
    name: "Modern",
    tagline: "Product depth",
    description: "Layered surfaces and contrast that feel current without shouting.",
    barClass: "bg-violet-400/85",
  },
  {
    id: "developer",
    name: "Developer",
    tagline: "Technical tone",
    description: "Monospace cues and grid logic that match how engineers present work.",
    barClass: "bg-emerald-400/82",
  },
  {
    id: "creative",
    name: "Creative",
    tagline: "Expressive rhythm",
    description: "Warmer motion and asymmetry for portfolios that lead with craft.",
    barClass: "bg-rose-400/80",
  },
] as const;

function TemplateTile({
  template,
  index,
  variants,
  reducedMotion,
}: {
  template: (typeof templates)[number];
  index: number;
  variants: ReturnType<typeof landingGridItemVariants>;
  reducedMotion: boolean | null;
}) {
  const idx = String(index + 1).padStart(2, "0");

  return (
    <motion.div variants={variants} className="min-h-0">
      <Link
        href="/sign-up"
        className={cn(
          landingSurfaceInteractive,
          landingFocusRing,
          "group block h-full p-5 md:p-6"
        )}
      >
        <motion.div
          className="flex h-full w-full flex-col"
          whileHover={reducedMotion ? undefined : { y: -2 }}
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
                template.barClass
              )}
            />
          </div>

          <TemplateMicroScene id={template.id} reduced={Boolean(reducedMotion)} />

          <div className="flex flex-1 flex-col">
            <h3 className="text-lg font-medium tracking-tight text-zinc-100 md:text-xl">
              {template.name}
            </h3>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
              {template.tagline}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500 md:text-[15px]">
              {template.description}
            </p>

            <div className="mt-5 flex items-center gap-1 text-xs font-medium text-zinc-600 transition-colors group-hover:text-zinc-400">
              <span>Start with this look</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function TemplateShowcase() {
  const reducedMotion = useReducedMotion();
  const reduce = Boolean(reducedMotion);

  const containerVariants = landingGridContainerVariants(reduce);
  const tileVariants = landingGridItemVariants(reduce);
  const headerMotion = landingSectionHeaderProps(reduce);

  return (
    <section id="showcase" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center md:mb-16"
          {...headerMotion}
        >
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            Templates
          </p>
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-balance md:text-3xl">
            Same story. <span className="gradient-text">Different first impression.</span>
          </h2>
          <p className="text-sm leading-relaxed text-zinc-500 md:text-[15px]">
            Your sections stay put—you only change presentation. Five layouts ship in
            the app; four are highlighted here.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-3 sm:grid-cols-2 sm:gap-4"
          variants={containerVariants}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, margin: "-40px", amount: 0.12 }}
        >
          {templates.map((t, i) => (
            <TemplateTile
              key={t.id}
              template={t}
              index={i}
              variants={tileVariants}
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

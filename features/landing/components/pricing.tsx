"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { pricingPlans } from "@/lib/pricing";
import { PlanPrice } from "@/features/subscriptions/components/plan-price";
import { cn } from "@/lib/utils";
import { landingSurfaceInteractive } from "@/features/landing/surface";
import {
  landingGridContainerVariants,
  landingGridItemVariants,
  landingSectionHeaderProps,
} from "@/features/landing/motion-presets";

/** Homepage teaser — two plans; full comparison on /pricing */
export function Pricing() {
  const reducedMotion = useReducedMotion();
  const reduce = Boolean(reducedMotion);
  const containerVariants = landingGridContainerVariants(reduce);
  const tileVariants = landingGridItemVariants(reduce);
  const headerMotion = landingSectionHeaderProps(reduce);

  return (
    <section id="pricing" className="scroll-mt-20 px-4 py-20 md:px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div {...headerMotion} className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-500 md:text-[15px]">
            Two plans—start free, or open the full page for Pro with monthly,
            quarterly, or yearly billing.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4"
          variants={containerVariants}
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, margin: "-40px", amount: 0.12 }}
        >
          {pricingPlans.map((plan) => (
            <motion.div key={plan.slug} variants={tileVariants}>
              <Card
                className={cn(
                  landingSurfaceInteractive,
                  "relative overflow-hidden p-0 shadow-none",
                  plan.highlight &&
                    "border-teal-500/25 shadow-[0_0_0_1px_rgba(45,212,191,0.08)]"
                )}
              >
                {plan.badge ? (
                  <div className="absolute -top-2.5 right-4">
                    <Badge className="rounded-full border border-teal-400/30 bg-teal-500/15 text-[10px] uppercase tracking-wider text-teal-200">
                      {plan.badge}
                    </Badge>
                  </div>
                ) : null}
                <CardContent className="relative flex flex-col gap-4 p-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      {plan.eyebrow}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
                      {plan.name}
                    </h3>
                    <PlanPrice
                      amount={plan.monthlyAmount}
                      period={plan.pricePeriod}
                      size="sm"
                      className="mt-3"
                    />
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {plan.features.slice(0, 4).map((feature) => (
                      <div key={feature.label} className="text-sm text-zinc-500">
                        {feature.included ? "✓" : "–"} {feature.label}
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    variant={plan.highlight ? "default" : "outline"}
                    className={
                      plan.highlight
                        ? "mt-auto rounded-full"
                        : "mt-auto rounded-full border-white/10 text-zinc-400 hover:bg-white/[0.05]"
                    }
                  >
                    <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <p className="mx-auto mt-8 max-w-md text-center text-xs text-zinc-600 md:text-sm">
          <Link
            href="/pricing"
            className="text-teal-400/90 underline-offset-4 hover:text-teal-300 hover:underline"
          >
            Full plan details and subscribe
          </Link>
          <span className="text-zinc-700"> · </span>
          Monthly, quarterly, or yearly Pro billing.
        </p>
      </div>
    </section>
  );
}

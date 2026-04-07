"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PricingPlan } from "@/lib/pricing";
import { PAID_PLAN_SLUG } from "@/lib/pricing";

interface PricingCardsProps {
  plans: PricingPlan[];
  loggedIn: boolean;
  paidActive: boolean;
  paidPending: boolean;
  paymentsReady: boolean;
  subscribing: boolean;
  onSubscribePaid: () => void;
}

export function PricingCards({
  plans,
  loggedIn,
  paidActive,
  paidPending,
  paymentsReady,
  subscribing,
  onSubscribePaid,
}: PricingCardsProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6">
      {plans.map((plan) => {
        const isPaid = plan.slug === PAID_PLAN_SLUG;
        const showSubscribe =
          isPaid && loggedIn && !paidActive && paymentsReady && !paidPending;
        const showSubscribeDisabled =
          isPaid && loggedIn && !paidActive && !paymentsReady && !paidPending;

        return (
          <div key={plan.slug} className="relative">
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0">
                <Badge className="rounded-full border border-teal-400/30 bg-teal-500/15 px-3 py-1 text-[10px] uppercase tracking-wider text-teal-200">
                  {plan.badge}
                </Badge>
              </div>
            )}
            <Card
              className={`h-full rounded-2xl md:rounded-3xl ${
                plan.highlight
                  ? "border-teal-500/25 bg-gradient-to-b from-teal-500/[0.06] to-transparent shadow-[0_0_0_1px_rgba(45,212,191,0.12)]"
                  : "border-white/[0.08]"
              }`}
            >
              <CardContent className="flex h-full flex-col gap-6 p-6 md:p-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                    {plan.eyebrow}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-zinc-100 md:text-2xl">
                    {plan.name}
                  </h2>
                  <div className="mt-5 flex flex-wrap items-baseline gap-2">
                    <span className="gradient-text text-4xl font-bold tabular-nums md:text-5xl">
                      {plan.monthlyPrice}
                    </span>
                    {plan.pricePeriod && (
                      <span className="text-sm text-zinc-500">
                        {plan.pricePeriod}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                    {plan.description}
                  </p>
                  {isPaid && paidActive && (
                    <p className="mt-3 text-xs text-teal-400/90">
                      Your subscription is active.
                    </p>
                  )}
                  {isPaid && paidPending && (
                    <p className="mt-3 text-xs text-amber-400/90">
                      Payment pending — open checkout again or wait for
                      confirmation.
                    </p>
                  )}
                  {isPaid && loggedIn && !paymentsReady && !paidActive && (
                    <p className="mt-3 text-xs text-zinc-600">
                      Payments are not configured.
                    </p>
                  )}
                  {plan.note && !isPaid && (
                    <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                      {plan.note}
                    </p>
                  )}
                  {isPaid && plan.note && !paidActive && (
                    <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                      {plan.note}
                    </p>
                  )}
                </div>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex gap-3 text-sm leading-snug"
                    >
                      <span
                        className={`w-5 shrink-0 text-center ${
                          feature.included ? "text-teal-400" : "text-zinc-700"
                        }`}
                        aria-hidden
                      >
                        {feature.included ? "✓" : "–"}
                      </span>
                      <span
                        className={
                          feature.included ? "text-zinc-300" : "text-zinc-600"
                        }
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.slug === "starter" && (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-auto w-full rounded-full border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/10"
                  >
                    <Link href={loggedIn ? "/dashboard" : plan.ctaHref}>
                      {loggedIn ? "Continue with Free" : plan.ctaLabel}
                    </Link>
                  </Button>
                )}

                {isPaid && !loggedIn && (
                  <Button asChild className="mt-auto w-full rounded-full">
                    <Link href="/sign-up">Sign up to subscribe</Link>
                  </Button>
                )}

                {isPaid && loggedIn && paidActive && (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-auto w-full rounded-full border-white/15 bg-white/[0.03] text-zinc-100 hover:bg-white/10"
                  >
                    <Link href="/dashboard/settings">Manage billing</Link>
                  </Button>
                )}

                {isPaid && loggedIn && showSubscribe && (
                  <Button
                    type="button"
                    className="mt-auto w-full rounded-full bg-teal-500 text-teal-950 hover:bg-teal-400"
                    disabled={subscribing}
                    onClick={onSubscribePaid}
                  >
                    {subscribing ? "Opening checkout…" : "Subscribe to Pro"}
                  </Button>
                )}

                {isPaid && loggedIn && showSubscribeDisabled && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-auto w-full rounded-full border-white/15 bg-white/[0.03] text-zinc-300 opacity-90"
                    disabled
                  >
                    Subscribe to Pro
                  </Button>
                )}

                {isPaid && loggedIn && paidPending && paymentsReady && (
                  <Button
                    type="button"
                    className="mt-auto w-full rounded-full bg-teal-500 text-teal-950 hover:bg-teal-400"
                    disabled={subscribing}
                    onClick={onSubscribePaid}
                  >
                    {subscribing ? "Opening checkout…" : "Complete subscription"}
                  </Button>
                )}

                {isPaid && loggedIn && paidPending && !paymentsReady && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-auto w-full rounded-full border-white/15 bg-white/[0.03] text-zinc-300 opacity-90"
                    disabled
                  >
                    Complete subscription
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

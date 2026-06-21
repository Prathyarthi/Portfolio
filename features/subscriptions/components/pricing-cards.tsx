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
                <Badge variant="brand">Most popular</Badge>
              </div>
            )}
            <Card
              className={`h-full ${
                plan.highlight
                  ? "border-2 border-brand-primary"
                  : "border-border-default"
              }`}
            >
              <CardContent className="flex h-full flex-col gap-6">
                <div>
                  <p className="text-label uppercase text-text-secondary">
                    {plan.eyebrow}
                  </p>
                  <h2 className="mt-2 text-h2 text-text-primary">
                    {plan.name}
                  </h2>
                  <div className="mt-5 flex flex-wrap items-baseline gap-2">
                    <span className="text-display tabular-nums text-text-primary">
                      {plan.monthlyPrice}
                    </span>
                    {plan.pricePeriod && (
                      <span className="text-body-sm text-text-muted">
                        {plan.pricePeriod}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-body-sm text-text-secondary">
                    {plan.description}
                  </p>
                  {isPaid && paidActive && (
                    <p className="mt-3 text-xs text-success">
                      Your subscription is active.
                    </p>
                  )}
                  {isPaid && paidPending && (
                    <p className="mt-3 text-xs text-text-secondary">
                      Payment pending — open checkout again or wait for
                      confirmation.
                    </p>
                  )}
                  {isPaid && loggedIn && !paymentsReady && !paidActive && (
                    <p className="mt-3 text-xs text-text-muted">
                      Payments are not configured.
                    </p>
                  )}
                  {plan.note && !isPaid && (
                    <p className="mt-3 text-xs text-text-muted">{plan.note}</p>
                  )}
                  {isPaid && plan.note && !paidActive && (
                    <p className="mt-3 text-xs text-text-muted">{plan.note}</p>
                  )}
                </div>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex gap-3 text-body-sm leading-snug"
                    >
                      <span
                        className={`w-5 shrink-0 text-center ${
                          feature.included ? "text-success" : "text-text-muted"
                        }`}
                        aria-hidden
                      >
                        {feature.included ? "✓" : "–"}
                      </span>
                      <span
                        className={
                          feature.included ? "text-text-primary" : "text-text-muted"
                        }
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.slug === "starter" && (
                  <Button asChild variant="outline" className="mt-auto w-full">
                    <Link href={loggedIn ? "/dashboard" : plan.ctaHref}>
                      {loggedIn ? "Continue with Free" : plan.ctaLabel}
                    </Link>
                  </Button>
                )}

                {isPaid && !loggedIn && (
                  <Button asChild className="mt-auto w-full">
                    <Link href="/sign-up">Sign up to subscribe</Link>
                  </Button>
                )}

                {isPaid && loggedIn && paidActive && (
                  <Button asChild variant="outline" className="mt-auto w-full">
                    <Link href="/dashboard/settings">Manage billing</Link>
                  </Button>
                )}

                {isPaid && loggedIn && showSubscribe && (
                  <Button
                    type="button"
                    className="mt-auto w-full"
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
                    className="mt-auto w-full"
                    disabled
                  >
                    Subscribe to Pro
                  </Button>
                )}

                {isPaid && loggedIn && paidPending && paymentsReady && (
                  <Button
                    type="button"
                    className="mt-auto w-full"
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
                    className="mt-auto w-full"
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

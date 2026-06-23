import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Minus, ArrowRight } from "lucide-react";
import { pricingPlans } from "@/lib/pricing";
import { PlanPrice } from "@/features/subscriptions/components/plan-price";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 px-6 py-[var(--space-9)]">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow uppercase">Pricing</p>
          <h2 className="mt-3 text-h1 text-text-primary">
            Start free. Upgrade when it counts.
          </h2>
          <p className="prose-measure mx-auto mt-4 text-body text-text-secondary">
            Full access for your first month — no credit card, no catch.
          </p>
        </div>

        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <div
              key={plan.slug}
              className={cn(
                "relative flex flex-col rounded-[var(--radius-lg)] bg-surface-raised p-7 shadow-[var(--shadow-card)] transition-all duration-200 ease-[var(--ease-out)]",
                plan.highlight
                  ? "border-2 border-brand-secondary"
                  : "border border-border-default hover:border-border-strong"
              )}
            >
              {plan.badge && (
                <div className="absolute right-6 top-0 -translate-y-1/2">
                  <Badge variant="brand">{plan.badge}</Badge>
                </div>
              )}

              <p className="text-label uppercase text-text-secondary">
                {plan.eyebrow}
              </p>
              <h3 className="mt-1.5 text-h2 text-text-primary">{plan.name}</h3>

              <PlanPrice
                amount={plan.monthlyAmount}
                period={plan.pricePeriod}
                size="sm"
                className="mt-4"
              />

              <p className="prose-measure mt-3 text-body-sm text-text-secondary">
                {plan.description}
              </p>

              <ul className="mb-7 mt-6 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li
                    key={f.label}
                    className={cn(
                      "flex items-start gap-2.5 text-body-sm",
                      f.included ? "text-text-primary" : "text-text-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        f.included ? "bg-success-bg" : "bg-surface-sunken"
                      )}
                    >
                      {f.included ? (
                        <Check className="h-3 w-3 text-success" aria-hidden />
                      ) : (
                        <Minus className="h-3 w-3 text-text-muted" aria-hidden />
                      )}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button
                  asChild
                  variant={plan.highlight ? "accent" : "outline"}
                  className="w-full"
                >
                  <Link href={plan.ctaHref}>
                    {plan.ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-body-sm text-text-muted">
          <Link
            href="/pricing"
            className="font-medium text-brand-primary hover:text-brand-dark"
          >
            Full plan comparison
          </Link>
          <span className="mx-2" aria-hidden>
            &middot;
          </span>
          USD &amp; INR pricing &middot; Secure checkout via Razorpay
        </p>
      </div>
    </section>
  );
}

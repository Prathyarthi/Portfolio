import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { pricingPlans } from "@/lib/pricing";

/** Homepage teaser — matches Xchat landing: first 4 features, Pro links to full pricing */
export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 px-6 py-20 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-extrabold md:text-4xl">
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mx-auto max-w-xl text-sm text-zinc-600">
            Two plans: start free, or open the full comparison to upgrade when you
            want priority support and early access.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.slug}
              className={`relative rounded-3xl ${
                plan.highlight
                  ? "border-teal-500/20 shadow-[0_0_0_1px_rgba(45,212,191,0.1)]"
                  : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 right-4">
                  <Badge className="rounded-full border border-teal-400/30 bg-teal-500/15 text-[10px] uppercase tracking-wider text-teal-200">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="flex flex-col gap-4 p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-700">
                    {plan.eyebrow}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-zinc-100">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <p className="gradient-text text-3xl font-bold tabular-nums">
                      {plan.monthlyPrice}
                    </p>
                    {plan.pricePeriod && (
                      <span className="text-sm text-zinc-500">
                        {plan.pricePeriod}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {plan.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {plan.features.slice(0, 4).map((feature) => (
                    <div key={feature.label} className="text-sm text-zinc-400">
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
                      : "mt-auto rounded-full border-white/8 text-zinc-500 hover:bg-white/5"
                  }
                >
                  <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-zinc-500">
          <Link
            href="/pricing"
            className="text-teal-400/90 underline-offset-4 hover:text-teal-300 hover:underline"
          >
            View full plan details and subscribe
          </Link>
          {" · "}
          Prices in INR.
        </p>
      </div>
    </section>
  );
}

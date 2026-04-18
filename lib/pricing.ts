export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  /** Main price line shown on cards */
  monthlyPrice: string;
  /** Shown next to the price, e.g. /month */
  pricePeriod?: string;
  ctaLabel: string;
  ctaHref: string;
  /** Used on the full pricing page when the paid plan CTA is not checkout */
  pricingPageCta?: { label: string; href: string };
  highlight?: boolean;
  badge?: string;
  note?: string;
  features: PricingFeature[];
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);

export const pricingPlans: PricingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    eyebrow: "Start building",
    description:
      "Try every workflow free for one month, then continue on the essentials.",
    monthlyPrice: inr(0),
    pricePeriod: "for 1 month",
    ctaLabel: "Start free",
    ctaHref: "/sign-up",
    note: "After your free month ends, you can continue on Minimal template with core editing and publishing. Imports require Pro.",
    features: [
      { label: "Public portfolio at your Foliofy link", included: true },
      { label: "Resume, GitHub, and LeetCode imports during free month", included: true },
      { label: "Editor, live preview, and publish", included: true },
      { label: "All templates during free month", included: true },
      { label: "Priority email support", included: false },
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    eyebrow: "Stand out",
    description:
      "For active job search and a stronger public presence—with room to grow.",
    monthlyPrice: inr(599),
    pricePeriod: "/month",
    note: `${inr(5999)} / year (save ~17%). Pay securely with Razorpay when billing is enabled.`,
    ctaLabel: "See Pro benefits",
    ctaHref: "/pricing",
    pricingPageCta: { label: "Upgrade to Pro", href: "/sign-up" },
    highlight: true,
    badge: "Popular",
    features: [
      { label: "Everything in Starter", included: true },
      { label: "Priority email support", included: true },
      { label: "Early access to new templates and tools", included: true },
      { label: "AI-assisted polish where it speeds you up", included: true },
      { label: "Best for frequent updates before interviews", included: true },
      { label: "Dedicated success touchpoints", included: false },
    ],
  },
];

/** Paid plan slug — drives subscribe / billing UI in PricingCards */
export const PAID_PLAN_SLUG = "pro" as const;

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
      "Ship a credible public portfolio with imports and a clean publish loop.",
    monthlyPrice: inr(0),
    pricePeriod: "forever",
    ctaLabel: "Start free",
    ctaHref: "/sign-up",
    features: [
      { label: "Public portfolio at your Foliofy link", included: true },
      { label: "GitHub and LeetCode imports", included: true },
      { label: "Resume-assisted onboarding", included: true },
      { label: "Editor, live preview, and publish", included: true },
      { label: "Switch between portfolio templates", included: true },
      { label: "Priority email support", included: false },
    ],
  },
  {
    slug: "pro",
    name: "Pro",
    eyebrow: "Stand out",
    description:
      "For active job search and a stronger public presence—with room to grow.",
    monthlyPrice: inr(299),
    pricePeriod: "/month",
    note: `${inr(2999)} / year (save ~17%). Pay securely with Razorpay when billing is enabled.`,
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

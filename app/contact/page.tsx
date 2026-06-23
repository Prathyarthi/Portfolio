import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/features/landing/components/marketing-page-shell";
import { siteConfig } from "@/lib/site";
import { landingSurfaceMuted } from "@/features/landing/surface";
import { cn } from "@/lib/utils";
import { Mail, MessageCircle, BookOpen, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: `Contact / Support | ${siteConfig.name}`,
  description: `Get help with ${siteConfig.name} — billing, publishing, imports, and account support.`,
};

const supportTopics = [
  {
    icon: BookOpen,
    title: "Getting started",
    description:
      "Sign up, pick a template, import your resume or GitHub, and publish your first portfolio.",
    href: "/sign-up",
    linkLabel: "Create account",
  },
  {
    icon: CreditCard,
    title: "Billing & subscriptions",
    description:
      "Upgrade to Pro, manage renewal, or cancel from your dashboard settings.",
    href: "/dashboard/settings",
    linkLabel: "Open settings",
  },
  {
    icon: MessageCircle,
    title: "Product questions",
    description:
      "Templates, imports, editor, preview, and publishing — we're happy to help.",
    href: `mailto:${siteConfig.supportEmail}`,
    linkLabel: "Email support",
  },
];

export default function ContactPage() {
  return (
    <MarketingPageShell>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
            Support
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">
            Contact / Support
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 md:text-base">
            Need help with your portfolio, billing, or account? Reach out — we
            typically respond within one business day.
          </p>
        </header>

        <div
          className={cn(
            landingSurfaceMuted,
            "mb-8 flex flex-col items-center gap-4 px-6 py-10 text-center md:rounded-3xl md:px-10"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/10">
            <Mail className="h-5 w-5 text-teal-400" aria-hidden />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Email us at</p>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="mt-1 inline-block text-lg font-semibold text-teal-400 transition-colors hover:text-teal-300"
            >
              {siteConfig.supportEmail}
            </a>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-500">
            Include your account email and a short description of the issue. For
            billing disputes, mention the charge date and amount.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {supportTopics.map((topic) => (
            <div
              key={topic.title}
              className={cn(landingSurfaceMuted, "flex flex-col p-5 md:rounded-2xl")}
            >
              <topic.icon className="h-5 w-5 text-zinc-400" aria-hidden />
              <h2 className="mt-4 text-base font-semibold text-zinc-100">
                {topic.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                {topic.description}
              </p>
              <Link
                href={topic.href}
                className="mt-4 text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
              >
                {topic.linkLabel} →
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-zinc-600">
          Legal:{" "}
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300">
            Terms
          </Link>
          {" · "}
          <Link href="/refund-policy" className="text-zinc-500 hover:text-zinc-300">
            Refund Policy
          </Link>
        </p>
      </div>
    </MarketingPageShell>
  );
}

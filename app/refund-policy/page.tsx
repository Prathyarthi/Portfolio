import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/features/landing/components/marketing-page-shell";
import { LegalDocument } from "@/features/landing/components/legal-document";
import { siteConfig } from "@/lib/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Refund Policy",
  description: `Refund and cancellation policy for ${siteConfig.name} Pro subscriptions and billing disputes.`,
  path: "/refund-policy",
  openGraphType: "article",
});

export default function RefundPolicyPage() {
  return (
    <MarketingPageShell>
      <LegalDocument title="Refund Policy" lastUpdated="June 22, 2026">
        <p>
          This Refund Policy explains how cancellations and refunds work for paid
          subscriptions to {siteConfig.name}. By subscribing to a paid plan, you agree
          to this policy in addition to our{" "}
          <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>

        <h2>Free trial and Starter plan</h2>
        <p>
          New accounts receive a one-month trial of core workflows on the Starter plan
          at no charge. No payment is collected during the trial unless you
          separately subscribe to Pro. After the trial, you may continue on free
          essentials or upgrade to Pro.
        </p>

        <h2>Pro subscriptions</h2>
        <p>
          Pro is a recurring subscription billed monthly, quarterly, or yearly through Razorpay.
          Your subscription renews automatically at the end of each billing period
          unless you cancel before renewal.
        </p>

        <h2>Cancellation</h2>
        <ul>
          <li>
            You can cancel your subscription at any time from{" "}
            <Link href="/dashboard/settings">Dashboard → Settings</Link> or the
            billing page
          </li>
          <li>
            Cancellation stops future charges; you keep Pro access until the end of
            the current paid period
          </li>
          <li>
            After the paid period ends, your account moves to the applicable free
            tier and premium features may be limited
          </li>
        </ul>

        <h2>Refund eligibility</h2>
        <p>
          We want you to be satisfied with {siteConfig.name}. Refund requests are
          reviewed on a case-by-case basis:
        </p>
        <ul>
          <li>
            <strong className="text-zinc-300">Within 7 days of first Pro charge</strong>{" "}
            — if you have not substantially used premium features (such as resume
            import or premium templates), contact us for a full refund of that
            billing period
          </li>
          <li>
            <strong className="text-zinc-300">Duplicate or erroneous charges</strong>{" "}
            — contact us promptly and we will investigate and refund verified errors
          </li>
          <li>
            <strong className="text-zinc-300">Service issues</strong> — if a
            prolonged outage or billing error prevented reasonable use of Pro, we may
            offer a partial or full credit at our discretion
          </li>
        </ul>

        <h2>Non-refundable situations</h2>
        <p>We generally do not offer refunds when:</p>
        <ul>
          <li>You cancel after the current billing period has started and you have used Pro features</li>
          <li>You forgot to cancel before renewal but continued using the Service</li>
          <li>The request is made outside a reasonable window without a documented billing error</li>
          <li>Your account was terminated for violating our Terms</li>
        </ul>

        <h2>How to request a refund</h2>
        <p>
          Email{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>{" "}
          from the address associated with your account. Include your account email,
          the charge date, and a brief description of the issue. We aim to respond
          within 3–5 business days.
        </p>
        <p>
          Approved refunds are processed through Razorpay to your original payment
          method. Timing depends on your bank or card issuer and may take 5–10
          business days to appear.
        </p>

        <h2>Chargebacks</h2>
        <p>
          If you have a billing concern, please contact us before initiating a
          chargeback. Unauthorized chargebacks may result in account suspension while
          the dispute is resolved.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Refund Policy from time to time. The version posted on
          this page applies to purchases made after the updated date.
        </p>

        <h2>Contact</h2>
        <p>
          Billing questions? Visit <Link href="/contact">Contact / Support</Link> or
          email{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
        </p>
      </LegalDocument>
    </MarketingPageShell>
  );
}

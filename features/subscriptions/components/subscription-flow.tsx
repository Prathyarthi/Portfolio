"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { pricingPlans } from "@/lib/pricing";
import { PricingCards } from "./pricing-cards";

export function SubscriptionFlow() {
  const { data: session, status } = useSession();
  const authLoading = status === "loading";
  const user = session?.user;

  const [subscribing, setSubscribing] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [paymentsReady, setPaymentsReady] = useState(false);
  const [paidActive, setPaidActive] = useState(false);
  const [paidPending, setPaidPending] = useState(false);
  const [accessTier, setAccessTier] = useState<"free" | "trial" | "pro" | null>(
    null
  );
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);

  useEffect(() => {
    if (!user) {
      setPaymentsReady(false);
      setPaidActive(false);
      setPaidPending(false);
      setAccessTier(null);
      setTrialDaysRemaining(0);
      return;
    }

    let cancelled = false;
    const loadBillingState = async () => {
      setBillingLoading(true);
      try {
        const res = await fetch("/api/billing/me", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as {
          razorpayReady?: boolean;
          subscription?: { status?: string } | null;
          access?: { tier?: "free" | "trial" | "pro"; trialDaysRemaining?: number };
        };
        if (cancelled) return;

        setPaymentsReady(Boolean(data.razorpayReady));
        setPaidActive(data.subscription?.status === "ACTIVE");
        setPaidPending(data.subscription?.status === "PENDING");
        setAccessTier(data.access?.tier ?? null);
        setTrialDaysRemaining(data.access?.trialDaysRemaining ?? 0);
      } catch {
        if (cancelled) return;
        setPaymentsReady(false);
        setPaidActive(false);
        setPaidPending(false);
        setAccessTier(null);
        setTrialDaysRemaining(0);
      } finally {
        if (!cancelled) setBillingLoading(false);
      }
    };

    loadBillingState();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const subscribeToPaid = useCallback(async () => {
    setBanner(null);
    setSubscribing(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        checkoutUrl?: string;
      };
      if (!res.ok) {
        setBanner(
          typeof body.error === "string"
            ? body.error
            : "Checkout could not be started."
        );
        return;
      }

      if (body.checkoutUrl) {
        window.location.href = body.checkoutUrl;
        return;
      }

      setBanner("Checkout link was not returned by server.");
    } catch {
      setBanner("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  }, []);

  if (authLoading || billingLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="skeleton-shimmer h-96 rounded-[var(--radius-lg)]" />
        <div className="skeleton-shimmer h-96 rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {banner && (
        <p className="rounded-[var(--radius-md)] bg-danger-bg px-4 py-3 text-center text-body-sm text-danger">
          <span>{banner}</span>{" "}
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="underline hover:opacity-80"
          >
            Dismiss
          </button>
        </p>
      )}
      {accessTier === "trial" && (
        <p className="rounded-[var(--radius-md)] bg-success-bg px-4 py-3 text-center text-body-sm text-success">
          You are on your free month. {trialDaysRemaining} day
          {trialDaysRemaining === 1 ? "" : "s"} remaining with full features.
        </p>
      )}
      {accessTier === "free" && (
        <p className="rounded-[var(--radius-md)] bg-warning-bg px-4 py-3 text-center text-body-sm text-text-secondary">
          Your free month ended. Free essentials remain active; upgrade to Pro
          for imports (resume, GitHub, LeetCode) and premium templates.
        </p>
      )}
      <PricingCards
        plans={pricingPlans}
        loggedIn={Boolean(user)}
        paidActive={paidActive}
        paidPending={paidPending}
        paymentsReady={paymentsReady}
        subscribing={subscribing}
        onSubscribePaid={subscribeToPaid}
      />
    </div>
  );
}

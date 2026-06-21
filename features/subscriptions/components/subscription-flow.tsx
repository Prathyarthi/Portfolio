"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { pricingPlans } from "@/lib/pricing";
import { PricingCards } from "./pricing-cards";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
        keyId?: string;
        subscriptionId?: string;
        email?: string;
      };
      if (!res.ok) {
        setBanner(
          typeof body.error === "string"
            ? body.error
            : "Checkout could not be started."
        );
        setSubscribing(false);
        return;
      }

      if (!razorpayLoaded || !window.Razorpay) {
        setBanner("Payment system is loading. Please try again.");
        setSubscribing(false);
        return;
      }

      const options = {
        key: body.keyId,
        subscription_id: body.subscriptionId,
        name: "Portfolio Pro",
        description: "Monthly Pro Subscription",
        callback_url: `${window.location.origin}/dashboard/billing?return=true`,
        prefill: {
          email: body.email || "",
        },
        theme: {
          color: "#14b8a6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setSubscribing(false);
    } catch {
      setBanner("Something went wrong. Please try again.");
      setSubscribing(false);
    }
  }, [razorpayLoaded]);

  if (authLoading || billingLoading) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-5 md:grid-cols-2">
        <div className="h-96 rounded-3xl bg-white/4" />
        <div className="h-96 rounded-3xl bg-white/4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {banner && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
          <span>{banner}</span>{" "}
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-zinc-400 underline hover:text-zinc-200"
          >
            Dismiss
          </button>
        </p>
      )}
      {accessTier === "trial" && (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-300">
          You are on your free month. {trialDaysRemaining} day
          {trialDaysRemaining === 1 ? "" : "s"} remaining with full features.
        </p>
      )}
      {accessTier === "free" && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-200">
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

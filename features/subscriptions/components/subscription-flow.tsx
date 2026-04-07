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

  useEffect(() => {
    if (!user) {
      setPaymentsReady(false);
      setPaidActive(false);
      setPaidPending(false);
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
        };
        if (cancelled) return;

        setPaymentsReady(Boolean(data.razorpayReady));
        setPaidActive(data.subscription?.status === "ACTIVE");
        setPaidPending(data.subscription?.status === "PENDING");
      } catch {
        if (cancelled) return;
        setPaymentsReady(false);
        setPaidActive(false);
        setPaidPending(false);
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
      <div className="grid animate-pulse grid-cols-1 gap-5 md:grid-cols-2">
        <div className="h-96 rounded-3xl bg-white/[0.04]" />
        <div className="h-96 rounded-3xl bg-white/[0.04]" />
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

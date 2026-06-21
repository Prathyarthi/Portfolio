"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, Crown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";

interface BillingState {
  razorpayReady: boolean;
  subscription: { status: "ACTIVE" | "PENDING" } | null;
  access: {
    tier: "free" | "trial" | "pro";
    trialDaysRemaining: number;
    canUsePremiumTemplates: boolean;
    canUseImports: boolean;
  } | null;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment_status") === "success";

  const [billing, setBilling] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBilling = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/me", { cache: "no-store" });
      const data = await res.json();
      setBilling(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const subscribe = async () => {
    setError(null);
    setSubscribing(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Checkout could not be started.");
        return;
      }
      if (body.checkoutUrl) {
        window.location.href = body.checkoutUrl;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
      </div>
    );
  }

  const tier = billing?.access?.tier ?? "free";
  const isPro = tier === "pro";
  const isTrial = tier === "trial";
  const isFree = tier === "free";
  const trialDays = billing?.access?.trialDaysRemaining ?? 0;
  const paymentsReady = billing?.razorpayReady ?? false;
  const isPending = billing?.subscription?.status === "PENDING";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-6">
      <div>
        <h1 className="text-h2 text-text-primary">Billing</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          Manage your plan and subscription.
        </p>
      </div>

      {paymentSuccess && (
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-success-bg px-4 py-3 text-body-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Payment received — your subscription is being activated. This page will
          reflect the change shortly.
        </div>
      )}

      {error && (
        <p className="rounded-[var(--radius-md)] bg-danger-bg px-4 py-3 text-body-sm text-danger">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <CreditCard className="h-5 w-5" aria-hidden />
              Current plan
            </CardTitle>
            <Badge variant={isPro || isTrial ? "success" : "neutral"}>
              {isPro ? "Pro" : isTrial ? "Free trial" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro && (
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-bg px-4 py-3">
              <Crown className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <div>
                <p className="text-body-sm font-medium text-text-primary">
                  Pro subscription is active
                </p>
                <p className="mt-0.5 text-body-sm text-text-secondary">
                  All templates and features are unlocked.
                </p>
              </div>
            </div>
          )}

          {isTrial && (
            <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-success-bg px-4 py-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
              <div>
                <p className="text-body-sm font-medium text-text-primary">
                  Free trial active
                </p>
                <p className="mt-0.5 text-body-sm text-text-secondary">
                  {trialDays} day{trialDays === 1 ? "" : "s"} remaining — all
                  features unlocked during trial.
                </p>
              </div>
            </div>
          )}

          {isFree && (
            <div className="rounded-[var(--radius-md)] bg-warning-bg px-4 py-3">
              <p className="text-body-sm font-medium text-text-primary">Free plan</p>
              <p className="mt-0.5 text-body-sm text-text-secondary">
                Your trial has ended. Upgrade to Pro to unlock premium templates,
                imports, and more live preview slots.
              </p>
            </div>
          )}

          {isPending && (
            <p className="text-body-sm text-text-secondary">
              Payment pending confirmation. If you have completed checkout, it
              may take a moment to reflect here.
            </p>
          )}

          <div className="divide-y divide-border-default text-body-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Premium templates</span>
              <span
                className={
                  billing?.access?.canUsePremiumTemplates
                    ? "font-medium text-success"
                    : "text-text-muted"
                }
              >
                {billing?.access?.canUsePremiumTemplates ? "Unlocked" : "Locked"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Resume &amp; GitHub import</span>
              <span
                className={
                  billing?.access?.canUseImports
                    ? "font-medium text-success"
                    : "text-text-muted"
                }
              >
                {billing?.access?.canUseImports ? "Unlocked" : "Locked"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Live preview slots</span>
              <span className="text-text-primary">
                {isPro ? "Unlimited" : "2 included"}
              </span>
            </div>
          </div>

          {!isPro && paymentsReady && (
            <Button
              className="w-full"
              disabled={subscribing || isPending}
              onClick={subscribe}
            >
              {subscribing
                ? "Opening checkout…"
                : isPending
                  ? "Payment pending…"
                  : "Upgrade to Pro — ₹599/month"}
            </Button>
          )}

          {!isPro && !paymentsReady && (
            <p className="text-center text-body-sm text-text-muted">
              Payments are not configured on this instance.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-body-sm text-text-muted">
        Questions?{" "}
        <Link
          href="/pricing"
          className="text-brand-primary underline-offset-4 hover:underline"
        >
          View full pricing
        </Link>
      </p>

      <FlowFooter
        previous={{ href: "/dashboard/settings", label: "Settings" }}
        next={{ href: "/dashboard", label: "Dashboard" }}
      />
    </div>
  );
}

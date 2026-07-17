"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, Crown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { CancelSubscriptionDialog } from "@/components/cancel-subscription-dialog";
import {
  formatProPriceLabel,
  type BillingInterval,
} from "@/lib/pricing";
import { BillingIntervalToggle } from "@/features/subscriptions/components/billing-interval-toggle";
import { startProCheckout } from "@/features/subscriptions/lib/checkout";
import { getIntervalCheckoutUnavailableMessage } from "@/lib/billing";

interface BillingState {
  razorpayReady: boolean;
  availableIntervals?: BillingInterval[];
  subscription: { status: "ACTIVE" | "PENDING" } | null;
  access: {
    tier: "free" | "trial" | "pro";
    trialDaysRemaining: number;
    canUsePremiumTemplates: boolean;
    canUseImports: boolean;
    canUseAnalytics: boolean;
  } | null;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const returning = searchParams.has("return");
  const cancelled = searchParams.has("cancelled");

  const [billing, setBilling] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("monthly");
  const [checkoutIntervals, setCheckoutIntervals] = useState<BillingInterval[]>([
    "monthly",
  ]);

  const loadBilling = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/me", { cache: "no-store" });
      const data = await res.json();
      setBilling(data);
      const intervals =
        data.availableIntervals?.length
          ? data.availableIntervals
          : (["monthly"] as BillingInterval[]);
      setCheckoutIntervals(intervals);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  useEffect(() => {
    if (!returning) return;

    const tier = billing?.access?.tier;
    const pending = billing?.subscription?.status === "PENDING";
    if (tier === "pro" || !pending) return;

    const interval = window.setInterval(() => {
      void loadBilling();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [returning, billing, loadBilling]);

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

  const subscribe = async () => {
    setError(null);
    setSubscribing(true);
    try {
      await startProCheckout({
        interval: billingInterval,
        razorpayLoaded,
        onError: setError,
        onDismiss: loadBilling,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const cancelSubscription = async () => {
    setError(null);
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Failed to cancel subscription.");
        setCancelling(false);
        setShowCancelDialog(false);
        return;
      }
      window.location.href = "/dashboard/billing?cancelled=true";
    } catch {
      setError("Something went wrong. Please try again.");
      setCancelling(false);
      setShowCancelDialog(false);
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
  const intervalCheckoutReady = checkoutIntervals.includes(billingInterval);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-6">
      <div>
        <h1 className="text-h2 text-text-primary">Billing</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          Manage your plan and subscription.
        </p>
      </div>

      {returning && isPending && (
        <div className="rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
          <p className="font-medium">Payment is being processed</p>
          <p className="mt-1 text-xs text-blue-400/70">
            Your subscription will be activated once payment is confirmed. Refresh
            this page in a few moments to see the updated status.
          </p>
        </div>
      )}

      {cancelled && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Your Pro subscription has been cancelled successfully.
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
            <div className="flex items-start gap-3 rounded-xl border border-teal-500/20 bg-teal-500/8 px-4 py-3">
              <Crown className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-teal-200">
                  Pro subscription is active
                </p>
                <p className="mt-0.5 text-body-sm text-text-secondary">
                  All templates and features are unlocked.
                </p>
              </div>
            </div>
          )}

          {isPro && (
            <Button
              variant="outline"
              className="w-full rounded-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              disabled={cancelling}
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Subscription
            </Button>
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
              may take a moment to reflect here. Refresh the page to see updates.
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
              <span className="text-zinc-400">Portfolio visit analytics</span>
              <span
                className={
                  billing?.access?.canUseAnalytics
                    ? "text-teal-400"
                    : "text-zinc-600"
                }
              >
                {billing?.access?.canUseAnalytics ? "Unlocked" : "Locked"}
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
            <div className="space-y-4">
              <BillingIntervalToggle
                value={billingInterval}
                onChange={setBillingInterval}
                className="w-full justify-center"
              />
              {!intervalCheckoutReady && (
                <p className="text-center text-xs text-zinc-500">
                  {getIntervalCheckoutUnavailableMessage(billingInterval)}
                </p>
              )}
              <Button
                className="w-full rounded-full bg-teal-500 text-teal-950 hover:bg-teal-400"
                disabled={subscribing || !intervalCheckoutReady}
                onClick={subscribe}
              >
                {subscribing
                  ? "Opening checkout…"
                  : isPending
                    ? "Try payment again"
                    : `Upgrade to Pro — ${formatProPriceLabel(billingInterval)}`}
              </Button>
            </div>
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

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={cancelSubscription}
        cancelling={cancelling}
      />
    </div>
  );
}

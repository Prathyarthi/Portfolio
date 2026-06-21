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

declare global {
  interface Window {
    Razorpay: any;
  }
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
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Checkout could not be started.");
        setSubscribing(false);
        return;
      }

      if (!razorpayLoaded || !window.Razorpay) {
        setError("Payment system is loading. Please try again.");
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
      setError("Something went wrong. Please try again.");
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
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
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
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-muted-foreground">
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
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <Card className="glass-card rounded-[1.5rem] border-white/8 bg-white/3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <Badge
              className={
                isPro
                  ? "border-teal-400/30 bg-teal-500/15 text-teal-200"
                  : isTrial
                    ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                    : "border-white/10 bg-white/5 text-zinc-400"
              }
            >
              {isPro ? "Pro" : isTrial ? "Free Trial" : "Free"}
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
                <p className="mt-0.5 text-xs text-teal-400/70">
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
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-200">
                  Free trial active
                </p>
                <p className="mt-0.5 text-xs text-emerald-400/70">
                  {trialDays} day{trialDays === 1 ? "" : "s"} remaining — all
                  features unlocked during trial.
                </p>
              </div>
            </div>
          )}

          {isFree && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3">
              <p className="text-sm font-medium text-amber-200">Free plan</p>
              <p className="mt-0.5 text-xs text-amber-400/70">
                Your trial has ended. Upgrade to Pro to unlock premium templates,
                imports, and more live preview slots.
              </p>
            </div>
          )}

          {isPending && (
            <p className="text-xs text-amber-300/80">
              Payment pending confirmation. If you have completed checkout, it
              may take a moment to reflect here. Refresh the page to see updates.
            </p>
          )}

          <div className="divide-y divide-white/6 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-zinc-400">Premium templates</span>
              <span
                className={
                  billing?.access?.canUsePremiumTemplates
                    ? "text-teal-400"
                    : "text-zinc-600"
                }
              >
                {billing?.access?.canUsePremiumTemplates ? "Unlocked" : "Locked"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-zinc-400">Resume & GitHub import</span>
              <span
                className={
                  billing?.access?.canUseImports
                    ? "text-teal-400"
                    : "text-zinc-600"
                }
              >
                {billing?.access?.canUseImports ? "Unlocked" : "Locked"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-zinc-400">Live preview slots</span>
              <span className="text-zinc-300">
                {isPro ? "Unlimited" : "2 included"}
              </span>
            </div>
          </div>

          {!isPro && paymentsReady && (
            <Button
              className="w-full rounded-full bg-teal-500 text-teal-950 hover:bg-teal-400"
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
            <p className="text-center text-xs text-zinc-600">
              Payments are not configured on this instance.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-zinc-600">
        Questions?{" "}
        <Link
          href="/pricing"
          className="text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
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

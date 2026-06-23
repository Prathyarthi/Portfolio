import {
  BILLING_INTERVAL_LABELS,
  type BillingInterval,
} from "@/lib/pricing";
import { getCheckoutDescription } from "@/lib/billing";
import { siteConfig } from "@/lib/site";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export async function startProCheckout(options: {
  interval: BillingInterval;
  razorpayLoaded: boolean;
  onError: (message: string) => void;
}): Promise<void> {
  const { interval, razorpayLoaded, onError } = options;

  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval }),
  });

  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    keyId?: string;
    subscriptionId?: string;
    email?: string;
  };

  if (!res.ok) {
    onError(
      typeof body.error === "string"
        ? body.error
        : "Checkout could not be started."
    );
    return;
  }

  if (!razorpayLoaded || !window.Razorpay) {
    onError("Payment system is loading. Please try again.");
    return;
  }

  const razorpay = new window.Razorpay({
    key: body.keyId,
    subscription_id: body.subscriptionId,
    name: `${siteConfig.name} Pro`,
    description: getCheckoutDescription(interval),
    callback_url: `${window.location.origin}/dashboard/billing?return=true`,
    prefill: {
      email: body.email || "",
    },
    theme: {
      color: "#14b8a6",
    },
  });

  razorpay.open();
}

export function subscribeButtonLabel(
  interval: BillingInterval,
  subscribing: boolean,
  pending = false
): string {
  if (subscribing) return "Opening checkout…";
  if (pending) return "Payment pending…";
  return `Subscribe — ${BILLING_INTERVAL_LABELS[interval]}`;
}

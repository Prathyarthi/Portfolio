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
  onDismiss?: () => void | Promise<void>;
}): Promise<void> {
  const { interval, razorpayLoaded, onError, onDismiss } = options;

  if (!razorpayLoaded || !window.Razorpay) {
    onError("Payment system is loading. Please try again.");
    return;
  }

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

  const returnUrl = `${window.location.origin}/dashboard/billing?return=true`;

  const razorpay = new window.Razorpay({
    key: body.keyId,
    subscription_id: body.subscriptionId,
    name: `${siteConfig.name} Pro`,
    description: getCheckoutDescription(interval),
    prefill: {
      email: body.email || "",
    },
    theme: {
      color: "#14b8a6",
    },
    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    }) => {
      try {
        const confirmRes = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        if (!confirmRes.ok) {
          const confirmBody = (await confirmRes.json().catch(() => ({}))) as {
            error?: string;
          };
          onError(
            typeof confirmBody.error === "string"
              ? confirmBody.error
              : "Payment succeeded but activation failed. Refresh billing in a moment."
          );
        }
      } catch {
        onError(
          "Payment succeeded but activation failed. Refresh billing in a moment."
        );
      } finally {
        window.location.assign(returnUrl);
      }
    },
    modal: {
      ondismiss: () => {
        void (async () => {
          try {
            await fetch("/api/billing/checkout/dismiss", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscriptionId: body.subscriptionId }),
            });
          } finally {
            await onDismiss?.();
          }
        })();
      },
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

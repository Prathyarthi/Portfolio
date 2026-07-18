import { createHash, createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  canApplySubscriptionTransition,
  getIntervalForPlanId,
  isTerminalProviderStatus,
  legacyStatusForProvider,
  parseProviderSubscriptionStatus,
  type ProviderSubscriptionStatus,
} from "@/lib/billing-lifecycle";

type RazorpayWebhookPayload = {
  event?: string;
  created_at?: number;
  payload?: {
    subscription?: {
      entity?: {
        id?: string;
        status?: string;
        plan_id?: string;
        notes?: Record<string, string | undefined>;
        current_end?: number;
        has_scheduled_changes?: boolean;
      };
    };
    payment?: {
      entity?: {
        id?: string;
        status?: string;
        subscription_id?: string;
        notes?: Record<string, string | undefined>;
      };
    };
  };
};

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

function getUserIdFromPayload(payload: RazorpayWebhookPayload): string | null {
  const fromSubscription = payload.payload?.subscription?.entity?.notes?.userId;
  if (fromSubscription) return fromSubscription;

  const fromPayment = payload.payload?.payment?.entity?.notes?.userId;
  return fromPayment ?? null;
}

function statusFromEvent(
  event: string | undefined,
  entityStatus: unknown
): ProviderSubscriptionStatus | null {
  const parsed = parseProviderSubscriptionStatus(entityStatus);
  if (parsed) return parsed;

  switch (event) {
    case "subscription.authenticated":
      return "authenticated";
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      return "active";
    case "subscription.pending":
      return "pending";
    case "subscription.halted":
      return "halted";
    case "subscription.cancelled":
      return "cancelled";
    case "subscription.paused":
      return "paused";
    case "subscription.completed":
      return "completed";
    default:
      return null;
  }
}

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 503 }
    );
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: RazorpayWebhookPayload;
  try {
    body = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const subscriptionId = body.payload?.subscription?.entity?.id;
  const subscriptionEntity = body.payload?.subscription?.entity;
  const providerEventId =
    req.headers.get("x-razorpay-event-id") ??
    createHash("sha256").update(rawBody).digest("hex");
  const occurredAt =
    typeof body.created_at === "number"
      ? new Date(body.created_at * 1000)
      : new Date();
  let userId = getUserIdFromPayload(body);

  if (!userId && subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { razorpaySubscriptionId: subscriptionId },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!targetUser) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const providerStatus = statusFromEvent(
    body.event,
    subscriptionEntity?.status
  );
  if (!providerStatus || !subscriptionId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const currentPeriodEnd =
    typeof subscriptionEntity?.current_end === "number"
      ? new Date(subscriptionEntity.current_end * 1000)
      : null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.billingWebhookEvent.create({
        data: {
          providerEventId,
          eventType: body.event ?? "unknown",
          providerSubscriptionId: subscriptionId,
          occurredAt,
        },
      });

      const existingSubscription =
        await tx.billingSubscription.findUnique({
          where: { providerSubscriptionId: subscriptionId },
        });
      const providerPlanId =
        subscriptionEntity?.plan_id ??
        existingSubscription?.providerPlanId ??
        "unknown";
      const configuredInterval = getIntervalForPlanId(providerPlanId);
      if (
        existingSubscription &&
        existingSubscription.userId !== userId
      ) {
        return "ownership-mismatch";
      }
      if (
        existingSubscription?.lastEventAt &&
        occurredAt < existingSubscription.lastEventAt
      ) {
        return "stale";
      }
      if (
        existingSubscription &&
        !canApplySubscriptionTransition(
          existingSubscription.status,
          providerStatus
        )
      ) {
        return "invalid-transition";
      }

      const billingSubscription =
        await tx.billingSubscription.upsert({
          where: { providerSubscriptionId: subscriptionId },
          create: {
            userId,
            providerSubscriptionId: subscriptionId,
            providerPlanId,
            interval:
              configuredInterval ??
              subscriptionEntity?.notes?.interval ??
              "unknown",
            status: providerStatus,
            cancelAtPeriodEnd:
              subscriptionEntity?.has_scheduled_changes ?? false,
            currentPeriodEnd,
            lastEventAt: occurredAt,
            lastEventId: providerEventId,
          },
          update: {
            providerPlanId,
            ...(configuredInterval && { interval: configuredInterval }),
            status: providerStatus,
            ...(subscriptionEntity?.has_scheduled_changes !== undefined && {
              cancelAtPeriodEnd:
                subscriptionEntity.has_scheduled_changes,
            }),
            ...(currentPeriodEnd && { currentPeriodEnd }),
            lastEventAt: occurredAt,
            lastEventId: providerEventId,
          },
        });

      const paymentEntity = body.payload?.payment?.entity;
      if (paymentEntity?.id) {
        await tx.billingPayment.upsert({
          where: { providerPaymentId: paymentEntity.id },
          create: {
            providerPaymentId: paymentEntity.id,
            userId,
            billingSubscriptionId: billingSubscription.id,
            providerSubscriptionId: subscriptionId,
            status: paymentEntity.status ?? "unknown",
          },
          update: {
            status: paymentEntity.status ?? "unknown",
          },
        });
      }

      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { razorpaySubscriptionId: true },
      });
      const isCurrent =
        currentUser?.razorpaySubscriptionId === subscriptionId;
      const canRecoverCurrent =
        !currentUser?.razorpaySubscriptionId &&
        providerStatus === "active" &&
        configuredInterval !== null;
      if (!isCurrent && !canRecoverCurrent) return "recorded";

      const terminal = isTerminalProviderStatus(providerStatus);
      await tx.user.update({
        where: { id: userId },
        data: terminal
          ? {
              subscriptionStatus: "none",
              razorpaySubscriptionId: null,
              subscriptionCancelAtPeriodEnd: false,
              subscriptionCurrentPeriodEnd: null,
            }
          : {
              subscriptionStatus:
                configuredInterval || providerStatus !== "active"
                  ? legacyStatusForProvider(providerStatus)
                  : "none",
              razorpaySubscriptionId:
                configuredInterval || providerStatus !== "active"
                  ? billingSubscription.providerSubscriptionId
                  : null,
              subscriptionCancelAtPeriodEnd:
                subscriptionEntity?.has_scheduled_changes ??
                billingSubscription.cancelAtPeriodEnd,
              ...(currentPeriodEnd && {
                subscriptionCurrentPeriodEnd: currentPeriodEnd,
              }),
            },
      });

      if (
        providerStatus === "active" ||
        isTerminalProviderStatus(providerStatus)
      ) {
        await tx.billingCheckoutAttempt.deleteMany({
          where: { providerSubscriptionId: subscriptionId },
        });
      }
      return "processed";
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const existingEvent = await prisma.billingWebhookEvent.findUnique({
      where: { providerEventId },
      select: { providerEventId: true },
    });
    if (existingEvent) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error("[billing.webhook] processing failed", {
      error,
      providerEventId,
      subscriptionId,
    });
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}

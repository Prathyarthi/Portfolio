import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import {
  getRazorpayPlanId,
  isIntervalCheckoutReady,
  parseBillingInterval,
} from "@/lib/billing";
import {
  getExpectedPlanDefinition,
  getSubscriptionTotalCount,
} from "@/lib/billing-lifecycle";
import { enforceCheckoutRateLimit } from "@/lib/billing-rate-limit";

type RazorpayFailure = {
  statusCode?: number;
  message?: string;
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    field?: string;
  };
};

function getCheckoutError(error: unknown) {
  const failure = error as RazorpayFailure;
  const message =
    failure.error?.description ||
    failure.message ||
    "Failed to create Razorpay subscription checkout.";
  const status =
    typeof failure.statusCode === "number" &&
    failure.statusCode >= 400 &&
    failure.statusCode < 500
      ? failure.statusCode
      : 500;

  return {
    status,
    message,
    code: failure.error?.code,
    reason: failure.error?.reason,
    field: failure.error?.field,
  };
}

/**
 * Creates a recurring Razorpay subscription checkout.
 * Pro access is granted when webhook marks `User.subscriptionStatus` as `active`.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await enforceCheckoutRateLimit(session.user.id);
  if (rateLimitResponse) return rateLimitResponse;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  let requestedInterval: unknown = "monthly";
  try {
    const body = await req.json();
    requestedInterval = body?.interval ?? "monthly";
  } catch {
    // Default to monthly when no JSON body is sent.
  }

  const interval = parseBillingInterval(requestedInterval);
  if (!interval) {
    return NextResponse.json(
      { error: "Invalid billing interval." },
      { status: 400 }
    );
  }

  if (!isIntervalCheckoutReady(interval)) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not fully configured for this billing interval (missing key, webhook secret, or plan).",
      },
      { status: 503 }
    );
  }

  const planId = getRazorpayPlanId(interval)!;
  let claimedAttemptId: string | null = null;
  let createdProviderSubscriptionId: string | null = null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionStatus: true,
        email: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (user.subscriptionStatus === "active") {
      return NextResponse.json(
        { error: "Your Pro subscription is already active." },
        { status: 409 }
      );
    }
    if (user.subscriptionStatus === "pending") {
      return NextResponse.json(
        {
          error:
            "Your existing subscription has a payment pending. Use Razorpay's payment recovery flow instead of creating another subscription.",
        },
        { status: 409 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId!,
      key_secret: keySecret!,
    });

    const existingAttempt = await prisma.billingCheckoutAttempt.findUnique({
      where: { userId: session.user.id },
    });
    if (existingAttempt?.providerSubscriptionId) {
      if (existingAttempt.interval !== interval) {
        return NextResponse.json(
          {
            error: `A ${existingAttempt.interval} checkout is already open. Reopen and dismiss that checkout before changing intervals.`,
            existingInterval: existingAttempt.interval,
          },
          { status: 409 }
        );
      }
      return NextResponse.json({
        keyId,
        subscriptionId: existingAttempt.providerSubscriptionId,
        email: user.email,
        interval: existingAttempt.interval,
        reused: true,
      });
    }
    if (existingAttempt) {
      const released = await prisma.billingCheckoutAttempt.deleteMany({
        where: {
          id: existingAttempt.id,
          providerSubscriptionId: null,
          status: "creating",
          updatedAt: { lt: new Date(Date.now() - 2 * 60 * 1000) },
        },
      });
      if (released.count === 0) {
        return NextResponse.json(
          { error: "Checkout is already being created. Please try again." },
          { status: 409 }
        );
      }
    }

    const providerPlan = (await razorpay.plans.fetch(planId)) as {
      period?: string;
      interval?: number;
      item?: { amount?: number; currency?: string };
    };
    const expectedPlan = getExpectedPlanDefinition(interval);
    if (
      providerPlan.period !== expectedPlan.period ||
      providerPlan.interval !== expectedPlan.interval ||
      providerPlan.item?.amount !== expectedPlan.amount ||
      providerPlan.item?.currency !== expectedPlan.currency
    ) {
      return NextResponse.json(
        {
          error:
            "Configured Razorpay plan does not match the advertised price or billing interval.",
        },
        { status: 503 }
      );
    }

    let checkoutAttempt;
    try {
      checkoutAttempt = await prisma.billingCheckoutAttempt.create({
        data: {
          userId: session.user.id,
          providerPlanId: planId,
          interval,
          status: "creating",
        },
      });
      claimedAttemptId = checkoutAttempt.id;
    } catch {
      const concurrentAttempt =
        await prisma.billingCheckoutAttempt.findUnique({
          where: { userId: session.user.id },
        });
      if (concurrentAttempt?.providerSubscriptionId) {
        return NextResponse.json({
          keyId,
          subscriptionId: concurrentAttempt.providerSubscriptionId,
          email: user.email,
          interval: concurrentAttempt.interval,
          reused: true,
        });
      }
      return NextResponse.json(
        { error: "Checkout is already being created. Please try again." },
        { status: 409 }
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: getSubscriptionTotalCount(interval),
      notes: {
        userId: session.user.id,
        plan: "pro",
        interval,
      },
    });
    createdProviderSubscriptionId = subscription.id;

    const claimed = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          id: session.user.id,
          subscriptionStatus: { not: "active" },
        },
        data: {
          subscriptionStatus: "none",
          razorpaySubscriptionId: subscription.id,
          subscriptionCancelAtPeriodEnd: false,
          subscriptionCurrentPeriodEnd: null,
        },
      });
      if (updated.count === 0) return false;

      await tx.billingSubscription.create({
        data: {
          userId: session.user.id,
          providerSubscriptionId: subscription.id,
          providerPlanId: planId,
          interval,
          status: "created",
        },
      });
      await tx.billingCheckoutAttempt.update({
        where: { id: checkoutAttempt.id },
        data: {
          providerSubscriptionId: subscription.id,
          status: "open",
        },
      });
      return true;
    });

    if (!claimed) {
      try {
        await razorpay.subscriptions.cancel(subscription.id, false);
      } catch {
        // The provider object is harmless without authorization; reconciliation
        // will also ignore it because it was never claimed by the user.
      }
      await prisma.billingCheckoutAttempt.deleteMany({
        where: { id: checkoutAttempt.id },
      });
      return NextResponse.json(
        { error: "Your Pro subscription is already active." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      keyId,
      subscriptionId: subscription.id,
      email: user.email,
      interval,
    });
  } catch (error) {
    if (createdProviderSubscriptionId) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId!,
          key_secret: keySecret!,
        });
        await razorpay.subscriptions.cancel(
          createdProviderSubscriptionId,
          false
        );
      } catch {
        // Best effort compensation; the checkout was never returned to a user.
      }
    }
    if (claimedAttemptId) {
      await prisma.billingCheckoutAttempt
        .deleteMany({ where: { id: claimedAttemptId } })
        .catch(() => undefined);
    }
    const checkoutError = getCheckoutError(error);
    console.error("[billing.checkout] failed", {
      status: checkoutError.status,
      message: checkoutError.message,
      code: checkoutError.code,
      reason: checkoutError.reason,
      field: checkoutError.field,
      userId: session.user.id,
      interval,
      hasKeyId: Boolean(keyId),
      hasKeySecret: Boolean(keySecret),
      hasPlanId: Boolean(planId),
    });

    return NextResponse.json(
      {
        error: checkoutError.message,
        code: checkoutError.code,
        reason: checkoutError.reason,
        field: checkoutError.field,
      },
      { status: checkoutError.status }
    );
  }
}

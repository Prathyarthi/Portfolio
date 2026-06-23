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

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  let interval = parseBillingInterval("monthly");
  try {
    const body = await req.json();
    interval = parseBillingInterval(body?.interval) ?? interval;
  } catch {
    // Default to monthly when no JSON body is sent.
  }

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
          "Razorpay is not configured for this billing interval (missing key/secret/plan).",
      },
      { status: 503 }
    );
  }

  const planId = getRazorpayPlanId(interval)!;

  try {
    const razorpay = new Razorpay({
      key_id: keyId!,
      key_secret: keySecret!,
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      notes: {
        userId: session.user.id,
        plan: "pro",
        interval,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionStatus: "pending",
        razorpaySubscriptionId: subscription.id,
      },
    });

    return NextResponse.json({
      keyId,
      subscriptionId: subscription.id,
      email: session.user.email,
      interval,
    });
  } catch (error) {
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

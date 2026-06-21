import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

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
  const planId = process.env.RAZORPAY_PRO_PLAN_ID;

  if (!keyId || !keySecret || !planId) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not configured for subscriptions (missing key/secret/plan).",
      },
      { status: 503 }
    );
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      notes: {
        userId: session.user.id,
        plan: "pro",
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

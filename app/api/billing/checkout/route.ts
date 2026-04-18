import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

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

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
  const redirectBase = origin.replace(/\/$/, "");

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      ...(redirectBase
        ? { callback_url: `${redirectBase}/pricing`, callback_method: "get" }
        : {}),
      notes: {
        userId: session.user.id,
        plan: "pro",
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionStatus: "pending" },
    });

    if (!subscription.short_url) {
      return NextResponse.json(
        { error: "Subscription checkout URL was not returned by Razorpay." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      checkoutUrl: subscription.short_url,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Razorpay subscription checkout.",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured." },
      { status: 503 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        razorpaySubscriptionId: true,
        subscriptionStatus: true,
        subscriptionCancelAtPeriodEnd: true,
        subscriptionCurrentPeriodEnd: true,
      },
    });

    if (!user?.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 }
      );
    }

    if (user.subscriptionStatus !== "active") {
      return NextResponse.json(
        { error: "Subscription is not active." },
        { status: 400 }
      );
    }
    const providerSubscriptionId = user.razorpaySubscriptionId;

    if (user.subscriptionCancelAtPeriodEnd) {
      return NextResponse.json({
        ok: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd:
          user.subscriptionCurrentPeriodEnd?.toISOString() ?? null,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const subscription = (await razorpay.subscriptions.cancel(
      providerSubscriptionId,
      false
    )) as { current_end?: number };
    const currentPeriodEnd =
      typeof subscription.current_end === "number"
        ? new Date(subscription.current_end * 1000)
        : user.subscriptionCurrentPeriodEnd;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          subscriptionCancelAtPeriodEnd: true,
          subscriptionCurrentPeriodEnd: currentPeriodEnd,
        },
      });
      await tx.billingSubscription.updateMany({
        where: {
          userId: session.user.id,
          providerSubscriptionId,
        },
        data: {
          cancelAtPeriodEnd: true,
          currentPeriodEnd,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: currentPeriodEnd?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("[billing.cancel] failed", {
      error,
      userId: session.user.id,
    });

    return NextResponse.json(
      { error: "Failed to cancel subscription. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import {
  isTerminalProviderStatus,
  legacyStatusForProvider,
  parseProviderSubscriptionStatus,
} from "@/lib/billing-lifecycle";

type DismissBody = {
  subscriptionId?: string;
};

/**
 * Releases an unpaid checkout when the Razorpay modal is dismissed.
 * The matching conditions prevent an old modal from clearing a newer or
 * already-active subscription.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DismissBody;
  try {
    body = (await req.json()) as DismissBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const subscriptionId = body.subscriptionId?.trim();
  if (!subscriptionId) {
    return NextResponse.json(
      { error: "Missing subscription ID." },
      { status: 400 }
    );
  }

  const attempt = await prisma.billingCheckoutAttempt.findFirst({
    where: {
      userId: session.user.id,
      providerSubscriptionId: subscriptionId,
    },
  });
  if (!attempt) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured." },
      { status: 503 }
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const providerSubscription = (await razorpay.subscriptions.fetch(
      subscriptionId
    )) as { status?: string };
    const providerStatus = parseProviderSubscriptionStatus(
      providerSubscription.status
    );
    if (!providerStatus) {
      return NextResponse.json(
        { error: "Unknown subscription status." },
        { status: 409 }
      );
    }

    if (providerStatus === "created") {
      await razorpay.subscriptions.cancel(subscriptionId, false);
    }

    const terminal =
      providerStatus === "created" || isTerminalProviderStatus(providerStatus);
    await prisma.$transaction(async (tx) => {
      await tx.billingCheckoutAttempt.deleteMany({
        where: {
          userId: session.user.id,
          providerSubscriptionId: subscriptionId,
        },
      });
      await tx.billingSubscription.updateMany({
        where: {
          userId: session.user.id,
          providerSubscriptionId: subscriptionId,
        },
        data: {
          status: providerStatus === "created" ? "cancelled" : providerStatus,
        },
      });

      if (terminal) {
        await tx.user.updateMany({
          where: {
            id: session.user.id,
            razorpaySubscriptionId: subscriptionId,
            subscriptionStatus: { not: "active" },
          },
          data: {
            subscriptionStatus: "none",
            razorpaySubscriptionId: null,
          },
        });
      } else {
        await tx.user.updateMany({
          where: {
            id: session.user.id,
            razorpaySubscriptionId: subscriptionId,
          },
          data: {
            subscriptionStatus: legacyStatusForProvider(providerStatus),
          },
        });
      }
    });

    return NextResponse.json({ ok: true, status: providerStatus });
  } catch (error) {
    console.error("[billing.checkout.dismiss] failed", {
      error,
      userId: session.user.id,
      subscriptionId,
    });
    return NextResponse.json(
      { error: "Could not close checkout safely. Please refresh billing." },
      { status: 502 }
    );
  }
}

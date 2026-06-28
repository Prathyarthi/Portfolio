import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

type ConfirmBody = {
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
};

function verifySubscriptionPaymentSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
  secret: string
) {
  const expected = createHmac("sha256", secret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

const ACTIVATED_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "authenticated",
  "completed",
]);

/**
 * Verifies a successful Razorpay subscription checkout and marks the user as Pro.
 * Webhooks remain the source of truth for renewals and cancellations.
 */
export async function POST(req: Request) {
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

  let body: ConfirmBody;
  try {
    body = (await req.json()) as ConfirmBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const paymentId = body.razorpay_payment_id?.trim();
  const subscriptionId = body.razorpay_subscription_id?.trim();
  const signature = body.razorpay_signature?.trim();

  if (!paymentId || !subscriptionId || !signature) {
    return NextResponse.json(
      { error: "Missing payment verification fields." },
      { status: 400 }
    );
  }

  if (
    !verifySubscriptionPaymentSignature(
      paymentId,
      subscriptionId,
      signature,
      keySecret
    )
  ) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      razorpaySubscriptionId: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (
    user.razorpaySubscriptionId &&
    user.razorpaySubscriptionId !== subscriptionId
  ) {
    return NextResponse.json(
      { error: "Subscription does not match the current checkout." },
      { status: 400 }
    );
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  let subscriptionStatus: string;
  try {
    const subscription = (await razorpay.subscriptions.fetch(
      subscriptionId
    )) as { status?: string; notes?: Record<string, string | undefined> };
    subscriptionStatus = (subscription.status ?? "").toLowerCase();

    const noteUserId = subscription.notes?.userId;
    if (noteUserId && noteUserId !== session.user.id) {
      return NextResponse.json(
        { error: "Subscription does not belong to this account." },
        { status: 403 }
      );
    }

    if (!ACTIVATED_SUBSCRIPTION_STATUSES.has(subscriptionStatus)) {
      return NextResponse.json(
        { error: "Subscription payment is not active yet." },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("[billing.confirm] subscription fetch failed", {
      error,
      userId: session.user.id,
      subscriptionId,
    });
    return NextResponse.json(
      { error: "Could not verify subscription status." },
      { status: 502 }
    );
  }

  if (user.subscriptionStatus === "active") {
    return NextResponse.json({ ok: true, status: "active" });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      subscriptionStatus: "active",
      razorpaySubscriptionId: subscriptionId,
    },
  });

  return NextResponse.json({ ok: true, status: "active" });
}

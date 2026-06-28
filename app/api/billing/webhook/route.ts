import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    subscription?: {
      entity?: {
        id?: string;
        notes?: Record<string, string | undefined>;
      };
    };
    payment?: {
      entity?: {
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

function mapStatus(
  event: string | undefined
): "none" | "pending" | "active" | null {
  switch (event) {
    case "subscription.authenticated":
    case "subscription.pending":
      return "pending";
    case "subscription.activated":
    case "subscription.charged":
    case "subscription.resumed":
      return "active";
    case "subscription.halted":
    case "subscription.cancelled":
    case "subscription.paused":
    case "subscription.completed":
      return "none";
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

  const nextStatus = mapStatus(body.event);
  if (!nextStatus) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });

  if (
    nextStatus === "pending" &&
    currentUser?.subscriptionStatus === "active"
  ) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: nextStatus,
      ...(subscriptionId && { razorpaySubscriptionId: subscriptionId }),
    },
  });

  return NextResponse.json({ ok: true });
}

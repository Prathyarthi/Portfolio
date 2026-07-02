import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

async function cancelActiveSubscription(userId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { razorpaySubscriptionId: true, subscriptionStatus: true },
  });

  if (
    !user?.razorpaySubscriptionId ||
    user.subscriptionStatus !== "active"
  ) {
    return;
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);
  } catch (error) {
    console.error("[account.delete] subscription cancel failed", {
      error,
      userId,
    });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    await cancelActiveSubscription(session.user.id);

    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[account.delete] failed", {
      error,
      userId: session.user.id,
    });

    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
}

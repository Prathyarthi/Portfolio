import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import {
  isTerminalProviderStatus,
  parseProviderSubscriptionStatus,
} from "@/lib/billing-lifecycle";

async function cancelProviderSubscription(userId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { razorpaySubscriptionId: true },
  });
  if (!user?.razorpaySubscriptionId) return;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured.");
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  let providerSubscription: { status?: string };
  try {
    providerSubscription = (await razorpay.subscriptions.fetch(
      user.razorpaySubscriptionId
    )) as { status?: string };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 404) return;
    throw error;
  }
  const providerStatus = parseProviderSubscriptionStatus(
    providerSubscription.status
  );

  if (!providerStatus || !isTerminalProviderStatus(providerStatus)) {
    try {
      await razorpay.subscriptions.cancel(
        user.razorpaySubscriptionId,
        false
      );
    } catch (error) {
      const current = (await razorpay.subscriptions.fetch(
        user.razorpaySubscriptionId
      )) as { status?: string };
      const currentStatus = parseProviderSubscriptionStatus(current.status);
      if (!currentStatus || !isTerminalProviderStatus(currentStatus)) {
        throw error;
      }
    }
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

    await cancelProviderSubscription(session.user.id);

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
      {
        error:
          "Account deletion was stopped because billing could not be safely cancelled. Please try again or contact support.",
      },
      { status: 502 }
    );
  }
}

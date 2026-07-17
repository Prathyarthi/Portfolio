import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

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

  await prisma.user.updateMany({
    where: {
      id: session.user.id,
      razorpaySubscriptionId: subscriptionId,
      subscriptionStatus: { in: ["none", "pending"] },
    },
    data: {
      subscriptionStatus: "none",
      razorpaySubscriptionId: null,
    },
  });

  return NextResponse.json({ ok: true });
}

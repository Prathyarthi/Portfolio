import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { resolveAccessForUser } from "@/lib/entitlements";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const paymentsReady = Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_PRO_PLAN_ID
  );
  const access = resolveAccessForUser(user);

  const sub = String((user as { subscriptionStatus?: string | null }).subscriptionStatus ?? "").toLowerCase();
  const subscription =
    sub === "active"
      ? { status: "ACTIVE" as const }
      : sub === "pending"
        ? { status: "PENDING" as const }
        : null;

  // Keep response shape aligned with Xchat's subscription flow contract.
  return NextResponse.json({
    razorpayReady: paymentsReady,
    subscription,
    access,
  });
}

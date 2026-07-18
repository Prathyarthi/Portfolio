import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reconcileUserBilling } from "@/lib/billing-reconciliation";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let cursor: string | undefined;
  let reconciled = 0;
  let failed = 0;

  do {
    const users = await prisma.user.findMany({
      where: { razorpaySubscriptionId: { not: null } },
      select: { id: true },
      orderBy: { id: "asc" },
      take: 100,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    for (let index = 0; index < users.length; index += 10) {
      const batch = users.slice(index, index + 10);
      await Promise.all(
        batch.map(async (user) => {
          try {
            await reconcileUserBilling(user.id);
            reconciled += 1;
          } catch (error) {
            failed += 1;
            console.error("[billing.reconcile.cron] user failed", {
              error,
              userId: user.id,
            });
          }
        })
      );
    }

    cursor = users.length === 100 ? users.at(-1)?.id : undefined;
  } while (cursor);

  return NextResponse.json({ ok: true, reconciled, failed });
}

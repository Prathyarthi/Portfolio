import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CHECKOUT_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

export async function enforceCheckoutRateLimit(userId: string) {
  const now = new Date();
  const windowStart =
    Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS;
  const expiresAt = new Date(windowStart + WINDOW_MS);
  const digest = createHash("sha256").update(userId).digest("hex");
  const key = `billing:checkout:user:${digest}:${windowStart}`;

  try {
    const bucket = await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: { increment: 1 }, expiresAt },
      select: { count: true },
    });
    if (bucket.count <= CHECKOUT_LIMIT) return null;
    return NextResponse.json(
      { error: "Too many checkout attempts. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(
              1,
              Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)
            )
          ),
        },
      }
    );
  } catch (error) {
    console.error("[billing.checkout] rate limiter failed", error);
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable." },
      { status: 503 }
    );
  }
}

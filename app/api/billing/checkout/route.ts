import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

const PRO_PRICE_INR = 299;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured on the server." },
      { status: 503 }
    );
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";
  const redirectBase = origin.replace(/\/$/, "");

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const link = await razorpay.paymentLink.create({
      amount: PRO_PRICE_INR * 100,
      currency: "INR",
      description: "Foliofy Pro monthly subscription",
      customer: {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
      },
      notify: {
        email: true,
        sms: false,
      },
      reminder_enable: true,
      callback_url: redirectBase ? `${redirectBase}/pricing` : undefined,
      callback_method: "get",
      notes: {
        userId: session.user.id,
        plan: "pro",
      },
    });

    return NextResponse.json({
      checkoutUrl: link.short_url,
      paymentLinkId: link.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Razorpay checkout.",
      },
      { status: 500 }
    );
  }
}

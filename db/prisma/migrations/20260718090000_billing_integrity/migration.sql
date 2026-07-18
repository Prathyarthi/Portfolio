CREATE TABLE "billing_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "providerPlanId" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodEnd" TIMESTAMP(3),
    "lastEventAt" TIMESTAMP(3),
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "billing_checkout_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerSubscriptionId" TEXT,
    "providerPlanId" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'creating',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_checkout_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "billing_payments" (
    "providerPaymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billingSubscriptionId" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_payments_pkey" PRIMARY KEY ("providerPaymentId")
);

CREATE TABLE "billing_webhook_events" (
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerSubscriptionId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_webhook_events_pkey" PRIMARY KEY ("providerEventId")
);

CREATE UNIQUE INDEX "billing_subscriptions_providerSubscriptionId_key"
ON "billing_subscriptions"("providerSubscriptionId");

CREATE INDEX "billing_subscriptions_userId_status_idx"
ON "billing_subscriptions"("userId", "status");

CREATE UNIQUE INDEX "billing_checkout_attempts_userId_key"
ON "billing_checkout_attempts"("userId");

CREATE UNIQUE INDEX "billing_checkout_attempts_providerSubscriptionId_key"
ON "billing_checkout_attempts"("providerSubscriptionId");

CREATE INDEX "billing_payments_userId_idx"
ON "billing_payments"("userId");

CREATE INDEX "billing_payments_providerSubscriptionId_idx"
ON "billing_payments"("providerSubscriptionId");

CREATE INDEX "billing_webhook_events_providerSubscriptionId_occurredAt_idx"
ON "billing_webhook_events"("providerSubscriptionId", "occurredAt");

ALTER TABLE "billing_subscriptions"
ADD CONSTRAINT "billing_subscriptions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "billing_checkout_attempts"
ADD CONSTRAINT "billing_checkout_attempts_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "billing_payments"
ADD CONSTRAINT "billing_payments_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "billing_payments"
ADD CONSTRAINT "billing_payments_billingSubscriptionId_fkey"
FOREIGN KEY ("billingSubscriptionId") REFERENCES "billing_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Preserve current production subscriptions in the new ledger.
INSERT INTO "billing_subscriptions" (
    "id",
    "userId",
    "providerSubscriptionId",
    "providerPlanId",
    "interval",
    "status",
    "cancelAtPeriodEnd",
    "currentPeriodEnd",
    "createdAt",
    "updatedAt"
)
SELECT
    'legacy_' || "id",
    "id",
    "razorpaySubscriptionId",
    'legacy',
    'unknown',
    "subscriptionStatus",
    "subscriptionCancelAtPeriodEnd",
    "subscriptionCurrentPeriodEnd",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users"
WHERE "razorpaySubscriptionId" IS NOT NULL
ON CONFLICT ("providerSubscriptionId") DO NOTHING;

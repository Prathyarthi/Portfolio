ALTER TABLE "users"
ADD COLUMN "subscriptionCancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "subscriptionCurrentPeriodEnd" TIMESTAMP(3);

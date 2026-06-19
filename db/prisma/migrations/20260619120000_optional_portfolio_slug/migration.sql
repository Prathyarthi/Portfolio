-- Allow portfolios without a public slug until publish time.
ALTER TABLE "portfolios" ALTER COLUMN "slug" DROP NOT NULL;

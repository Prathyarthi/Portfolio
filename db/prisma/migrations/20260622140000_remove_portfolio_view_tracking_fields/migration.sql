-- Drop visitor/referrer tracking if a prior migration added them.
DROP INDEX IF EXISTS "portfolio_views_portfolioId_visitorId_idx";
ALTER TABLE "portfolio_views" DROP COLUMN IF EXISTS "visitorId";
ALTER TABLE "portfolio_views" DROP COLUMN IF EXISTS "referrer";

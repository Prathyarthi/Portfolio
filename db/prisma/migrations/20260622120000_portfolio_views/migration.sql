-- CreateTable
CREATE TABLE "portfolio_views" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portfolio_views_portfolioId_viewedAt_idx" ON "portfolio_views"("portfolioId", "viewedAt");

-- AddForeignKey
ALTER TABLE "portfolio_views" ADD CONSTRAINT "portfolio_views_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "custom_sections" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "custom_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_sections_portfolioId_sectionType_key" ON "custom_sections"("portfolioId", "sectionType");

-- AddForeignKey
ALTER TABLE "custom_sections" ADD CONSTRAINT "custom_sections_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

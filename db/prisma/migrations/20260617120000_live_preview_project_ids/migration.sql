-- AlterTable
ALTER TABLE "portfolios" ADD COLUMN "livePreviewProjectIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

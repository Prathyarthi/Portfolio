import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { resolveAccessForUser } from "@/lib/entitlements";
import {
  buildHourlyBuckets,
  buildLast7DayBuckets,
  computeWeekOverWeekChange,
  findPeakHour,
  formatHourLabel,
  startOfDay,
} from "@/features/analytics/lib/stats";

const emptyStats = {
  isPublished: false,
  totalViews: 0,
  todayViews: 0,
  last7Days: 0,
  last30Days: 0,
  previous7Days: 0,
  weekOverWeekChange: null as number | null,
  avgDaily7Days: 0,
  peakHour: null as { hour: number; label: string; count: number } | null,
  daily: buildLast7DayBuckets([]),
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { portfolio: { select: { id: true, isPublished: true } } },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const access = resolveAccessForUser(user);

  if (!access.canUseAnalytics) {
    return NextResponse.json(
      { error: "Analytics is a Pro feature", access },
      { status: 403 }
    );
  }

  const portfolioId = user.portfolio?.id;
  if (!portfolioId) {
    return NextResponse.json({ access, ...emptyStats });
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = startOfDay(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fourteenDaysAgo = startOfDay(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const thirtyDaysAgo = startOfDay(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalViews,
    todayViews,
    last7Days,
    previous7Days,
    last30Days,
    recentViews,
    monthlyViews,
  ] = await Promise.all([
    prisma.portfolioView.count({ where: { portfolioId } }),
    prisma.portfolioView.count({
      where: { portfolioId, viewedAt: { gte: todayStart } },
    }),
    prisma.portfolioView.count({
      where: { portfolioId, viewedAt: { gte: sevenDaysAgo } },
    }),
    prisma.portfolioView.count({
      where: {
        portfolioId,
        viewedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      },
    }),
    prisma.portfolioView.count({
      where: { portfolioId, viewedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.portfolioView.findMany({
      where: { portfolioId, viewedAt: { gte: sevenDaysAgo } },
      select: { viewedAt: true },
      orderBy: { viewedAt: "asc" },
    }),
    prisma.portfolioView.findMany({
      where: { portfolioId, viewedAt: { gte: thirtyDaysAgo } },
      select: { viewedAt: true },
    }),
  ]);

  const peak = findPeakHour(buildHourlyBuckets(monthlyViews));
  const weekOverWeekChange = computeWeekOverWeekChange(last7Days, previous7Days);

  return NextResponse.json({
    access,
    isPublished: user.portfolio?.isPublished ?? false,
    totalViews,
    todayViews,
    last7Days,
    last30Days,
    previous7Days,
    weekOverWeekChange,
    avgDaily7Days: Math.round((last7Days / 7) * 10) / 10,
    peakHour: peak
      ? {
          hour: peak.hour,
          label: formatHourLabel(peak.hour),
          count: peak.count,
        }
      : null,
    daily: buildLast7DayBuckets(recentViews, now),
  });
}

export interface DailyViewCount {
  date: string;
  count: number;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildLast7DayBuckets(
  views: { viewedAt: Date }[],
  now: Date = new Date()
): DailyViewCount[] {
  const buckets = new Map<string, number>();

  for (let i = 6; i >= 0; i--) {
    const d = startOfDay(now);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const view of views) {
    const key = view.viewedAt.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

export function buildHourlyBuckets(
  views: { viewedAt: Date }[]
): { hour: number; count: number }[] {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));

  for (const view of views) {
    const hour = view.viewedAt.getHours();
    buckets[hour].count += 1;
  }

  return buckets;
}

export function findPeakHour(
  hourly: { hour: number; count: number }[]
): { hour: number; count: number } | null {
  let peak: { hour: number; count: number } | null = null;

  for (const bucket of hourly) {
    if (!peak || bucket.count > peak.count) {
      peak = bucket;
    }
  }

  return peak?.count ? peak : null;
}

export function formatHourLabel(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function computeWeekOverWeekChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null;
  }
  return Math.round(((current - previous) / previous) * 100);
}

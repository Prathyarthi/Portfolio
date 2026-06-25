"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Eye,
  Lock,
  Minus,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import type { DailyViewCount } from "@/features/analytics/lib/stats";
import { cn } from "@/lib/utils";

interface AnalyticsState {
  totalViews: number;
  todayViews: number;
  last7Days: number;
  last30Days: number;
  weekOverWeekChange: number | null;
  avgDaily7Days: number;
  peakHour: { hour: number; label: string; count: number } | null;
  isPublished: boolean;
  daily: DailyViewCount[];
  access?: { canUseAnalytics?: boolean };
}

function formatDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

const statCardClassName =
  "border-border-default bg-surface-raised shadow-[var(--shadow-card)]";

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className={statCardClassName}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-body-sm font-medium text-text-secondary">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-text-muted" aria-hidden />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-text-primary md:text-4xl">
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function WeekChangeBadge({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
        <Minus className="h-3 w-3" aria-hidden />
        No prior week data
      </span>
    );
  }

  const positive = change > 0;
  const neutral = change === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        positive && "text-success",
        neutral && "text-text-muted",
        !positive && !neutral && "text-danger"
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : neutral ? (
        <Minus className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {positive ? "+" : ""}
      {change}% vs prior week
    </span>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [stats, setStats] = useState<AnalyticsState | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/analytics/me", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as AnalyticsState & {
          error?: string;
        };
        if (cancelled) return;

        if (res.status === 403) {
          setLocked(true);
          setStats(null);
          return;
        }

        if (!res.ok) {
          setLocked(false);
          setStats(null);
          return;
        }

        setLocked(false);
        setStats(data);
      } catch {
        if (!cancelled) {
          setLocked(false);
          setStats(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxDaily = Math.max(1, ...(stats?.daily.map((d) => d.count) ?? [1]));

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-2 md:py-6">
      <header className="space-y-1">
        <p className="eyebrow uppercase">Insights</p>
        <h1 className="text-h2 text-text-primary">Portfolio analytics</h1>
        <p className="text-body-sm text-text-secondary">
          See how many people visit your live portfolio and how traffic trends
          over time.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className={statCardClassName}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locked ? (
        <Card className={statCardClassName}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" aria-hidden />
              <CardTitle className="text-h4 text-text-primary">Pro feature</CardTitle>
            </div>
            <CardDescription className="text-text-secondary">
              Visit analytics is included with Pro. Upgrade to see view counts
              and trends for your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/billing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      ) : stats ? (
        <div className="space-y-6">
          {!stats.isPublished && (
            <div className="rounded-[var(--radius-md)] border border-warning/30 bg-warning-bg px-4 py-3 text-body-sm">
              <p className="font-medium text-text-primary">Portfolio not live yet</p>
              <p className="mt-1 text-text-secondary">
                Publish your portfolio to start collecting visits. Views are
                recorded when someone opens your public link.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total views"
              value={stats.totalViews.toLocaleString()}
              icon={Eye}
            />
            <StatCard
              title="Today"
              value={stats.todayViews.toLocaleString()}
              icon={BarChart3}
            />
            <StatCard
              title="Last 30 days"
              value={stats.last30Days.toLocaleString()}
              icon={TrendingUp}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className={statCardClassName}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-body-sm font-medium text-text-secondary">
                  Last 7 days
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-text-muted" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-text-primary md:text-4xl">
                  {stats.last7Days.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {stats.avgDaily7Days}/day average
                </p>
                <div className="mt-2">
                  <WeekChangeBadge change={stats.weekOverWeekChange} />
                </div>
              </CardContent>
            </Card>
            <StatCard
              title="Peak hour"
              value={stats.peakHour?.label ?? "—"}
              hint={
                stats.peakHour
                  ? `${stats.peakHour.count} views in last 30 days`
                  : "Not enough data yet"
              }
              icon={Clock}
            />
          </div>

          <Card className={statCardClassName}>
            <CardHeader>
              <CardTitle className="text-h4 text-text-primary">Last 7 days</CardTitle>
              <CardDescription className="text-text-secondary">
                Daily visits to your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2">
                {stats.daily.map((day) => (
                  <div
                    key={day.date}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <Badge
                      variant="secondary"
                      className="rounded-full border-border-default bg-surface-sunken px-2 text-xs font-medium tabular-nums text-text-primary"
                    >
                      {day.count}
                    </Badge>
                    <div className="flex h-24 w-full items-end justify-center">
                      <div
                        className="w-full max-w-8 rounded-t-md bg-brand-primary/80 transition-all"
                        style={{
                          height: `${Math.max(8, (day.count / maxDaily) * 100)}%`,
                        }}
                        title={`${day.count} view${day.count === 1 ? "" : "s"}`}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {formatDayLabel(day.date)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className={statCardClassName}>
          <CardContent className="py-8 text-center text-body-sm text-text-secondary">
            Could not load analytics. Try refreshing the page.
          </CardContent>
        </Card>
      )}

      <FlowFooter
        previous={{ href: "/dashboard", label: "Overview" }}
        next={{ href: "/dashboard/billing", label: "Billing" }}
      />
    </div>
  );
}

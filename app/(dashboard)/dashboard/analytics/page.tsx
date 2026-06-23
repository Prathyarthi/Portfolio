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
    <Card className="border-white/8 bg-white/3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-zinc-500" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-zinc-50">{value}</p>
        {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function WeekChangeBadge({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <Minus className="h-3 w-3" />
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
        positive && "text-emerald-400",
        neutral && "text-zinc-500",
        !positive && !neutral && "text-rose-400"
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
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
          Insights
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
          Portfolio analytics
        </h1>
        <p className="text-sm text-zinc-500">
          See how many people visit your live portfolio and how traffic trends
          over time.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-white/8 bg-white/3">
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
        <Card className="border-white/8 bg-white/3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-300" />
              <CardTitle className="text-lg text-zinc-100">Pro feature</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
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
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-100">
              <p className="font-medium text-amber-50">Portfolio not live yet</p>
              <p className="mt-1 text-amber-100/80">
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
            <Card className="border-white/8 bg-white/3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  Last 7 days
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-zinc-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-zinc-50">
                  {stats.last7Days.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
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

          <Card className="border-white/8 bg-white/3">
            <CardHeader>
              <CardTitle className="text-base text-zinc-100">Last 7 days</CardTitle>
              <CardDescription className="text-zinc-500">
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
                      className="rounded-full border-white/10 bg-white/5 px-2 text-[10px] text-zinc-400"
                    >
                      {day.count}
                    </Badge>
                    <div className="flex h-24 w-full items-end justify-center">
                      <div
                        className="w-full max-w-8 rounded-t-md bg-teal-500/80 transition-all"
                        style={{
                          height: `${Math.max(8, (day.count / maxDaily) * 100)}%`,
                        }}
                        title={`${day.count} view${day.count === 1 ? "" : "s"}`}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {formatDayLabel(day.date)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-white/8 bg-white/3">
          <CardContent className="py-8 text-center text-sm text-zinc-500">
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

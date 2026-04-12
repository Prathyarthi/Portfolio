import type { GitHubContributionCalendar } from "@/lib/github";

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "short" });
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function parseContributionCalendar(
  raw: unknown
): GitHubContributionCalendar | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const weeks = o.weeks;
  const total = o.totalContributions;
  if (!Array.isArray(weeks) || typeof total !== "number") return null;
  const normalized: GitHubContributionCalendar["weeks"] = [];
  for (const w of weeks) {
    if (!w || typeof w !== "object") continue;
    const days = (w as Record<string, unknown>).contributionDays;
    if (!Array.isArray(days)) continue;
    const contributionDays: Array<{ date: string; contributionCount: number }> =
      [];
    for (const d of days) {
      if (!d || typeof d !== "object") continue;
      const rec = d as Record<string, unknown>;
      if (typeof rec.date !== "string") continue;
      const c = rec.contributionCount;
      const count =
        typeof c === "number"
          ? c
          : typeof c === "string"
            ? Number(c) || 0
            : 0;
      contributionDays.push({ date: rec.date, contributionCount: count });
    }
    normalized.push({ contributionDays });
  }
  if (normalized.length === 0) return null;
  return { totalContributions: total, weeks: normalized };
}

export function GitHubContributionHeatmap({
  calendar,
  profileUrl,
  username,
}: {
  calendar: GitHubContributionCalendar;
  profileUrl?: string | null;
  username?: string | null;
}) {
  const monthLabels = calendar.weeks.map((week, index) => {
    const firstRealDay = week.contributionDays.find((day) =>
      /^\d{4}-\d{2}-\d{2}$/.test(day.date)
    );
    if (!firstRealDay) return "";

    const label = MONTH_LABEL_FORMATTER.format(new Date(`${firstRealDay.date}T00:00:00`));
    if (index === 0) return label;

    const prevRealDay = calendar.weeks[index - 1]?.contributionDays.find((day) =>
      /^\d{4}-\d{2}-\d{2}$/.test(day.date)
    );
    if (!prevRealDay) return label;

    const prevLabel = MONTH_LABEL_FORMATTER.format(
      new Date(`${prevRealDay.date}T00:00:00`)
    );
    return prevLabel === label ? "" : label;
  });

  const cellClass = (count: number) => {
    if (count === 0) return "bg-gray-900/80 ring-1 ring-inset ring-white/5";
    if (count <= 2) return "bg-emerald-950/90 ring-1 ring-inset ring-emerald-900/60";
    if (count <= 5) return "bg-emerald-800/70 ring-1 ring-inset ring-emerald-700/50";
    if (count <= 9) return "bg-emerald-600/70 ring-1 ring-inset ring-emerald-500/40";
    return "bg-emerald-400/85 ring-1 ring-inset ring-emerald-300/40";
  };

  return (
    <div className="mt-10 border-t border-green-900/30 pt-8">
      <p className="mb-1 text-xs text-gray-600">
        guest@portfolio:~$ gh activity --year
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
        <p>
          <span className="font-medium text-emerald-400">
            {calendar.totalContributions}
          </span>{" "}
        contributions in the last year
        </p>
        {profileUrl && username ? (
          <p>
            <span className="text-gray-700">·</span>{" "}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500/80 underline decoration-emerald-900/60 underline-offset-2 transition-colors hover:text-emerald-300"
            >
              @{username}
            </a>
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full rounded-xl border border-white/5 bg-black/20 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.03)]">
          <div className="mb-2 flex w-max gap-[3px] pl-8 text-[10px] uppercase tracking-wide text-gray-600">
            {monthLabels.map((label, index) => (
              <div key={`${label || "month"}-${index}`} className="w-3">
                {label}
              </div>
            ))}
          </div>
          <div className="flex w-max gap-2">
            <div className="flex flex-col gap-[3px] pt-px text-[10px] text-gray-600">
              {WEEKDAY_LABELS.map((label, index) => (
                <div key={`${label || "day"}-${index}`} className="flex h-3 items-center">
                  {label}
                </div>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {calendar.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.contributionDays.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}: ${day.contributionCount} contribution${
                        day.contributionCount === 1 ? "" : "s"
                      }`}
                      className={`h-3 w-3 rounded-[3px] transition-transform duration-150 hover:scale-110 ${cellClass(
                        day.contributionCount
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-[10px] text-gray-600">
            <span>Less</span>
            <div className="flex items-center gap-[3px]">
              {[0, 1, 4, 8, 16].map((count) => (
                <div
                  key={count}
                  className={`h-3 w-3 rounded-[3px] ${cellClass(count)}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

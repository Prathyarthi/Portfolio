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
  variant = "developer",
  label = "guest@portfolio:~$ gh activity --year",
}: {
  calendar: GitHubContributionCalendar;
  profileUrl?: string | null;
  username?: string | null;
  variant?: "developer" | "modern" | "corporate" | "minimal" | "creative";
  label?: string | null;
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

  const theme = getHeatmapTheme(variant);

  const cellClass = (count: number) => {
    if (count === 0) return theme.cells[0];
    if (count <= 2) return theme.cells[1];
    if (count <= 5) return theme.cells[2];
    if (count <= 9) return theme.cells[3];
    return theme.cells[4];
  };

  return (
    <div className={theme.rootClassName}>
      {label ? <p className={theme.labelClassName}>{label}</p> : null}
      <div className={theme.metaClassName}>
        <p>
          <span className={theme.totalClassName}>
            {calendar.totalContributions}
          </span>{" "}
          contributions in the last year
        </p>
        {profileUrl && username ? (
          <p>
            <span className={theme.separatorClassName}>·</span>{" "}
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={theme.linkClassName}
            >
              @{username}
            </a>
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto pb-1">
        <div className={theme.frameClassName}>
          <div className={`mb-2 flex w-max gap-[3px] pl-8 text-[10px] uppercase tracking-wide ${theme.axisClassName}`}>
            {monthLabels.map((label, index) => (
              <div key={`${label || "month"}-${index}`} className="w-3">
                {label}
              </div>
            ))}
          </div>
          <div className="flex w-max gap-2">
            <div className={`flex flex-col gap-[3px] pt-px text-[10px] ${theme.axisClassName}`}>
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
          <div className={`mt-4 flex items-center justify-between gap-4 text-[10px] ${theme.axisClassName}`}>
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

function getHeatmapTheme(variant: "developer" | "modern" | "corporate" | "minimal" | "creative") {
  switch (variant) {
    case "corporate":
      return {
        rootClassName: "mt-8 border-t border-slate-200 pt-6",
        labelClassName:
          "mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400",
        metaClassName:
          "mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500",
        totalClassName: "font-semibold text-slate-900",
        separatorClassName: "text-slate-300",
        linkClassName:
          "text-sky-700 underline decoration-sky-200 underline-offset-2 transition-colors hover:text-sky-800",
        frameClassName:
          "inline-block min-w-full rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm",
        axisClassName: "text-slate-400",
        cells: [
          "bg-white ring-1 ring-inset ring-slate-200",
          "bg-sky-100 ring-1 ring-inset ring-sky-200",
          "bg-sky-200 ring-1 ring-inset ring-sky-300",
          "bg-sky-400 ring-1 ring-inset ring-sky-500/40",
          "bg-sky-600 ring-1 ring-inset ring-sky-700/30",
        ],
      };
    case "minimal":
      return {
        rootClassName: "mt-8 border-t border-stone-200 pt-6",
        labelClassName:
          "mb-1 text-xs font-medium uppercase tracking-[0.22em] text-stone-400",
        metaClassName:
          "mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500",
        totalClassName: "font-medium text-stone-900",
        separatorClassName: "text-stone-300",
        linkClassName:
          "text-stone-700 underline decoration-stone-300 underline-offset-2 transition-colors hover:text-stone-900",
        frameClassName:
          "inline-block min-w-full rounded-xl border border-stone-200 bg-[#fffdf8] p-4",
        axisClassName: "text-stone-400",
        cells: [
          "bg-white ring-1 ring-inset ring-stone-200",
          "bg-stone-100 ring-1 ring-inset ring-stone-200",
          "bg-stone-200 ring-1 ring-inset ring-stone-300",
          "bg-amber-300 ring-1 ring-inset ring-amber-400/40",
          "bg-stone-700 ring-1 ring-inset ring-stone-800/20",
        ],
      };
    case "creative":
      return {
        rootClassName: "mt-8 border-t border-pink-100 pt-6",
        labelClassName:
          "mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-pink-500",
        metaClassName:
          "mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500",
        totalClassName: "font-semibold text-gray-900",
        separatorClassName: "text-pink-300",
        linkClassName:
          "text-pink-500 underline decoration-pink-200 underline-offset-2 transition-colors hover:text-pink-600",
        frameClassName:
          "inline-block min-w-full rounded-2xl border border-pink-100 bg-white p-4 shadow-sm",
        axisClassName: "text-gray-400",
        cells: [
          "bg-gray-100 ring-1 ring-inset ring-gray-200",
          "bg-pink-100 ring-1 ring-inset ring-pink-200",
          "bg-orange-200 ring-1 ring-inset ring-orange-300",
          "bg-orange-400 ring-1 ring-inset ring-orange-500/40",
          "bg-pink-500 ring-1 ring-inset ring-pink-600/30",
        ],
      };
    case "modern":
      return {
        rootClassName: "mt-8 border-t border-white/10 pt-6",
        labelClassName:
          "mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500",
        metaClassName:
          "mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400",
        totalClassName: "font-semibold text-white",
        separatorClassName: "text-zinc-600",
        linkClassName:
          "text-cyan-300 underline decoration-cyan-500/20 underline-offset-2 transition-colors hover:text-cyan-200",
        frameClassName:
          "inline-block min-w-full rounded-xl border border-white/10 bg-black/20 p-4 shadow-[0_0_0_1px_rgba(34,211,238,0.03)]",
        axisClassName: "text-zinc-500",
        cells: [
          "bg-zinc-900 ring-1 ring-inset ring-white/5",
          "bg-violet-950/90 ring-1 ring-inset ring-violet-900/60",
          "bg-violet-700/70 ring-1 ring-inset ring-violet-600/50",
          "bg-cyan-600/70 ring-1 ring-inset ring-cyan-500/40",
          "bg-cyan-400/85 ring-1 ring-inset ring-cyan-300/40",
        ],
      };
    case "developer":
    default:
      return {
        rootClassName: "mt-10 border-t border-green-900/30 pt-8",
        labelClassName: "mb-1 text-xs text-gray-600",
        metaClassName:
          "mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500",
        totalClassName: "font-medium text-emerald-400",
        separatorClassName: "text-gray-700",
        linkClassName:
          "text-emerald-500/80 underline decoration-emerald-900/60 underline-offset-2 transition-colors hover:text-emerald-300",
        frameClassName:
          "inline-block min-w-full rounded-xl border border-white/5 bg-black/20 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.03)]",
        axisClassName: "text-gray-600",
        cells: [
          "bg-gray-900/80 ring-1 ring-inset ring-white/5",
          "bg-emerald-950/90 ring-1 ring-inset ring-emerald-900/60",
          "bg-emerald-800/70 ring-1 ring-inset ring-emerald-700/50",
          "bg-emerald-600/70 ring-1 ring-inset ring-emerald-500/40",
          "bg-emerald-400/85 ring-1 ring-inset ring-emerald-300/40",
        ],
      };
  }
}

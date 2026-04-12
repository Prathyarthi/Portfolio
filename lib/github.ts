export interface GitHubProfile {
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  repos: number;
  followers: number;
  following: number;
  location: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
}

export interface GitHubData {
  profile: GitHubProfile;
  repos: GitHubRepo[];
}

/** Parsed from https://github.com/users/{login}/contributions HTML */
export interface GitHubContributionCalendar {
  totalContributions: number;
  weeks: Array<{
    contributionDays: Array<{
      date: string;
      contributionCount: number;
    }>;
  }>;
}

/** GitHub uses data-level 0–4; keep this only as a fallback. */
const CONTRIBUTION_LEVEL_TO_COUNT: readonly number[] = [0, 1, 4, 8, 16];

const GITHUB_REST_TIMEOUT_MS = 45_000;

export function buildGitHubCachedStats(
  data: GitHubData,
  calendar: GitHubContributionCalendar | null
): Record<string, unknown> {
  const stars = data.repos.reduce((sum, r) => sum + r.stars, 0);
  return {
    public_repos: data.profile.repos,
    followers: data.profile.followers,
    following: data.profile.following,
    stars,
    ...(calendar ? { contributionCalendar: calendar } : {}),
  };
}

function parseContributionCountFromTooltip(text: string): number | null {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (/^No contributions on /i.test(normalized)) {
    return 0;
  }

  const match = normalized.match(/^(\d+)\s+contributions?\s+on\s+/i);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

/**
 * Scrapes the public contributions grid from GitHub's HTML page (same data as
 * the green graph on a profile). No GraphQL token required.
 */
export async function fetchGitHubContributionsFromProfilePage(
  username: string
): Promise<GitHubContributionCalendar | null> {
  const login = username.trim();
  if (!login) return null;

  const url = `https://github.com/users/${encodeURIComponent(login)}/contributions`;
  const res = await fetch(url, {
    headers: {
      Accept: "text/html",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(GITHUB_REST_TIMEOUT_MS),
  });

  if (!res.ok) return null;

  const html = await res.text();

  const totalM = html.match(/(\d+)\s+contributions?\s+in\s+the\s+last\s+year/i);
  const totalContributions = totalM ? Number(totalM[1]) : 0;

  // GitHub order: data-date, id="contribution-day-component-{weekday}-{week}", data-level
  const cellRe =
    /<td[^>]*data-date="(20\d{2}-\d{2}-\d{2})"[^>]*id="contribution-day-component-(\d+)-(\d+)"[^>]*data-level="(\d)"/g;

  type Cell = {
    date: string;
    level: number;
    weekday: number;
    week: number;
  };

  const raw: Cell[] = [];
  let m: RegExpExecArray | null;
  while ((m = cellRe.exec(html)) !== null) {
    raw.push({
      date: m[1],
      weekday: Number(m[2]),
      week: Number(m[3]),
      level: Math.min(4, Math.max(0, Number(m[4]))),
    });
  }

  if (raw.length === 0) return null;

  const tooltipCountByCell = new Map<string, number>();
  const tooltipRe =
    /<tool-tip[^>]*for="contribution-day-component-(\d+)-(\d+)"[^>]*>([^<]*)<\/tool-tip>/g;
  while ((m = tooltipRe.exec(html)) !== null) {
    const count = parseContributionCountFromTooltip(m[3]);
    if (count == null) continue;
    tooltipCountByCell.set(`${m[1]}-${m[2]}`, count);
  }

  const byDate = new Map<string, Cell>();
  for (const c of raw) {
    if (!byDate.has(c.date)) byDate.set(c.date, c);
  }

  const byWeek = new Map<number, Map<number, Cell>>();
  for (const c of byDate.values()) {
    if (!byWeek.has(c.week)) byWeek.set(c.week, new Map());
    byWeek.get(c.week)!.set(c.weekday, c);
  }

  const maxWeek = Math.max(...byWeek.keys());
  const weeks: GitHubContributionCalendar["weeks"] = [];

  for (let w = 0; w <= maxWeek; w++) {
    const col = byWeek.get(w);
    const contributionDays: GitHubContributionCalendar["weeks"][number]["contributionDays"] =
      [];
    for (let d = 0; d < 7; d++) {
      const cell = col?.get(d);
      contributionDays.push({
        date: cell?.date ?? `${w}-${d}`,
        contributionCount:
          cell != null
            ? (tooltipCountByCell.get(`${d}-${w}`) ??
              CONTRIBUTION_LEVEL_TO_COUNT[cell.level] ??
              0)
            : 0,
      });
    }
    weeks.push({ contributionDays });
  }

  return {
    totalContributions:
      totalContributions > 0
        ? totalContributions
        : [...byDate.values()].reduce(
            (s, c) => s + (CONTRIBUTION_LEVEL_TO_COUNT[c.level] ?? 0),
            0
          ),
    weeks,
  };
}

function githubRestHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    // GitHub requires a descriptive User-Agent or requests may be throttled/blocked.
    "User-Agent": "my-portfolio-app (https://github.com/)",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

export async function fetchGitHubProfile(
  username: string,
  accessToken?: string
): Promise<GitHubData> {
  const login = encodeURIComponent(username.trim());
  const headers = githubRestHeaders(accessToken);
  const signal = AbortSignal.timeout(GITHUB_REST_TIMEOUT_MS);

  const userUrl = `https://api.github.com/users/${login}`;
  const reposUrl = `https://api.github.com/users/${login}/repos?sort=stars&direction=desc&per_page=100&type=owner`;

  const [userRes, reposRes] = await Promise.all([
    fetch(userUrl, { headers, signal }),
    fetch(reposUrl, { headers, signal }),
  ]);

  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${username}" not found`);
    }
    throw new Error(`GitHub API error: ${userRes.status}`);
  }

  if (!reposRes.ok) {
    throw new Error(`GitHub API error fetching repos: ${reposRes.status}`);
  }

  const user = await userRes.json();
  const rawRepos = await reposRes.json();

  const profile: GitHubProfile = {
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    repos: user.public_repos,
    followers: user.followers,
    following: user.following ?? 0,
    location: user.location,
  };

  const repos: GitHubRepo[] = rawRepos
    .filter((r: any) => !r.fork)
    .map((r: any) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      topics: r.topics ?? [],
    }));

  return { profile, repos };
}

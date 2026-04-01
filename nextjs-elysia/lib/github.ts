export interface GitHubProfile {
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  repos: number;
  followers: number;
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

export async function fetchGitHubProfile(
  username: string,
  accessToken?: string
): Promise<GitHubData> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-builder",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Fetch user profile
  const userRes = await fetch(`https://api.github.com/users/${username}`, {
    headers,
  });

  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${username}" not found`);
    }
    throw new Error(`GitHub API error: ${userRes.status}`);
  }

  const user = await userRes.json();

  // Fetch repositories (sorted by stars, max 100)
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&direction=desc&per_page=100&type=owner`,
    { headers }
  );

  if (!reposRes.ok) {
    throw new Error(`GitHub API error fetching repos: ${reposRes.status}`);
  }

  const rawRepos = await reposRes.json();

  const profile: GitHubProfile = {
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    repos: user.public_repos,
    followers: user.followers,
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

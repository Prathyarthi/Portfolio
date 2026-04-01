export interface LeetCodeStats {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

export async function fetchLeetCodeStats(
  username: string
): Promise<LeetCodeStats> {
  const res = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query: USER_PROFILE_QUERY,
      variables: { username },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API error: ${res.status}`);
  }

  const data = await res.json();

  if (!data.data?.matchedUser) {
    throw new Error(`LeetCode user "${username}" not found`);
  }

  const user = data.data.matchedUser;
  const stats = user.submitStatsGlobal.acSubmissionNum;

  const getCount = (difficulty: string): number => {
    const entry = stats.find(
      (s: { difficulty: string; count: number }) => s.difficulty === difficulty
    );
    return entry?.count ?? 0;
  };

  return {
    username: user.username,
    ranking: user.profile.ranking,
    totalSolved: getCount("All"),
    easySolved: getCount("Easy"),
    mediumSolved: getCount("Medium"),
    hardSolved: getCount("Hard"),
  };
}

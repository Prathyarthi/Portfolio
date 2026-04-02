export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Date not provided";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateRange(start: string | null, end: string | null): string {
  const startFormatted = formatDate(start);
  const endFormatted = end ? formatDate(end) : "Present";
  return `${startFormatted} - ${endFormatted}`;
}

export function groupSkillsByCategory(
  skills: Array<{ name: string; category: string }>
): Record<string, string[]> {
  return skills.reduce(
    (acc, skill) => {
      const cat = skill.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill.name);
      return acc;
    },
    {} as Record<string, string[]>
  );
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    github: "GitHub",
    linkedin: "LinkedIn",
    leetcode: "LeetCode",
    twitter: "Twitter",
    dribbble: "Dribbble",
    website: "Website",
  };
  return icons[platform.toLowerCase()] ?? platform;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  
  // Detect year-only dates (stored as YYYY-01-01T00:00:00.000Z)
  // If date is January 1st, assume it's a year-only date and display only the year
  if (date.getUTCMonth() === 0 && date.getUTCDate() === 1) {
    return date.getUTCFullYear().toString();
  }
  
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "";
  
  const startFormatted = start ? formatDate(start) : "";
  const endFormatted = end ? formatDate(end) : "Present";
  
  if (!startFormatted && !end) return "";
  if (!startFormatted) return endFormatted;
  
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
    medium: "Medium",
    website: "Website",
  };
  return icons[platform.toLowerCase()] ?? platform;
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeetCodeStats } from "@/lib/leetcode";

export function useFetchLeetCode() {
  return useMutation({
    mutationFn: async (username: string): Promise<LeetCodeStats> => {
      const res = await fetch("/api/profile/leetcode/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to fetch LeetCode stats");
      return json.data;
    },
  });
}

export function useImportLeetCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stats: LeetCodeStats) => {
      const res = await fetch("/api/profile/leetcode/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || "Failed to import LeetCode stats");
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}

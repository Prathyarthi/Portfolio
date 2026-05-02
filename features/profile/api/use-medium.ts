"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MediumArticle, MediumProfile } from "@/lib/medium";

export function useFetchMedium() {
  return useMutation({
    mutationFn: async (username: string): Promise<MediumProfile> => {
      const res = await fetch("/api/profile/medium/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch Medium articles");
      return json.data;
    },
  });
}

export function useImportMedium() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      username: string;
      articles: MediumArticle[];
    }): Promise<{ imported: number }> => {
      const res = await fetch("/api/profile/medium/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to import articles");
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolio"] }),
  });
}

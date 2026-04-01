"use client";

import { useMutation } from "@tanstack/react-query";
import type { ParsedResume } from "@/lib/gemini";

export function useParseResume() {
  return useMutation({
    mutationFn: async (file: File): Promise<ParsedResume> => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to parse resume");
      return json.data;
    },
  });
}

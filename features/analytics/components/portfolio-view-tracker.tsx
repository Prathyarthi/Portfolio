"use client";

import { useEffect, useRef } from "react";

export function PortfolioViewTracker({ slug }: { slug: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !slug) return;
    tracked.current = true;

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {
      
    });
  }, [slug]);

  return null;
}

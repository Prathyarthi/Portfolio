"use client";

import { useEffect, useState } from "react";
import { getPortfolioSubdomainHost } from "@/lib/domain";

type Phase = "idle" | "parsing" | "live";

const EXAMPLE_LIVE_HOST = getPortfolioSubdomainHost("yourname");

function LiveStep() {
  return (
    <>
      resume.pdf <span className="transform-rail__arrow">→</span>{" "}
      <span className="bracket-chip bracket-chip--live">{EXAMPLE_LIVE_HOST}</span>
    </>
  );
}

const STEPS: Record<Exclude<Phase, "live">, React.ReactNode> = {
  idle: <>resume.pdf</>,
  parsing: (
    <>
      resume.pdf <span className="transform-rail__arrow">→</span>{" "}
      <span className="transform-rail__step">[ parsing ]</span>
    </>
  ),
};

/** Signature monospace strip: resume → parse → live URL */
export function TransformRail({ className }: { className?: string }) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setPhase("live");
      return;
    }

    let cancelled = false;
    const run = () => {
      setPhase("idle");
      window.setTimeout(() => {
        if (!cancelled) setPhase("parsing");
      }, 1200);
      window.setTimeout(() => {
        if (!cancelled) setPhase("live");
      }, 3200);
    };

    run();
    const interval = window.setInterval(run, 6500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`transform-rail rounded-[var(--radius-md)] border border-border-default bg-surface-sunken px-4 py-3 ${className ?? ""}`}
      aria-live="polite"
      aria-label="Portfolio generation progress"
    >
      <span className="transform-rail__file">
        {phase === "live" ? <LiveStep /> : STEPS[phase]}
      </span>
      {phase !== "live" && (
        <span className="transform-rail__cursor" aria-hidden>
          ▊
        </span>
      )}
    </div>
  );
}

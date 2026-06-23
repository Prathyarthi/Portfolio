import { cn } from "@/lib/utils";

/** Standard interactive surface — features, CTAs */
export const landingSurfaceInteractive = cn(
  "rounded-[var(--radius-lg)] border border-border-default bg-surface-raised shadow-[var(--shadow-card)]",
  "transition-all duration-200 ease-[var(--ease-out)]",
  "hover:-translate-y-0.5 hover:border-border-strong"
);

/** Larger radius variant */
export const landingSurfaceInteractiveLg = cn(
  "rounded-[var(--radius-xl)] border border-border-default bg-surface-raised shadow-[var(--shadow-card)]",
  "transition-all duration-200 ease-[var(--ease-out)]",
  "hover:border-border-strong"
);

/** Read-only / static panels */
export const landingSurfaceMuted = cn(
  "rounded-[var(--radius-lg)] border border-border-default bg-surface-raised"
);

/** Focus ring — brand */
export const landingFocusRing = cn(
  "outline-none focus-visible:shadow-[var(--shadow-focus)]"
);

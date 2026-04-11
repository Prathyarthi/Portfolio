import { cn } from "@/lib/utils";

const interactiveBase = cn(
  "border border-white/[0.06] bg-[#090c12]/90",
  "transition-[border-color,background-color] duration-300",
  "hover:border-white/[0.12] hover:bg-[#0b0f16]/95"
);

/** Default radius — features, templates, CTA blocks */
export const landingSurfaceInteractive = cn("rounded-2xl", interactiveBase);

/** Larger radius — dashboard hero card, wide panels */
export const landingSurfaceInteractiveLg = cn("rounded-3xl", interactiveBase);

/** Read-only panels (hero preview shell, static embeds) */
export const landingSurfaceMuted = cn(
  "rounded-2xl border border-white/[0.06] bg-[#090c12]/75"
);

export const landingFocusRing = cn(
  "outline-none focus-visible:border-cyan-400/25 focus-visible:ring-2 focus-visible:ring-cyan-400/15"
);

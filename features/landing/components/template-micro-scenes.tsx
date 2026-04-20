"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type TemplateSceneId =
  | "minimal"
  | "modern"
  | "developer"
  | "creative"
  | "corporate"
  | "kiranbusari";

const easeSoft = [0.22, 1, 0.36, 1] as const;

const frame = cn(
  "relative mb-4 h-[5.25rem] overflow-hidden rounded-xl border border-white/[0.06] bg-black/35",
  "pointer-events-none select-none"
);

/** Motion vignettes aligned with each real portfolio template skin. */
export function TemplateMicroScene({ id, reduced }: { id: TemplateSceneId; reduced: boolean }) {
  if (reduced) {
    return <StaticScene id={id} />;
  }

  switch (id) {
    case "minimal":
      return <MinimalScene />;
    case "modern":
      return <ModernScene />;
    case "developer":
      return <DeveloperScene />;
    case "creative":
      return <CreativeScene />;
    case "corporate":
      return <CorporateScene />;
    case "kiranbusari":
      return <KiranbusariScene />;
    default:
      return null;
  }
}

/**
 * Minimal template: #f5f2ea paper, stone rules, generous vertical rhythm.
 * @see features/templates/minimal/minimal-template.tsx
 */
function MinimalScene() {
  return (
    <div className={frame} aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f2ea]/[0.09] via-transparent to-stone-500/[0.04]" />
      <div className="absolute inset-x-6 top-[22%] space-y-2">
        <motion.div
          className="h-px w-full max-w-[5.5rem] rounded-full bg-stone-500/45"
          animate={{ opacity: [0.28, 0.42, 0.28], scaleX: [0.92, 1, 0.92] }}
          transition={{ duration: 7, repeat: Infinity, ease: easeSoft }}
        />
        <motion.div
          className="h-px w-[72%] rounded-full bg-stone-400/30"
          animate={{ opacity: [0.2, 0.38, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: easeSoft, delay: 0.35 }}
        />
      </div>
      <div className="absolute bottom-3 left-4 flex gap-2">
        <motion.div
          className="h-5 w-10 rounded-full border border-stone-500/25 bg-[#fbf8f1]/[0.07]"
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: easeSoft, delay: 0.2 }}
        />
        <motion.div
          className="h-5 w-14 rounded-full border border-stone-500/20 bg-[#fbf8f1]/[0.05]"
          animate={{ opacity: [0.28, 0.48, 0.28] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: easeSoft, delay: 0.55 }}
        />
      </div>
    </div>
  );
}

/**
 * Modern template: #070b16, violet/cyan glows, frosted stacked surfaces.
 * @see features/templates/modern/modern-template.tsx
 */
function ModernScene() {
  return (
    <div className={frame} aria-hidden>
      <div className="absolute inset-0 z-0 bg-[#070b16]/90" />
      <motion.div
        className="absolute -left-8 -top-6 z-0 h-20 w-20 rounded-full bg-violet-500/30 blur-2xl"
        animate={{ x: [0, 10, 0], y: [0, 6, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: easeSoft }}
      />
      <motion.div
        className="absolute -bottom-4 -right-6 z-0 h-24 w-28 rounded-full bg-cyan-400/25 blur-2xl"
        animate={{ x: [0, -8, 0], y: [0, -5, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: easeSoft, delay: 0.4 }}
      />

      <div className="absolute left-2.5 top-3 z-10 h-[3.25rem] w-[calc(100%-1.25rem)] rounded-lg border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1" />
      <div className="absolute left-3.5 top-5 z-10 h-[3.25rem] w-[calc(100%-1.75rem)] rounded-lg border border-white/[0.09] bg-white/[0.05] backdrop-blur-sm transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2" />
      <motion.div
        className="absolute left-5 top-7 z-10 h-[3.25rem] w-[calc(100%-2.5rem)] rounded-lg border border-white/10 bg-white/[0.07] shadow-[0_12px_32px_-12px_rgba(124,58,237,0.35)] backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-3"
        animate={{ opacity: [0.72, 0.9, 0.72] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: easeSoft }}
      />
    </div>
  );
}

/**
 * Developer template: gray-950, green mono, scanlines, shell prompt.
 * @see features/templates/developer/developer-template.tsx
 */
function DeveloperScene() {
  const cols = 6;
  const rows = 2;
  const n = cols * rows;

  return (
    <div className={cn(frame, "border-green-900/30 bg-gray-950")} aria-hidden>
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.4]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
        }}
      />

      <div className="absolute left-2 top-1.5 z-[3] font-mono text-[7px] leading-none tracking-tight text-gray-600">
        <span className="text-gray-500">guest@folio</span>
        <span className="text-green-600">:~$</span>
        <motion.span
          className="ml-0.5 inline-block h-2 w-px translate-y-px bg-green-400/90 align-middle"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div
        className="absolute inset-x-2 bottom-1.5 top-6 z-[1] grid gap-px rounded-md border border-green-900/25 bg-gray-900/50 p-px"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: n }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-[2px] bg-green-500/10"
            animate={{ opacity: [0.35, 0.95, 0.35] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: easeSoft,
              delay: i * 0.11,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Creative template: light canvas, pink–orange–yellow gradients, soft blobs.
 * @see features/templates/creative/creative-template.tsx
 */
function CreativeScene() {
  return (
    <div className={cn(frame, "border-pink-200/10 bg-gray-50/[0.04]")} aria-hidden>
      <motion.div
        className="absolute -left-10 -top-12 h-24 w-24 rounded-full bg-gradient-to-br from-pink-400/25 via-orange-300/20 to-transparent blur-2xl"
        animate={{ scale: [1, 1.08, 1], x: [0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: easeSoft }}
      />
      <motion.div
        className="absolute -bottom-14 -right-8 h-28 w-28 rounded-full bg-gradient-to-tl from-orange-300/22 via-pink-300/15 to-transparent blur-2xl"
        animate={{ scale: [1, 1.06, 1], y: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: easeSoft, delay: 0.3 }}
      />

      <motion.div
        className="absolute left-[14%] top-[30%] h-6 w-16 rounded-2xl bg-gradient-to-r from-pink-500/35 to-orange-400/25"
        animate={{ y: [0, -3, 0], rotate: [-2, 3, -2] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: easeSoft }}
      />
      <motion.div
        className="absolute bottom-[24%] right-[12%] h-7 w-7 rounded-full bg-gradient-to-br from-orange-400/35 to-yellow-300/25"
        animate={{ y: [0, 2.5, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: easeSoft, delay: 0.2 }}
      />
      <motion.div
        className="absolute left-[28%] top-[52%] h-1 w-12 rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400"
        animate={{ opacity: [0.45, 0.85, 0.45], scaleX: [0.85, 1, 0.85] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: easeSoft, delay: 0.2 }}
      />
    </div>
  );
}

/**
 * Corporate template: deep navy, bright paper cards, and disciplined hierarchy.
 * @see features/templates/corporate/corporate-template.tsx
 */
function CorporateScene() {
  return (
    <div className={cn(frame, "border-slate-200/10 bg-[#0f172a]")} aria-hidden>
      <div className="absolute inset-0 bg-linear-to-br from-sky-400/10 via-transparent to-white/[0.03]" />
      <div className="absolute left-4 top-4 h-2 w-16 rounded-full bg-sky-300/45" />
      <div className="absolute left-4 top-9 h-1.5 w-24 rounded-full bg-white/25" />
      <div className="absolute left-4 top-14 h-1.5 w-20 rounded-full bg-white/16" />
      <motion.div
        className="absolute bottom-3 left-4 right-4 rounded-xl border border-white/10 bg-white/[0.07] p-2"
        animate={{ y: [0, -1.5, 0], opacity: [0.72, 0.92, 0.72] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: easeSoft }}
      >
        <div className="grid grid-cols-3 gap-2">
          <div className="h-8 rounded-lg bg-white/[0.08]" />
          <div className="h-8 rounded-lg bg-white/[0.06]" />
          <div className="h-8 rounded-lg bg-white/[0.08]" />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Kiran Busari template: #fbfffe mint canvas, gray-950 type, #fc3 accent (live site).
 * @see features/templates/kiranbusari/kiranbusari-template.tsx
 */
function KiranbusariScene() {
  return (
    <div className={cn(frame, "border-gray-100 bg-[#fbfffe]")} aria-hidden>
      <div className="absolute left-3 top-3 h-1.5 w-16 rounded-full bg-gray-950/80" />
      <div className="absolute left-3 top-6 h-1 w-24 rounded-full bg-gray-950/20" />
      <motion.div
        className="absolute left-3 top-[38%] h-1 w-12 rounded-full bg-[#fc3]"
        animate={{ opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: easeSoft }}
      />
      <div className="absolute bottom-2.5 left-3 right-3 space-y-1.5">
        <div className="h-2 rounded-sm bg-gray-100" />
        <div className="h-2 w-[80%] rounded-sm bg-gray-100" />
      </div>
    </div>
  );
}

function StaticScene({ id }: { id: TemplateSceneId }) {
  return (
    <div className={frame} aria-hidden>
      {id === "minimal" ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#f5f2ea]/[0.07] to-transparent" />
          <div className="absolute inset-x-6 top-[22%] space-y-2">
            <div className="h-px w-full max-w-[5.5rem] rounded-full bg-stone-500/40" />
            <div className="h-px w-[72%] rounded-full bg-stone-400/28" />
          </div>
        </>
      ) : null}
      {id === "modern" ? (
        <div className="absolute inset-0 bg-[#070b16]/90 p-3">
          <div className="absolute left-2.5 top-3 h-[3.25rem] w-[calc(100%-1.25rem)] rounded-lg border border-white/[0.08] bg-white/[0.04]" />
          <div className="absolute left-3.5 top-5 h-[3.25rem] w-[calc(100%-1.75rem)] rounded-lg border border-white/[0.09] bg-white/[0.05]" />
          <div className="absolute left-5 top-7 h-[3.25rem] w-[calc(100%-2.5rem)] rounded-lg border border-white/10 bg-white/[0.07]" />
        </div>
      ) : null}
      {id === "developer" ? (
        <>
          <div className="absolute inset-0 rounded-[inherit] border border-green-900/35 bg-gray-950" />
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
            }}
          />
          <div
            className="absolute inset-x-2 bottom-1.5 top-6 grid gap-px rounded-md border border-green-900/25 bg-gray-900/50 p-px"
            style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-[2px] bg-green-500/15" />
            ))}
          </div>
        </>
      ) : null}
      {id === "creative" ? (
        <div className={cn(frame, "border-pink-200/10 bg-gray-50/[0.04]")}>
          <div className="absolute left-[14%] top-[30%] h-6 w-16 rounded-2xl bg-gradient-to-r from-pink-500/35 to-orange-400/25" />
          <div className="absolute bottom-[24%] right-[12%] h-7 w-7 rounded-full bg-gradient-to-br from-orange-400/35 to-yellow-300/25" />
        </div>
      ) : null}
      {id === "corporate" ? (
        <div className={cn(frame, "border-slate-200/10 bg-[#0f172a]")}>
          <div className="absolute inset-0 bg-linear-to-br from-sky-400/10 via-transparent to-white/[0.03]" />
          <div className="absolute left-4 top-4 h-2 w-16 rounded-full bg-sky-300/45" />
          <div className="absolute left-4 top-9 h-1.5 w-24 rounded-full bg-white/25" />
          <div className="absolute left-4 top-14 h-1.5 w-20 rounded-full bg-white/16" />
          <div className="absolute bottom-3 left-4 right-4 rounded-xl border border-white/10 bg-white/[0.07] p-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="h-8 rounded-lg bg-white/[0.08]" />
              <div className="h-8 rounded-lg bg-white/[0.06]" />
              <div className="h-8 rounded-lg bg-white/[0.08]" />
            </div>
          </div>
        </div>
      ) : null}
      {id === "kiranbusari" ? (
        <div className={cn(frame, "border-gray-100 bg-[#fbfffe]")}>
          <div className="absolute left-3 top-3 h-1.5 w-16 rounded-full bg-gray-950/80" />
          <div className="absolute left-3 top-6 h-1 w-24 rounded-full bg-gray-950/20" />
          <div className="absolute left-3 top-[38%] h-1 w-12 rounded-full bg-[#fc3]" />
          <div className="absolute bottom-2.5 left-3 right-3 space-y-1.5">
            <div className="h-2 rounded-sm bg-gray-100" />
            <div className="h-2 w-[80%] rounded-sm bg-gray-100" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

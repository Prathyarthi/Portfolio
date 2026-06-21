"use client";

import { useMemo } from "react";

export function hashString(str: string | undefined | null): number {
    // 1. Add a guard clause to handle empty/undefined/null values
    if (!str) {
      return 0; 
    }
  
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Rng {
  float: (min?: number, max?: number) => number;
  int: (min: number, max: number) => number;
  pick: <T>(arr: T[]) => T;
}

function makeRng(seedString: string): Rng {
  const rng = mulberry32(hashString(seedString));
  return {
    float: (min = 0, max = 1) => min + rng() * (max - min),
    int: (min, max) => Math.floor(min + rng() * (max - min + 1)),
    pick: <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)],
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type Triple = [string, string, string];
type Palette = { core: Triple; accent: Triple; wash: Triple };

export const PALETTES: Palette[] = [
  { core: ["#3B82F6", "#1D4ED8", "#1E3A8A"], accent: ["#FDBA74", "#F97316", "#EA580C"], wash: ["#F5F8FC", "#EBF3FC", "#DEEAF7"] },
  { core: ["#34D399", "#059669", "#064E3B"], accent: ["#FCA5A5", "#EF4444", "#B91C1C"], wash: ["#F0FDF9", "#E6FBF3", "#D7F5E8"] },
  { core: ["#A78BFA", "#7C3AED", "#4C1D95"], accent: ["#FCD34D", "#F59E0B", "#B45309"], wash: ["#F8F6FE", "#F0EBFD", "#E6DEFB"] },
  { core: ["#F472B6", "#DB2777", "#831843"], accent: ["#7DD3FC", "#0EA5E9", "#0369A1"], wash: ["#FEF6FA", "#FCEAF3", "#FAD9E9"] },
  { core: ["#FB923C", "#EA580C", "#7C2D12"], accent: ["#5EEAD4", "#14B8A6", "#0F766E"], wash: ["#FFF8F2", "#FFEFE2", "#FFE3CC"] },
];

interface CoverConfig {
  palette: Palette;
  wash: { angle: number };
  spotlight: { x: number; y: number; color: string };
  sheen: { angle: number };
  ambient: {
    top: number; left: number; width: number; height: number;
    rotate: number; blur: number; color: string;
    radiusTR: number; radiusBL: number;
  } | null;
  core: {
    top: number; left: number; width: number; height: number;
    rotate: number; skew: number; colors: Triple;
    radius: number; shadow: string; splitAt: number;
  };
  accent: {
    bottom: number; right: number; width: number; height: number;
    rotate: number; colors: Triple; radius: number; shadow: string;
  };
  structural: {
    top: number; right: number; width: number; height: number;
    rotate: number; radius: number; color: string;
  } | null;
  glassMajor: {
    top: number; left: number; width: number; height: number;
    radius: number; foldV: number; foldH: number; reflectionAt: number;
  };
  glassMinor: {
    bottom: number; left: number; width: number; height: number; radius: number;
  } | null;
  frameLines: Array<{ top: number; right: number; width: number; height: number; rotate: number }>;
  specular: Array<{ top: number; left: number; size: number }>;
}

export function generateCoverConfig(seed: string): CoverConfig {
  const rng = makeRng(seed);
  const palette = rng.pick(PALETTES);

  const hasAmbientBacking = rng.float() > 0.15;
  const hasStructuralBacking = rng.float() > 0.25;
  const hasGlassMinor = rng.float() > 0.2;
  const frameLineCount = rng.int(0, 2);
  const specularCount = rng.int(1, 4);

  return {
    palette,
    wash: { angle: rng.int(115, 145) },
    spotlight: {
      x: rng.int(45, 70),
      y: rng.int(35, 60),
      color: hexToRgba(palette.core[0], 0.5 + rng.float(0, 0.15)),
    },
    sheen: { angle: rng.int(30, 55) },

    ambient: hasAmbientBacking
      ? {
          top: rng.float(4, 12), left: rng.float(3, 10),
          width: rng.float(32, 42), height: rng.float(58, 68),
          rotate: rng.float(-16, -8), blur: rng.int(38, 52),
          color: hexToRgba(palette.core[0], 0.3),
          radiusTR: rng.int(70, 110), radiusBL: rng.int(35, 65),
        }
      : null,

    core: {
      top: rng.float(19, 27), left: rng.float(15, 21),
      width: rng.float(42, 50), height: rng.float(52, 60),
      rotate: rng.float(9, 17), skew: rng.float(-6, -2),
      colors: palette.core, radius: rng.int(30, 42),
      shadow: hexToRgba(palette.core[1], 0.15),
      splitAt: rng.int(42, 58),
    },

    accent: {
      bottom: rng.float(9, 15), right: rng.float(9, 15),
      width: rng.float(36, 44), height: rng.float(40, 48),
      rotate: rng.float(-11, -5), colors: palette.accent,
      radius: rng.int(22, 34), shadow: hexToRgba(palette.accent[2], 0.22),
    },

    structural: hasStructuralBacking
      ? {
          top: rng.float(14, 22), right: rng.float(18, 26),
          width: rng.float(28, 36), height: rng.float(42, 52),
          rotate: rng.float(2, 10), radius: rng.int(36, 52),
          color: hexToRgba(palette.core[2], 0.2),
        }
      : null,

    glassMajor: {
      top: rng.float(7, 13), left: rng.float(35, 41),
      width: rng.float(47, 53), height: rng.float(74, 80),
      radius: rng.int(46, 60),
      foldV: rng.int(32, 44), foldH: rng.int(26, 38),
      reflectionAt: rng.float(8, 22),
    },

    glassMinor: hasGlassMinor
      ? {
          bottom: rng.float(4, 9), left: rng.float(7, 13),
          width: rng.float(38, 45), height: rng.float(34, 39),
          radius: rng.int(30, 40),
        }
      : null,

    frameLines: Array.from({ length: frameLineCount }, () => ({
      top: rng.float(4, 10), right: rng.float(5, 12),
      width: rng.float(10, 17), height: rng.float(58, 70),
      rotate: rng.float(14, 24),
    })),

    specular: Array.from({ length: specularCount }, () => ({
      top: rng.float(15, 65), left: rng.float(25, 65),
      size: rng.int(4, 9),
    })),
  };
}

export function GenerativeProjectCover({ seed }: { seed: string }) {
  const cfg = useMemo(() => generateCoverConfig(seed), [seed]);
  
  const filterId = useMemo(() => `noise-${hashString(seed)}`, [seed]);

  return (
    <div className="relative h-auto w-full overflow-hidden bg-stone-100">
      <div className="relative aspect-[16/10] overflow-hidden">
      
        <div className="absolute inset-0 z-40 pointer-events-none mix-blend-overlay opacity-[0.05]">
          <svg width="100%" height="100%">
            <filter id={filterId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#${filterId})`} />
          </svg>
        </div>
        
        <div
          className="absolute bg-red-600 inset-0"
          style={{
            background: `linear-gradient(${cfg.wash.angle}deg, ${cfg.palette.wash[0]}, ${cfg.palette.wash[1]}, ${cfg.palette.wash[2]})`,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none mix-blend-color-burn opacity-70"
          style={{
            background: `radial-gradient(circle at ${cfg.spotlight.x}% ${cfg.spotlight.y}%, ${cfg.spotlight.color} 0%, transparent 60%)`,
          }}
        />

        <div
          className="absolute -inset-10 pointer-events-none mix-blend-overlay opacity-40"
          style={{
            background: `linear-gradient(${cfg.sheen.angle}deg, rgba(255,255,255,0.4) 0%, transparent 60%, rgba(15,23,42,0.1) 100%)`,
          }}
        />

        {cfg.ambient && (
          <div
            className="absolute mix-blend-multiply"
            style={{
              top: `${cfg.ambient.top}%`, left: `${cfg.ambient.left}%`,
              width: `${cfg.ambient.width}%`, height: `${cfg.ambient.height}%`,
              borderTopRightRadius: `${cfg.ambient.radiusTR}px`,
              borderBottomLeftRadius: `${cfg.ambient.radiusBL}px`,
              backgroundColor: cfg.ambient.color,
              filter: `blur(${cfg.ambient.blur}px)`,
              transform: `rotate(${cfg.ambient.rotate}deg)`,
            }}
          />
        )}

        <div
          className="absolute shadow-2xl"
          style={{
            top: `${cfg.core.top}%`, left: `${cfg.core.left}%`,
            width: `${cfg.core.width}%`, height: `${cfg.core.height}%`,
            background: `linear-gradient(to top right, ${cfg.core.colors[0]}, ${cfg.core.colors[1]}, ${cfg.core.colors[2]})`,
            borderRadius: `${cfg.core.radius}px`,
            boxShadow: `0 20px 60px ${cfg.core.shadow}`,
            transform: `rotate(${cfg.core.rotate}deg) skewX(${cfg.core.skew}deg)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-white/15 to-transparent" style={{ borderRadius: `${cfg.core.radius}px` }} />
          <div
            className="absolute top-0 bottom-0 right-0 bg-black/15"
            style={{
              left: `${cfg.core.splitAt}%`,
              borderTopRightRadius: `${cfg.core.radius}px`,
              borderBottomRightRadius: `${cfg.core.radius}px`,
            }}
          />
          <div className="absolute top-0 bottom-0 w-[1px] bg-white/20" style={{ left: `${cfg.core.splitAt}%` }} />
        </div>

        <div
          className="absolute shadow-2xl"
          style={{
            bottom: `${cfg.accent.bottom}%`, right: `${cfg.accent.right}%`,
            width: `${cfg.accent.width}%`, height: `${cfg.accent.height}%`,
            background: `linear-gradient(to bottom right, ${cfg.accent.colors[0]}, ${cfg.accent.colors[1]}, ${cfg.accent.colors[2]})`,
            borderRadius: `${cfg.accent.radius}px`,
            boxShadow: `0 30px 70px ${cfg.accent.shadow}`,
            transform: `rotate(${cfg.accent.rotate}deg)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-white/15" style={{ borderRadius: `${cfg.accent.radius}px` }} />
          <div className="absolute inset-[1px] border-t border-l border-white/45" style={{ borderRadius: `${Math.max(cfg.accent.radius - 1, 0)}px` }} />
        </div>

        {cfg.structural && (
          <div
            className="absolute"
            style={{
              top: `${cfg.structural.top}%`, right: `${cfg.structural.right}%`,
              width: `${cfg.structural.width}%`, height: `${cfg.structural.height}%`,
              backgroundColor: cfg.structural.color,
              borderRadius: `${cfg.structural.radius}px`,
              filter: "blur(8px)",
              transform: `rotate(${cfg.structural.rotate}deg)`,
            }}
          />
        )}

        <div
          className="absolute overflow-hidden"
          style={{
            top: `${cfg.glassMajor.top}%`, left: `${cfg.glassMajor.left}%`,
            width: `${cfg.glassMajor.width}%`, height: `${cfg.glassMajor.height}%`,
            borderRadius: `${cfg.glassMajor.radius}px`,
            borderTop: "1.5px solid rgba(255,255,255,0.5)",
            borderLeft: "1.5px solid rgba(255,255,255,0.5)",
            borderRight: "0.5px solid rgba(255,255,255,0.15)",
            borderBottom: "0.5px solid rgba(255,255,255,0.15)",
            boxShadow: "0 50px 110px rgba(15,23,42,0.15)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(239,246,255,0.05) 100%)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/5" />
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-b from-white/35 via-white/10 to-transparent"
            style={{ left: `${cfg.glassMajor.foldV}%`, width: "1px" }}
          />
          <div
            className="absolute left-0 right-0 bg-gradient-to-r from-white/35 via-white/10 to-transparent"
            style={{ top: `${cfg.glassMajor.foldH}%`, height: "1px" }}
          />
          <div
            className="absolute -inset-y-1/2 w-full rotate-45 transform bg-gradient-to-r from-blue-200/35 to-orange-100/15"
            style={{ left: `${cfg.glassMajor.reflectionAt}%` }}
          />
        </div>

        {cfg.glassMinor && (
          <div
            className="absolute overflow-hidden"
            style={{
              bottom: `${cfg.glassMinor.bottom}%`, left: `${cfg.glassMinor.left}%`,
              width: `${cfg.glassMinor.width}%`, height: `${cfg.glassMinor.height}%`,
              borderRadius: `${cfg.glassMinor.radius}px`,
              borderTop: "1px solid rgba(255,255,255,0.55)",
              borderLeft: "1px solid rgba(255,255,255,0.55)",
              borderRight: "1px solid rgba(255,255,255,0.1)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 35px 90px rgba(0,0,0,0.18)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              background: "linear-gradient(120deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/10 via-transparent to-white/20" />
            <div className="absolute -inset-full rotate-12 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-30" />
          </div>
        )}

        {cfg.frameLines.map((f, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${f.top}%`, right: `${f.right}%`,
              width: `${f.width}%`, height: `${f.height}%`,
              borderRight: "3px solid rgba(253,186,116,0.3)",
              borderTop: "1.5px solid rgba(253,186,116,0.3)",
              borderTopRightRadius: "55px",
              transform: `rotate(${f.rotate}deg)`,
            }}
          />
        ))}

        {cfg.specular.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white mix-blend-screen"
            style={{
              top: `${s.top}%`, left: `${s.left}%`,
              width: `${s.size}px`, height: `${s.size}px`,
              boxShadow: "0 0 12px rgba(255,255,255,0.9)",
            }}
          />
        ))}

        <div className="absolute inset-0 pointer-events-none rounded-2xl md:rounded-3xl border border-white/20 ring-1 ring-inset ring-white/15" />
      </div>
    </div>
  );
}
"use client";

import { getPreviewImage } from "@/lib/link-preview-code";

interface LivePreviewImageProps {
  liveUrl: string;
  enabled: boolean;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
  disabledLabel?: string;
}

const DEFAULT_FALLBACK =
  "https://placehold.co/1440x900/e7e5e4/a8a29e?text=No+Preview";

export function LivePreviewImage({
  liveUrl,
  enabled,
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  loading = "lazy",
  disabledLabel = "preview not enabled",
}: LivePreviewImageProps) {
  if (!enabled) {
    return (
      <div className="relative h-auto w-full overflow-hidden bg-stone-100">
                            {/* Main Artwork Card */}
        <div className="relative aspect-[16/10] overflow-hidden">
          
          {/* SVG Noise Grain Texture Overlay */}
          <div className="absolute inset-0 z-40 pointer-events-none mix-blend-overlay opacity-[0.05]">
            <svg width="100%" height="100%">
              <filter id="static-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" />
                <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#static-noise)" />
            </svg>
          </div>

          {/* Core Ambient Gradient Base (Aurora Contrast) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5F8FC] via-[#EBF3FC] to-[#DEEAF7]" />

          {/* Volumetric Spotlights and Glows */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-color-burn opacity-70"
            style={{
              background: 'radial-gradient(circle at 60% 45%, rgba(191, 219, 254, 0.6) 0%, transparent 60%)'
            }}
          />

          <div 
            className="absolute -inset-10 pointer-events-none mix-blend-overlay opacity-40"
            style={{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.4) 0%, transparent 60%, rgba(15, 23, 42, 0.1) 100%)'
            }}
          />

          {/* Layer 1: Ambient Cool Blue Base Prism (bg-blue-600/30) */}
          <div className="absolute top-[8%] left-[6%] w-[38%] h-[64%] rounded-tr-[90px] rounded-bl-[50px] bg-blue-600/30 blur-[45px] mix-blend-multiply transform rotate-[-12deg]" />

          {/* Layer 2: Main Solid Architectural Warm Core Block (primaryCore) */}
          <div className="absolute top-[23%] left-[18%] w-[46%] h-[56%] bg-gradient-to-tr from-[#3B82F6] via-[#1D4ED8] to-[#1E3A8A] rounded-[36px] shadow-[0_20px_60px_rgba(29,78,216,0.15)] transform rotate-[14deg] skewX(-4deg)">
            {/* Split Lighting Plane */}
            <div className="absolute inset-0 bg-gradient-to-l from-white/15 to-transparent rounded-[36px]" />
            <div className="absolute top-0 right-0 bottom-0 left-1/2 bg-black/15 rounded-r-[36px]" />
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20" />
          </div>

          {/* Layer 3: Warm Champagne Gold Accent Shape (accentGold) */}
          <div className="absolute bottom-[13%] right-[13%] w-[40%] h-[44%] bg-gradient-to-br from-[#FDBA74] via-[#F97316] to-[#EA580C] rounded-[28px] shadow-[0_30px_70px_rgba(234,88,12,0.22)] transform rotate-[-8deg]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-white/15 rounded-[28px]" />
            {/* Specular Highlight Borders */}
            <div className="absolute inset-[1px] border-t border-l border-white/45 rounded-[27px]" />
          </div>

          {/* Layer 4: Structural Deep Dark Blur backing */}
          <div className="absolute top-[18%] right-[22%] w-[32%] h-[48%] bg-blue-950/20 rounded-[44px] blur-lg transform rotate-[6deg]" />

          {/* Layer 5: Large Premium Frosted Glass Panel (champagneGlass Gradient / Glassmorphism) */}
          <div 
            className="absolute top-[10%] left-[38%] w-[50%] h-[78%] rounded-[54px] border-t-[1.5px] border-l-[1.5px] border-white/50 border-r-[0.5px] border-b-[0.5px] border-white/15 shadow-[0_50px_110px_rgba(15,23,42,0.15)] overflow-hidden"
            style={{
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(239, 246, 255, 0.05) 100%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/5" />
            
            {/* Micro Structural Folds */}
            <div className="absolute top-0 bottom-0 left-[38%] w-[1px] bg-gradient-to-b from-white/35 via-white/10 to-transparent" />
            <div className="absolute top-[32%] left-0 right-0 h-[1px] bg-gradient-to-r from-white/35 via-white/10 to-transparent" />
            
            {/* Reflection sweep (lightReflection) */}
            <div className="absolute -inset-y-1/2 left-[15%] w-full bg-gradient-to-r from-blue-200/35 to-orange-100/15 rotate-45 transform" />
          </div>

          {/* Layer 6: Overlapping Low-Bezel Glass Plate */}
          <div 
            className="absolute bottom-[6%] left-[10%] w-[42%] h-[37%] rounded-[36px] border-t border-l border-white/55 border-r border-b border-white/10 shadow-[0_35px_90px_rgba(0,0,0,0.18)] overflow-hidden"
            style={{
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              background: 'linear-gradient(120deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/10 via-transparent to-white/20" />
            <div className="absolute -inset-full bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-30 rotate-12" />
          </div>

          {/* Layer 7: Fine Linear Geometry (Golden Frame Lines) */}
          <div className="absolute top-[6%] right-[8%] w-[14%] h-[68%] border-r-[3px] border-t-[1.5px] border-orange-300/30 rounded-tr-[55px] transform rotate-[20deg]" />

          {/* Layer 8: Specular Glass Light Reflections */}
          <div className="absolute top-[28%] left-[43%] w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] mix-blend-screen" />
          <div className="absolute bottom-[42%] right-[30%] w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.7)] mix-blend-screen" />

          {/* Premium Inner Matte Border */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl md:rounded-3xl border border-white/20 ring-1 ring-inset ring-white/15" />

        </div>
      </div>
    );
  }

  // Microlink screenshot URL — only used when this project is enabled in DB prefs.
  // Previously: src={getPreviewImage(project.liveUrl)}
  const src = getPreviewImage(liveUrl);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
}

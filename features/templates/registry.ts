import { MinimalTemplate } from "./minimal/minimal-template";
import { ModernTemplate } from "./modern/modern-template";
import DeveloperTemplate from "./developer/developer-template";
import CreativeTemplate from "./creative/creative-template";
import { CorporateTemplate } from "./corporate/corporate-template";
import { SpotlightTemplate } from "./spotlight/spotlight-template";
import { RetroTemplate } from "./retro/retro-template";
import { BentoTemplate } from "./bento/bento-template";
import { VibrantTemplate } from "./vibrant/vibrant-template";
import { SpaceTemplate } from "./space/space-template";
import { WindowsTemplate } from "./windows/windows-template";
import { PaperTemplate } from "./paper/paper-template";
import { CyberpunkTemplate } from "./cyberpunk/cyberpunk-template";
import { PastelTemplate } from "./pastel/pastel-template";
import { MonochromeTemplate } from "./monochrome/monochrome-template";
import { SynthwaveTemplate } from "./synthwave/synthwave-template";
import { ArtDecoTemplate } from "./artdeco/artdeco-template";
import { BlueprintTemplate } from "./blueprint/blueprint-template";
import { AiryTemplate } from "./airy/airy-template";
import { TerracottaTemplate } from "./terracotta/terracotta-template";
import { CitrusTemplate } from "./citrus/citrus-template";
import { ParchmentTemplate } from "./parchment/parchment-template";
import type { TemplateComponent } from "./types";

export const templateRegistry: Record<string, TemplateComponent> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description:
      "Editorial, quiet, and typography-led for a refined personal brand",
    previewImage: "/templates/minimal-preview.png",
    category: "general",
    component: MinimalTemplate,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description:
      "Dark premium presentation with glass cards and product-style composition",
    previewImage: "/templates/modern-preview.png",
    category: "general",
    component: ModernTemplate,
  },
  developer: {
    id: "developer",
    name: "Developer",
    description:
      "Terminal-inspired but polished for engineers who want proof and personality",
    previewImage: "/templates/developer-preview.png",
    category: "developer",
    component: DeveloperTemplate,
  },
  creative: {
    id: "creative",
    name: "Creative",
    description:
      "Expressive gallery-style layout built for visual work and standout projects",
    previewImage: "/templates/creative-preview.png",
    category: "designer",
    component: CreativeTemplate,
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    description:
      "Executive, structured, and clean without feeling like a PDF export",
    previewImage: "/templates/corporate-preview.png",
    category: "corporate",
    component: CorporateTemplate,
  },
  spotlight: {
    id: "spotlight",
    name: "Spotlight",
    description:
      "Mint canvas (#fbfffe), Made Tommy type, and yellow-accent interactions.",
    previewImage: "/templates/modern-preview.png",
    category: "developer",
    component: SpotlightTemplate,
  },
  retro: {
    id: "retro",
    name: "Retro",
    description:
      "Bold neo-brutalism with thick borders, bright colors, and high contrast.",
    previewImage: "/templates/creative-preview.png",
    category: "designer",
    component: RetroTemplate,
  },
  bento: {
    id: "bento",
    name: "Bento",
    description:
      "Modern grid-based layout with a clean, premium, and highly scannable design.",
    previewImage: "/templates/minimal-preview.png",
    category: "general",
    component: BentoTemplate,
  },
  vibrant: {
    id: "vibrant",
    name: "Vibrant",
    description:
      "Dark mode with glowing gradients, glassmorphism, and a highly modern feel.",
    previewImage: "/templates/modern-preview.png",
    category: "designer",
    component: VibrantTemplate,
  },
  space: {
    id: "space",
    name: "Space",
    description:
      "Deep space theme with glowing cyan and violet accents, perfect for futuristic portfolios.",
    previewImage: "/templates/modern-preview.png",
    category: "developer",
    component: SpaceTemplate,
  },
  windows: {
    id: "windows",
    name: "Windows 95",
    description:
      "Nostalgic retro OS theme with classic window borders, teal backgrounds, and pixel-perfect details.",
    previewImage: "/templates/developer-preview.png",
    category: "developer",
    component: WindowsTemplate,
  },
  paper: {
    id: "paper",
    name: "Paper",
    description:
      "Elegant, editorial newspaper style with serif typography and clean lines.",
    previewImage: "/templates/minimal-preview.png",
    category: "general",
    component: PaperTemplate,
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    description:
      "High-contrast neon hacker aesthetic with glitch effects and terminal vibes.",
    previewImage: "/templates/developer-preview.png",
    category: "developer",
    component: CyberpunkTemplate,
  },
  pastel: {
    id: "pastel",
    name: "Pastel Dream",
    description:
      "Soft, bubbly, and dreamy with pastel gradients and rounded shapes.",
    previewImage: "/templates/creative-preview.png",
    category: "designer",
    component: PastelTemplate,
  },
  monochrome: {
    id: "monochrome",
    name: "Monochrome",
    description:
      "Strict black and white brutalist design with massive typography.",
    previewImage: "/templates/minimal-preview.png",
    category: "designer",
    component: MonochromeTemplate,
  },
  synthwave: {
    id: "synthwave",
    name: "Synthwave",
    description:
      "80s retro-futuristic look with neon sunsets and perspective grids.",
    previewImage: "/templates/creative-preview.png",
    category: "developer",
    component: SynthwaveTemplate,
  },
  artdeco: {
    id: "artdeco",
    name: "Art Deco",
    description:
      "Luxury 1920s style with deep navy, gold accents, and geometric borders.",
    previewImage: "/templates/minimal-preview.png",
    category: "designer",
    component: ArtDecoTemplate,
  },
  blueprint: {
    id: "blueprint",
    name: "Blueprint",
    description:
      "Technical drawing aesthetic with blueprint blue, grids, and monospace.",
    previewImage: "/templates/developer-preview.png",
    category: "developer",
    component: BlueprintTemplate,
  },
  airy: {
    id: "airy",
    name: "Airy",
    description: "Cloud-like, clean, soft shadows and sky blue accents.",
    previewImage: "/templates/minimal-preview.png",
    category: "general",
    component: AiryTemplate,
  },
  terracotta: {
    id: "terracotta",
    name: "Terracotta",
    description: "Warm Mediterranean style with elegant serif fonts.",
    previewImage: "/templates/creative-preview.png",
    category: "designer",
    component: TerracottaTemplate,
  },
  citrus: {
    id: "citrus",
    name: "Citrus",
    description: "Energetic and fresh with vibrant orange and yellow accents.",
    previewImage: "/templates/creative-preview.png",
    category: "designer",
    component: CitrusTemplate,
  },
  parchment: {
    id: "parchment",
    name: "Parchment",
    description: "Academic, historical layout with classic red accents.",
    previewImage: "/templates/corporate-preview.png",
    category: "corporate",
    component: ParchmentTemplate,
  },
};

export function getTemplate(id: string): TemplateComponent {
  return templateRegistry[id] ?? templateRegistry["minimal"];
}

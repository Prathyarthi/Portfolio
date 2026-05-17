import { MinimalTemplate } from "./minimal/minimal-template";
import { ModernTemplate } from "./modern/modern-template";
import DeveloperTemplate from "./developer/developer-template";
import CreativeTemplate from "./creative/creative-template";
import { CorporateTemplate } from "./corporate/corporate-template";
import { SpotlightTemplate } from "./spotlight/spotlight-template";
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
};

export function getTemplate(id: string): TemplateComponent {
  return templateRegistry[id] ?? templateRegistry["minimal"];
}

import { MinimalTemplate } from "./minimal/minimal-template";
import { ModernTemplate } from "./modern/modern-template";
import DeveloperTemplate from "./developer/developer-template";
import CreativeTemplate from "./creative/creative-template";
import { CorporateTemplate } from "./corporate/corporate-template";
import type { TemplateComponent } from "./types";

export const templateRegistry: Record<string, TemplateComponent> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean, whitespace-focused design with elegant typography",
    previewImage: "/templates/minimal-preview.png",
    category: "general",
    component: MinimalTemplate,
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Bold gradients, cards, and contemporary layout",
    previewImage: "/templates/modern-preview.png",
    category: "general",
    component: ModernTemplate,
  },
  developer: {
    id: "developer",
    name: "Developer",
    description:
      "Terminal-inspired with code blocks and monospace fonts",
    previewImage: "/templates/developer-preview.png",
    category: "developer",
    component: DeveloperTemplate,
  },
  creative: {
    id: "creative",
    name: "Creative",
    description:
      "Asymmetric layouts, vivid colors, and portfolio-gallery focus",
    previewImage: "/templates/creative-preview.png",
    category: "designer",
    component: CreativeTemplate,
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    description:
      "Professional, structured layout optimized for recruiters",
    previewImage: "/templates/corporate-preview.png",
    category: "corporate",
    component: CorporateTemplate,
  },
};

export function getTemplate(id: string): TemplateComponent {
  return templateRegistry[id] ?? templateRegistry["minimal"];
}

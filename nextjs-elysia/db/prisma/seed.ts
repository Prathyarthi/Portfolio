import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import path from "path";

config({ path: path.join(__dirname, '..', '..', '.env') });

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const templates = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, whitespace-focused design with elegant typography",
    previewUrl: "/templates/minimal-preview.png",
    category: "general",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold gradients, cards, and contemporary layout",
    previewUrl: "/templates/modern-preview.png",
    category: "general",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Terminal-inspired with code blocks and monospace fonts",
    previewUrl: "/templates/developer-preview.png",
    category: "developer",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Asymmetric layouts, vivid colors, and portfolio-gallery focus",
    previewUrl: "/templates/creative-preview.png",
    category: "designer",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional, structured layout optimized for recruiters",
    previewUrl: "/templates/corporate-preview.png",
    category: "corporate",
  },
];

async function main() {
  console.log("Seeding templates...");

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
  }

  console.log(`Seeded ${templates.length} templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

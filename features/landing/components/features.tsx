import {
  BrainCircuit,
  Palette,
  Globe,
  Code2,
  Sparkles,
  Zap,
} from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: GithubIcon,
    title: "GitHub Import",
    description:
      "Automatically fetch your repositories, contributions, and profile details from GitHub.",
  },
  {
    icon: Code2,
    title: "LeetCode Proof",
    description:
      "Show your problem-solving depth with live LeetCode stats instead of a generic skills section.",
  },
  {
    icon: BrainCircuit,
    title: "Smart Onboarding",
    description:
      "Use a resume only as raw input. Foliofy restructures your experience for a stronger public portfolio.",
  },
  {
    icon: Palette,
    title: "Template System",
    description:
      "Switch between Minimal, Modern, Developer, Creative, and Corporate layouts without rewriting content.",
  },
  {
    icon: Globe,
    title: "Public Presence",
    description:
      "Publish to a shareable portfolio URL that feels intentional, polished, and easy to send around.",
  },
  {
    icon: Zap,
    title: "Fast Publish Loop",
    description:
      "Edit, preview, switch templates, and go live quickly when your story is ready.",
  },
  {
    icon: Sparkles,
    title: "Story-First Editing",
    description:
      "Shape projects, experience, and links into a narrative recruiters can scan in minutes.",
  },
  {
    icon: Palette,
    title: "Visual Personality",
    description:
      "Pick a visual tone that matches your work style, from clean and corporate to bold and developer-first.",
  },
  {
    icon: Globe,
    title: "Built To Be Seen",
    description:
      "Everything is designed for a public landing page, not a document export hidden in downloads.",
  },
  {
    icon: Zap,
    title: "One Workspace",
    description:
      "Imports, editing, previewing, and publishing all happen in one app-like workflow.",
  },
  {
    icon: BrainCircuit,
    title: "AI Where It Helps",
    description:
      "Use AI for cleanup and acceleration without letting it turn your portfolio into generic filler.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            Why Foliofy
          </p>
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">
            A better interface for <span className="gradient-text">building presence</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            The flow is designed around curation and public presentation. Import
            whatever helps, edit what matters, preview the result, and publish
            with confidence.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glass-card rounded-[1.75rem] border-white/8 bg-white/3 transition-transform duration-200 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/4">
                  <feature.icon className="h-5 w-5 text-zinc-200" />
                </div>
                <CardTitle className="text-xl text-zinc-100">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

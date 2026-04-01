import {
  FileText,
  Palette,
  Globe,
  Code2,
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
    title: "LeetCode Stats",
    description:
      "Showcase your problem-solving skills with live LeetCode statistics and rankings.",
  },
  {
    icon: FileText,
    title: "AI Resume Parsing",
    description:
      "Upload your resume and let Gemini AI extract your experience, skills, and education.",
  },
  {
    icon: Palette,
    title: "5+ Templates",
    description:
      "Choose from Minimal, Modern, Developer, Creative, and Corporate templates.",
  },
  {
    icon: Globe,
    title: "Public Link",
    description:
      "Get a shareable link instantly. Send it to recruiters with one click.",
  },
  {
    icon: Zap,
    title: "Instant Deploy",
    description:
      "No build step needed. Your portfolio is live the moment you hit publish.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From data import to deployment, we handle it all so you can focus on
            what matters.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

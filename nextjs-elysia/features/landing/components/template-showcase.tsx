import { Card, CardContent } from "@/components/ui/card";

const templates = [
  { name: "Minimal", emoji: "🎯", description: "Clean and elegant" },
  { name: "Modern", emoji: "🎨", description: "Bold and colorful" },
  { name: "Developer", emoji: "💻", description: "Terminal-inspired" },
  { name: "Creative", emoji: "🌈", description: "Artistic and vivid" },
  { name: "Corporate", emoji: "💼", description: "Professional and polished" },
];

export function TemplateShowcase() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Beautiful Templates
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a template that matches your style. Switch anytime.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {templates.map((t) => (
            <Card
              key={t.name}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardContent className="pt-8 pb-6">
                <div className="text-5xl mb-4">{t.emoji}</div>
                <h3 className="font-semibold text-lg mb-1">{t.name}</h3>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

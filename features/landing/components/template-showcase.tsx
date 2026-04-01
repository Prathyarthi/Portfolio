import { Card, CardContent } from "@/components/ui/card";

const templates = [
  {
    name: "Minimal",
    accent: "from-zinc-200/40 to-white/5",
    description: "Whitespace-heavy and calm for clean personal branding.",
  },
  {
    name: "Modern",
    accent: "from-violet-400/30 to-cyan-300/20",
    description: "Bold contrast, richer cards, and a contemporary product feel.",
  },
  {
    name: "Developer",
    accent: "from-emerald-400/25 to-cyan-300/10",
    description: "Monospace-forward presentation for technical credibility.",
  },
  {
    name: "Creative",
    accent: "from-pink-400/30 to-orange-300/20",
    description: "More expressive layout for designers and multidisciplinary work.",
  },
  {
    name: "Corporate",
    accent: "from-sky-400/20 to-zinc-200/10",
    description: "Structured, recruiter-friendly layout with professional tone.",
  },
];

export function TemplateShowcase() {
  return (
    <section id="showcase" className="px-4 py-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
            Template Showcase
          </p>
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">
            Pick a style that fits your <span className="gradient-text">public identity</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Every template is built for the same content model, so switching feels
            like changing your visual system rather than rebuilding your site.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {templates.map((t) => (
            <Card
              key={t.name}
              className="glass-card overflow-hidden rounded-[1.75rem] border-white/8 bg-white/3 transition-transform duration-200 hover:-translate-y-1"
            >
              <CardContent className="p-4">
                <div
                  className={`mb-4 rounded-[1.25rem] border border-white/8 bg-gradient-to-br ${t.accent} p-4`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-300">
                      {t.name}
                    </span>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-400">
                      Live
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-2/3 rounded-full bg-white/35" />
                    <div className="h-2 w-full rounded-full bg-white/18" />
                    <div className="h-2 w-5/6 rounded-full bg-white/18" />
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="h-12 rounded-xl border border-white/10 bg-black/15" />
                      <div className="h-12 rounded-xl border border-white/10 bg-black/10" />
                      <div className="h-12 rounded-xl border border-white/10 bg-black/10" />
                    </div>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-zinc-100">
                  {t.name}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {t.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

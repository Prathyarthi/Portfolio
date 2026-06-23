import { Star } from "lucide-react";

const COMPANIES = ["Google", "Spotify", "Notion", "Stripe", "Figma"];

export function SocialProof() {
  return (
    <section
      aria-label="Social proof"
      className="border-y border-border-default bg-surface-raised"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-6 py-6 text-center md:flex-row md:justify-between md:gap-8 md:text-left">
        <p className="text-body-sm text-text-muted">
          Trusted by{" "}
          <span className="font-medium text-text-secondary">
            10,000+ job seekers
          </span>
          <span className="mx-2 text-border-strong" aria-hidden>
            &middot;
          </span>
          <span className="inline-flex items-center gap-1 align-middle">
            <Star
              className="h-3.5 w-3.5 fill-warning text-warning"
              aria-hidden
            />
            <span className="font-medium text-text-secondary">4.9 rating</span>
          </span>
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {COMPANIES.map((name) => (
            <li
              key={name}
              className="font-display text-body-sm font-medium text-text-muted opacity-70 grayscale transition-opacity hover:opacity-100"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

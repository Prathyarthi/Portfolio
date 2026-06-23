import Link from "next/link";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/icons";
import { siteConfig } from "@/lib/site";

const NAV = {
  Product: [
    { label: "How it works", href: "#features" },
    { label: "Examples", href: "#showcase" },
    { label: "Pricing", href: "#pricing" },
  ],
  Account: [
    { label: "Sign in", href: "/sign-in" },
    { label: "Sign up free", href: "/sign-up" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    { label: "Resume import", href: "/sign-up" },
    { label: "All templates", href: "/sign-up" },
    { label: "Full pricing", href: "/pricing" },
  ],
};

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund-policy", label: "Refunds" },
  { href: "/contact", label: "Contact" },
] as const;

const SOCIAL = [
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
  { label: "Twitter", href: "https://twitter.com", icon: TwitterIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
];

export function Footer() {
  return (
    <footer
      className="px-6 py-[var(--space-8)]"
      style={{ background: "var(--color-footer-bg)" }}
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label={`${siteConfig.name} home`}>
              <span className="font-display text-[20px] font-bold text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-3 max-w-[260px] text-body-sm text-white/60">
              {siteConfig.tagline}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(NAV).map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <p className="text-label uppercase text-white/40">{title}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-body-sm text-white/60 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-body-sm text-white/40">
            &copy; {new Date().getFullYear()} {siteConfig.legalEntity}. All rights
            reserved.
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
            aria-label="Legal"
          >
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-sm text-white/40 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

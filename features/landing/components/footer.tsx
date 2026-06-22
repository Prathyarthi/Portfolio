import Link from "next/link";
import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact / Support" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/6 px-4 py-10 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <div className="text-center">
          <div className="gradient-text text-lg font-bold">{siteConfig.name}</div>
          <p className="mt-1 text-sm text-zinc-500">{siteConfig.tagline}</p>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-500"
          aria-label="Footer"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} {siteConfig.legalEntity}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

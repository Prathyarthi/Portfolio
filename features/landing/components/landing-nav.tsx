"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "How it works", href: "#features" },
  { label: "Integrations", href: "#integrations" },
  { label: "Templates", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label={`${siteConfig.name} home`}>
      <span className="font-display text-[20px] font-bold tracking-[-0.01em] text-brand-primary">
        {siteConfig.name}
      </span>
    </Link>
  );
}

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass-nav sticky top-0 z-[100]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Logo />

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-[var(--radius-md)] px-3 py-2 text-[14px] font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild className="hidden h-9 px-4 sm:inline-flex" variant="accent">
            <Link href="/sign-up">Get started — it&apos;s free</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-border-default glass transition-[max-height] duration-200 ease-[var(--ease-out)] md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4" aria-label="Mobile navigation">
          {LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] font-medium text-text-secondary hover:bg-surface-raised hover:text-text-primary"
            >
              {label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Button variant="outline" asChild className="w-full">
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
            <Button asChild className="w-full" variant="accent">
              <Link href="/sign-up" onClick={() => setOpen(false)}>
                Get started — it&apos;s free
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

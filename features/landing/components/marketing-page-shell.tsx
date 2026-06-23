import Link from "next/link";
import { siteConfig } from "@/lib/site";

interface MarketingPageShellProps {
  children: React.ReactNode;
}

export function MarketingPageShell({ children }: MarketingPageShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#080b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="gradient-text text-xl font-bold tracking-wide">
              {siteConfig.name}
            </span>
            <span className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              Beta
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pricing"
              className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-teal-500 px-4 py-1.5 text-sm font-medium text-teal-950 transition-colors hover:bg-teal-400"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="px-4 py-14 md:py-20">{children}</main>
    </div>
  );
}

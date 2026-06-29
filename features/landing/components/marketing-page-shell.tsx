import { LandingNav } from "@/features/landing/components/landing-nav";

interface MarketingPageShellProps {
  children: React.ReactNode;
}

export function MarketingPageShell({ children }: MarketingPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface-base">
      <div className="glass-ambient" aria-hidden />
      <div className="relative z-[1]">
        <LandingNav />
        <main className="px-4 py-14 sm:px-6 md:py-20">{children}</main>
      </div>
    </div>
  );
}

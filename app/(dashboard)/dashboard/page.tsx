"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil } from "lucide-react";
import { usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { CreatePortfolioPrompt } from "@/features/portfolio/components/create-portfolio-prompt";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { cn } from "@/lib/utils";
import { landingSurfaceInteractiveLg } from "@/features/landing/surface";
import { getPortfolioPublicUrl } from "@/lib/domain";

const secondaryLinks = [
  { href: "/dashboard/preview", label: "Preview" },
  { href: "/dashboard/templates", label: "Templates" },
  { href: "/dashboard/import", label: "Import" },
] as const;

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-lg space-y-10 py-2 md:py-6">
      <header className="space-y-1 text-center md:text-left">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
          Overview
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 md:text-3xl">
          Hi, {firstName}
        </h1>
        <p className="text-sm text-zinc-500">
          {portfolio
            ? "Pick up where you left off—edits save as you go."
            : "Create a portfolio to unlock the editor and preview."}
        </p>
      </header>

      <div
        className={cn(
          landingSurfaceInteractiveLg,
          "p-6 md:p-8",
          "shadow-[0_24px_80px_-48px_rgba(0,0,0,0.85)]"
        )}
      >
        {!portfolio && !isLoading ? (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
              Create your portfolio to unlock the editor, imports, and preview.
            </p>
            <CreatePortfolioPrompt
              onCreated={() => router.push("/dashboard/edit")}
              buttonClassName="rounded-full px-8"
            />
          </div>
        ) : isLoading ? (
          <div className="py-10 text-center text-sm text-zinc-500">Loading…</div>
        ) : portfolio ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-5">
              <div className="min-w-0 space-y-1">
                {portfolio.isPublished && portfolio.slug ? (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                      Your link
                    </p>
                    <p className="truncate font-mono text-sm text-zinc-300">
                      {getPortfolioPublicUrl(portfolio.slug)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                      Status
                    </p>
                    <p className="text-sm text-zinc-400">
                      Choose your subdomain when you publish.
                    </p>
                  </>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  portfolio.isPublished
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/90"
                    : "border-white/10 bg-white/[0.04] text-zinc-500"
                )}
              >
                {portfolio.isPublished ? "Live" : "Draft"}
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="w-full rounded-full sm:w-auto sm:min-w-[11rem]" asChild>
                <Link href="/dashboard/edit">
                  <Pencil className="mr-2 h-4 w-4" />
                  Open editor
                </Link>
              </Button>
              {portfolio.isPublished && portfolio.slug ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-white/10 bg-transparent sm:w-auto"
                  asChild
                >
                  <Link
                    href={getPortfolioPublicUrl(portfolio.slug)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View live site
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-white/10 bg-transparent sm:w-auto"
                  asChild
                >
                  <Link href="/dashboard/preview">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview
                  </Link>
                </Button>
              )}
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-5 text-sm sm:justify-start">
              {secondaryLinks.map((item, i) => (
                <span key={item.href} className="flex items-center gap-x-4">
                  {i > 0 ? (
                    <span className="hidden text-zinc-700 sm:inline" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link
                    href={item.href}
                    className="text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
                  >
                    {item.label}
                  </Link>
                </span>
              ))}
              <span className="hidden text-zinc-700 sm:inline" aria-hidden>
                ·
              </span>
              <Link
                href="/dashboard/settings"
                className="text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
              >
                Settings
              </Link>
            </nav>
          </div>
        ) : null}
      </div>

      <FlowFooter
        message="Edits autosave. Use preview before you publish."
        next={{ href: "/dashboard/edit", label: "Go to editor" }}
      />
    </div>
  );
}

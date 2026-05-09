"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionFlow } from "./subscription-flow";
import { landingSurfaceMuted } from "@/features/landing/surface";
import { cn } from "@/lib/utils";

export function PricingPageShell() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#080b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="gradient-text text-xl font-bold tracking-wide">
              Foliofy
            </span>
            <span className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
              Beta
            </span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {session?.user ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="rounded-full text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full px-5">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="min-h-[calc(100vh-4rem)] px-4 py-14 md:py-20">
        <div className="mx-auto flex max-w-4xl flex-col gap-12">
          <header className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              Pricing
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
              Two simple plans
            </h1>
            <p className="text-sm leading-relaxed text-zinc-500 md:text-base">
              Start with a one-month free trial of all core workflows. After
              that, stay on free essentials or upgrade to Pro for premium
              templates and resume import.
            </p>
          </header>

          <SubscriptionFlow />

          <Card className={cn(landingSurfaceMuted, "md:rounded-3xl")}>
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="max-w-xl">
                <h2 className="text-lg font-semibold text-zinc-100">
                  Why only two plans?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Starter gives you one free month with full workflow access, then
                  keeps core publishing on Minimal. Pro is for job-search seasons
                  when you want premium templates, resume import, and faster
                  support. We will keep the lineup this simple until usage tells us
                  we need more.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="shrink-0 rounded-full border-white/10 text-zinc-300 hover:bg-white/5"
              >
                <Link href={session?.user ? "/dashboard" : "/sign-up"}>
                  {session?.user ? "Go to dashboard" : "Start free"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

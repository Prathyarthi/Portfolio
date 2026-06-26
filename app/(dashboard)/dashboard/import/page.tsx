"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { ImportSourceContent } from "@/features/portfolio/components/import-source-content";
import {
  ImportSourcePicker,
  ImportSourceSelector,
} from "@/features/portfolio/components/import-source-selector";
import {
  IMPORT_SOURCES,
  type ImportSourceValue,
} from "@/features/portfolio/constants/import-sources";

export default function ImportPage() {
  const router = useRouter();
  const { data: portfolio } = usePortfolio();
  const [canUseImports, setCanUseImports] = useState(true);
  const [activeSource, setActiveSource] = useState<ImportSourceValue>("resume");

  const currentSource = useMemo(
    () => IMPORT_SOURCES.find((source) => source.value === activeSource)!,
    [activeSource]
  );

  useEffect(() => {
    let cancelled = false;
    const loadAccess = async () => {
      try {
        const res = await fetch("/api/billing/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as {
          access?: { canUseImports?: boolean };
        };
        if (cancelled) return;
        setCanUseImports(data.access?.canUseImports ?? true);
      } catch {
        if (cancelled) return;
        setCanUseImports(true);
      }
    };
    loadAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col lg:h-[calc(100svh-4rem-3rem)] lg:max-h-[calc(100svh-4rem-3rem)] lg:overflow-hidden">
      <div className="shrink-0 space-y-6">
        <div>
          <h1 className="text-h2 text-text-primary">Import data</h1>
          <p className="mt-1 max-w-2xl text-body-sm text-text-secondary">
            Choose a platform on the right, then import into your portfolio one
            source at a time.
          </p>
        </div>

        {!canUseImports && (
          <div className="max-w-3xl rounded-[var(--radius-lg)] border border-border-default bg-warning-bg p-4 text-body-sm">
            <p className="font-medium text-text-primary">
              Imports are available during your free month and with Pro.
            </p>
            <p className="mt-2 text-text-secondary">
              After the trial, you can still edit and publish on the Minimal
              template — upgrade to import from resume, GitHub, Medium, or LeetCode
              again.
            </p>
            <Button asChild className="mt-4" variant="secondary">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid min-h-0 w-full flex-1 grid-cols-1 pt-6 lg:grid-cols-[1fr_auto] lg:gap-12 lg:overflow-hidden xl:gap-20">
        <div className="min-h-0 overflow-y-auto overscroll-contain pb-6 pr-1">
          <div className="mx-auto w-full max-w-3xl">
          <ImportSourcePicker
            activeSource={activeSource}
            onSourceChange={setActiveSource}
            disabled={!canUseImports}
          />

          <div className="mb-6">
            <p className="eyebrow hidden lg:block">Selected source</p>
            <h2 className="mt-1 text-h3 text-text-primary">
              {currentSource.label}
            </h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              {currentSource.description}
            </p>
          </div>

          <ImportSourceContent
            source={activeSource}
            canUseImports={canUseImports}
          />

          <FlowFooter
            message={null}
            previous={{
              href: "/dashboard/templates",
              label: "Previous: Templates",
            }}
            next={{
              label: "Next: Preview",
              onClick: () => router.push("/dashboard/preview"),
            }}
          />
          </div>
        </div>

        <aside className="hidden shrink-0 self-start lg:block lg:w-56 lg:pr-2 xl:w-64 xl:pr-4">
          <ImportSourceSelector
            activeSource={activeSource}
            onSourceChange={setActiveSource}
            portfolio={portfolio}
            disabled={!canUseImports}
          />
        </aside>
      </div>
    </div>
  );
}

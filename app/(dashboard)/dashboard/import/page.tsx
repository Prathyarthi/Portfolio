"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import {
  DASHBOARD_CONTENT_FRAME_CLASS,
  DASHBOARD_CONTENT_INNER_CLASS,
  DASHBOARD_MAIN_COLUMN_CLASS,
  DASHBOARD_TRACKER_ASIDE_CLASS,
} from "@/features/dashboard/constants/panel-layout";
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
          Choose a platform on the left, then import into your portfolio one
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

      <div className="flex min-h-0 w-full flex-1 flex-col pt-6 lg:flex-row lg:gap-0 lg:overflow-hidden">
        <aside className={DASHBOARD_TRACKER_ASIDE_CLASS}>
          <ImportSourceSelector
            activeSource={activeSource}
            onSourceChange={setActiveSource}
            portfolio={portfolio}
            disabled={!canUseImports}
          />
        </aside>

        <div className={DASHBOARD_MAIN_COLUMN_CLASS}>
          <ImportSourcePicker
            activeSource={activeSource}
            onSourceChange={setActiveSource}
            disabled={!canUseImports}
          />

          <div className="shrink-0">
            <p className="eyebrow hidden lg:block">Selected source</p>
            <h2 className="mt-1 text-h3 text-text-primary">
              {currentSource.label}
            </h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              {currentSource.description}
            </p>
          </div>

          <div className={DASHBOARD_CONTENT_FRAME_CLASS}>
            <div className={DASHBOARD_CONTENT_INNER_CLASS}>
              <ImportSourceContent
                source={activeSource}
                canUseImports={canUseImports}
              />
            </div>
          </div>

          <div className="shrink-0 pb-2">
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
      </div>
    </div>
  );
}

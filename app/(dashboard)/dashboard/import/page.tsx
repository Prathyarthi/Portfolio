"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ResumeUploader } from "@/features/resume/components/resume-uploader";
import { GitHubImporter } from "@/features/profile/components/github-importer";
import { LeetCodeImporter } from "@/features/profile/components/leetcode-importer";
import { MediumImporter } from "@/features/profile/components/medium-importer";
import { FileText, Trophy, BookOpen } from "lucide-react";
import { GithubIcon as Github } from "@/components/icons";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";

export default function ImportPage() {
  const router = useRouter();
  const [canUseImports, setCanUseImports] = useState(true);
  const [activeTab, setActiveTab] = useState("resume");

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
        const allowed = data.access?.canUseImports ?? true;
        setCanUseImports(allowed);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-text-primary">Import data</h1>
        <p className="mt-1 text-body-sm text-text-secondary">
          Import your professional data from various sources to quickly build
          your portfolio.
        </p>
      </div>

      {!canUseImports && (
        <div className="rounded-[var(--radius-lg)] border border-border-default bg-warning-bg p-4 text-body-sm">
          <p className="font-medium text-text-primary">
            Imports are available during your free month and with Pro.
          </p>
          <p className="mt-2 text-text-secondary">
            After the trial, you can still edit and publish on the Minimal
            template—upgrade to import from resume, GitHub, Medium, or LeetCode again.
          </p>
          <Button asChild className="mt-4" variant="secondary">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger
            value="resume"
            className="flex items-center gap-2"
            disabled={!canUseImports}
          >
            <FileText className="h-4 w-4" />
            Resume
          </TabsTrigger>
          <TabsTrigger
            value="github"
            className="flex items-center gap-2"
            disabled={!canUseImports}
          >
            <Github className="h-4 w-4" />
            GitHub
          </TabsTrigger>
          <TabsTrigger
            value="medium"
            className="flex items-center gap-2"
            disabled={!canUseImports}
          >
            <BookOpen className="h-4 w-4" />
            Medium
          </TabsTrigger>
          <TabsTrigger
            value="leetcode"
            className="flex items-center gap-2"
            disabled={!canUseImports}
          >
            <Trophy className="h-4 w-4" />
            LeetCode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-6">
          {canUseImports ? (
            <ResumeUploader />
          ) : (
            <p className="text-sm text-muted-foreground">
              Resume PDF import is locked. Upgrade to Pro to use AI resume
              parsing.
            </p>
          )}
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          {canUseImports ? (
            <GitHubImporter />
          ) : (
            <p className="text-sm text-muted-foreground">
              GitHub import is locked. Upgrade to Pro to fetch and import
              repositories.
            </p>
          )}
        </TabsContent>

        <TabsContent value="medium" className="mt-6">
          {canUseImports ? (
            <MediumImporter />
          ) : (
            <p className="text-sm text-muted-foreground">
              Medium import is locked. Upgrade to Pro to fetch and import
              articles.
            </p>
          )}
        </TabsContent>

        <TabsContent value="leetcode" className="mt-6">
          {canUseImports ? (
            <LeetCodeImporter />
          ) : (
            <p className="text-sm text-muted-foreground">
              LeetCode import is locked. Upgrade to Pro to sync your stats.
            </p>
          )}
        </TabsContent>
      </Tabs>

      <FlowFooter
        previous={{ href: "/dashboard/templates", label: "Previous: Templates" }}
        next={{ label: "Next: Preview", onClick: () => router.push("/dashboard/preview") }}
      />
    </div>
  );
}

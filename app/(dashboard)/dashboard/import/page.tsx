"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeUploader } from "@/features/resume/components/resume-uploader";
import { GitHubImporter } from "@/features/profile/components/github-importer";
import { LeetCodeImporter } from "@/features/profile/components/leetcode-importer";
import { FileText, Trophy } from "lucide-react";
import { GithubIcon as Github } from "@/components/icons";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";

export default function ImportPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Data</h1>
        <p className="text-muted-foreground mt-1">
          Import your professional data from various sources to quickly build
          your portfolio.
        </p>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resume
          </TabsTrigger>
          <TabsTrigger value="github" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="leetcode" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            LeetCode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-6">
          <ResumeUploader />
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <GitHubImporter />
        </TabsContent>

        <TabsContent value="leetcode" className="mt-6">
          <LeetCodeImporter />
        </TabsContent>
      </Tabs>

      <FlowFooter
        previous={{ href: "/dashboard/templates", label: "Previous: Templates" }}
        next={{ label: "Next: Preview", onClick: () => router.push("/dashboard/preview") }}
      />
    </div>
  );
}

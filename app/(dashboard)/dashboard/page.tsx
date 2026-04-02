"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Palette, Download, Eye, ExternalLink, Plus } from "lucide-react";
import { useCreatePortfolio, usePortfolio } from "@/features/portfolio/api/use-portfolio";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import { toast } from "sonner";

const quickActions = [
  {
    title: "Edit Portfolio",
    description: "Add or update your experience, projects, and skills",
    href: "/dashboard/edit",
    icon: Pencil,
  },
  {
    title: "Choose Template",
    description: "Select from 5 beautiful portfolio templates",
    href: "/dashboard/templates",
    icon: Palette,
  },
  {
    title: "Import Data",
    description: "Import from GitHub, LeetCode, or upload your resume",
    href: "/dashboard/import",
    icon: Download,
  },
  {
    title: "Preview",
    description: "See how your portfolio looks before publishing",
    href: "/dashboard/preview",
    icon: Eye,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: portfolio, isLoading } = usePortfolio();
  const createPortfolio = useCreatePortfolio();

  async function handleCreatePortfolio() {
    try {
      await createPortfolio.mutateAsync();
      toast.success("Portfolio created");
      router.push("/dashboard/edit");
    } catch {
      toast.error("Failed to create portfolio");
    }
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-[2rem] border border-white/8 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-bold">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Manage your content, choose your presentation style, and publish a
          public portfolio that feels deliberate.
        </p>
      </div>

      <Card className="glass-card rounded-[2rem] border-white/8 bg-white/3">
        <CardHeader>
          <CardTitle className="text-zinc-100">
            {portfolio ? "Continue your portfolio" : "Create your portfolio"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {portfolio
              ? "Your portfolio is ready. Continue with the next section or jump back into editing."
              : "Start a new portfolio so you can edit content, choose a template, and publish it."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {portfolio ? (
            <Button asChild>
              <Link href="/dashboard/edit">
                <Pencil className="mr-2 h-4 w-4" />
                Continue Editing
              </Link>
            </Button>
          ) : (
            <Button onClick={handleCreatePortfolio} disabled={createPortfolio.isPending || isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              {createPortfolio.isPending ? "Creating..." : "Create Portfolio"}
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/edit">
              <ExternalLink className="mr-2 h-4 w-4" />
              Go to Edit
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="glass-card h-full rounded-[1.5rem] border-white/8 bg-white/3 transition-transform hover:-translate-y-1 hover:bg-white/5">
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/4">
                  <action.icon className="h-5 w-5 text-zinc-100" />
                </div>
                <CardTitle className="text-lg text-zinc-100">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="glass-card rounded-[2rem] border-white/8 bg-white/3">
        <CardHeader>
          <CardTitle className="text-zinc-100">Your Portfolio</CardTitle>
          <CardDescription className="text-zinc-400">
            Your portfolio is not published yet. Complete your profile and publish it to get a shareable link.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/edit">
              <Pencil className="mr-2 h-4 w-4" />
              Start Editing
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/preview">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        </CardContent>
      </Card>

      <FlowFooter
        next={{ href: "/dashboard/edit", label: "Next: Edit Portfolio" }}
      />
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Palette, Download, Eye, ExternalLink } from "lucide-react";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Build and manage your portfolio from here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="pb-3">
                <action.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{action.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
          <CardDescription>
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
    </div>
  );
}

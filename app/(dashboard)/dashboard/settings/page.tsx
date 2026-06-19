"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FlowFooter } from "@/features/dashboard/components/flow-footer";
import {
  usePortfolio,
  useUpdatePortfolio,
} from "@/features/portfolio/api/use-portfolio";
import { CreatePortfolioPrompt } from "@/features/portfolio/components/create-portfolio-prompt";
import type { PortfolioCustomization, TemplateSectionId } from "@/features/templates/types";

const defaultNavbarSettings: {
  enabled: boolean;
  sections: Record<TemplateSectionId, boolean>;
} = {
  enabled: true,
  sections: {
    about: true,
    work: true,
    experience: true,
    profiles: true,
  },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: portfolio } = usePortfolio();
  const updatePortfolio = useUpdatePortfolio();
  const [navbarSettings, setNavbarSettings] = useState(defaultNavbarSettings);

  useEffect(() => {
    const customization =
      portfolio?.customization &&
        typeof portfolio.customization === "object" &&
        !Array.isArray(portfolio.customization)
        ? (portfolio.customization as PortfolioCustomization)
        : {};

    const navbar = customization.navbar;

    setNavbarSettings({
      enabled: navbar?.enabled !== false,
      sections: {
        about: navbar?.sections?.about !== false,
        work: navbar?.sections?.work !== false,
        experience: navbar?.sections?.experience !== false,
        profiles: navbar?.sections?.profiles !== false,
      },
    });
  }, [portfolio?.customization]);

  const handleNavbarSave = () => {
    updatePortfolio.mutate(
      {
        customization: {
          navbar: {
            enabled: navbarSettings.enabled,
            sections: navbarSettings.sections,
          },
        },
      },
      {
        onSuccess: () => toast.success("Navbar preferences updated"),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="space-y-8 max-w-2xl pb-6 mx-auto w-full h-screen">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and portfolio settings.</p>
      </div>

      {!portfolio && (
        <Card className="glass-card rounded-[2rem] border-white/8 bg-white/3">
          <CardHeader>
            <CardTitle className="text-zinc-100">Create your portfolio first</CardTitle>
            <CardDescription className="text-zinc-400">
              Settings are available after a portfolio has been created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CreatePortfolioPrompt />
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Overview</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={session?.user?.name ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={session?.user?.email ?? ""} disabled />
          </div>
        </CardContent>
      </Card>

      {portfolio ? (
        <Card>
        <CardHeader>
          <CardTitle>Portfolio Navbar</CardTitle>
          <CardDescription>
            Control whether the public portfolio shows section navigation and
            which anchors are available, with up to 4 visible nav items.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="navbar-enabled">Show navbar</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, visitors can jump to visible sections on the page.
              </p>
            </div>
            <Switch
              id="navbar-enabled"
              checked={navbarSettings.enabled}
              onCheckedChange={(checked) =>
                setNavbarSettings((current) => ({ ...current, enabled: checked }))
              }
            />
          </div>

          <div className="space-y-3">
            <Label>Sections</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["about", "About"],
                  ["work", "Work"],
                  ["experience", "Experience"],
                  ["profiles", "Profiles"],
                ] as const
              ).map(([key, label]) => {
                const active = navbarSettings.sections[key];

                return (
                  <Button
                    key={key}
                    type="button"
                    variant={active ? "default" : "outline"}
                    disabled={!navbarSettings.enabled}
                    onClick={() =>
                      setNavbarSettings((current) => ({
                        ...current,
                        sections: {
                          ...current.sections,
                          [key]: !current.sections[key],
                        },
                      }))
                    }
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              Sections still only appear when the portfolio actually has data for
              them.
            </p>
          </div>

          <Button onClick={handleNavbarSave} disabled={updatePortfolio.isPending}>
            {updatePortfolio.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Navbar Preferences"
            )}
          </Button>
        </CardContent>
      </Card>
      ) : null}

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <FlowFooter
        previous={{ href: "/dashboard/preview", label: "Previous: Preview" }}
        next={{ href: "/dashboard", label: "Finish: Overview" }}
      />
    </div>
  );
}

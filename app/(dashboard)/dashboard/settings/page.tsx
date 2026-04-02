"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  usePortfolio,
  useUpdatePortfolio,
  useUpdateSlug,
} from "@/features/portfolio/api/use-portfolio";
import type { PortfolioCustomization, TemplateSectionId } from "@/features/templates/types";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

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
  const updateSlug = useUpdateSlug();

  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [navbarSettings, setNavbarSettings] = useState(defaultNavbarSettings);

  useEffect(() => {
    if (portfolio?.slug) setSlug(portfolio.slug);
  }, [portfolio?.slug]);

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

  const checkSlug = async (value: string) => {
    if (!value || value === portfolio?.slug) {
      setSlugAvailable(null);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch("/api/portfolio/slug/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: value }),
      });
      const data = await res.json();
      setSlugAvailable(data.available);
    } catch {
      setSlugAvailable(null);
    }
    setChecking(false);
  };

  const handleSlugSave = () => {
    updateSlug.mutate(slug, {
      onSuccess: () => toast.success("Slug updated"),
      onError: (e) => toast.error(e.message),
    });
  };

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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and portfolio settings.
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Portfolio URL</CardTitle>
          <CardDescription>
            Your portfolio will be available at{" "}
            <span className="font-mono text-foreground">
              {typeof window !== "undefined" ? window.location.origin : ""}/p/{slug || "your-slug"}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={slug}
                  onChange={(e) => {
                    const val = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "");
                    setSlug(val);
                    checkSlug(val);
                  }}
                  placeholder="your-portfolio-slug"
                />
                {checking && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!checking && slugAvailable === true && (
                  <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                )}
                {!checking && slugAvailable === false && (
                  <X className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
                )}
              </div>
              <Button
                onClick={handleSlugSave}
                disabled={
                  updateSlug.isPending ||
                  slug === portfolio?.slug ||
                  slugAvailable === false
                }
              >
                {updateSlug.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

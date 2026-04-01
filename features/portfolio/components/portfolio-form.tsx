"use client";

import { useState, useEffect } from "react";
import {
  usePortfolio,
  useUpdatePortfolio,
  useUpdateSlug,
} from "@/features/portfolio/api/use-portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, Globe, Mail, Phone, MapPin, Link2 } from "lucide-react";

export function PortfolioForm() {
  const { data: portfolio, isLoading } = usePortfolio();
  const updatePortfolio = useUpdatePortfolio();
  const updateSlug = useUpdateSlug();

  const [form, setForm] = useState({
    title: "",
    headline: "",
    summary: "",
    contactEmail: "",
    phone: "",
    location: "",
    websiteUrl: "",
  });

  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (portfolio) {
      setForm({
        title: portfolio.title ?? "",
        headline: portfolio.headline ?? "",
        summary: portfolio.summary ?? "",
        contactEmail: portfolio.contactEmail ?? "",
        phone: portfolio.phone ?? "",
        location: portfolio.location ?? "",
        websiteUrl: portfolio.websiteUrl ?? "",
      });
      setSlug(portfolio.slug ?? "");
    }
  }, [portfolio]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    try {
      await updatePortfolio.mutateAsync({
        title: form.title,
        headline: form.headline || null,
        summary: form.summary || null,
        contactEmail: form.contactEmail || null,
        phone: form.phone || null,
        location: form.location || null,
        websiteUrl: form.websiteUrl || null,
      });
      toast.success("Portfolio updated successfully");
    } catch {
      toast.error("Failed to update portfolio");
    }
  }

  async function handleSlugSave() {
    if (!slug.trim()) {
      toast.error("Slug cannot be empty");
      return;
    }
    const sanitized = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    try {
      await updateSlug.mutateAsync(sanitized);
      setSlug(sanitized);
      toast.success("URL slug updated");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update slug");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* URL Slug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Portfolio URL
          </CardTitle>
          <CardDescription>
            Choose a custom URL for your public portfolio page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="slug">Slug</Label>
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {typeof window !== "undefined" ? window.location.origin : ""}/p/
                </span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="your-name"
                  className="max-w-xs"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleSlugSave}
              disabled={updateSlug.isPending}
            >
              {updateSlug.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update URL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Your name, headline, and a short summary about yourself.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Full Name / Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="Full-Stack Developer | Open Source Enthusiast"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="Write a brief summary about yourself, your experience, and what you're passionate about..."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            How potential employers or collaborators can reach you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                Website
              </Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://your-website.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updatePortfolio.isPending}>
          {updatePortfolio.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

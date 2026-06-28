"use client";

import { useState, useEffect, useMemo } from "react";
import {
  usePortfolio,
  useUpdatePortfolio,
} from "@/features/portfolio/api/use-portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/features/portfolio/components/field-label";
import { FormField } from "@/features/portfolio/components/form-field";
import { FormSection } from "@/features/portfolio/components/form-section";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, Mail, Phone, MapPin, Link2 } from "lucide-react";
import {
  EDIT_FORM_GRID_CLASS,
  EDIT_FORM_STACK_CLASS,
} from "@/features/dashboard/constants/form-layout";
import { EditFormActions } from "@/features/portfolio/components/edit-form-actions";
import { useEditStepDirty } from "@/features/portfolio/context/edit-dirty-context";
import { fieldsDiffer, fieldDiffers } from "@/features/portfolio/lib/edit-step-dirty";

export function PortfolioForm() {
  const { data: portfolio, isLoading } = usePortfolio();
  const updatePortfolio = useUpdatePortfolio();

  const [form, setForm] = useState({
    title: "",
    headline: "",
    summary: "",
    contactEmail: "",
    phone: "",
    location: "",
    websiteUrl: "",
  });

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
    }
  }, [portfolio]);

  const isDirty = useMemo(() => {
    if (!portfolio) return false;
    return fieldsDiffer(
      form,
      {
        title: portfolio.title,
        headline: portfolio.headline,
        summary: portfolio.summary,
        contactEmail: portfolio.contactEmail,
        phone: portfolio.phone,
        location: portfolio.location,
        websiteUrl: portfolio.websiteUrl,
      },
      [
        "title",
        "headline",
        "summary",
        "contactEmail",
        "phone",
        "location",
        "websiteUrl",
      ]
    );
  }, [form, portfolio]);

  useEditStepDirty("basic", isDirty, "portfolio-form");

  const savedFields = useMemo(
    () => ({
      title: portfolio?.title ?? "",
      headline: portfolio?.headline ?? "",
      summary: portfolio?.summary ?? "",
      contactEmail: portfolio?.contactEmail ?? "",
      phone: portfolio?.phone ?? "",
      location: portfolio?.location ?? "",
      websiteUrl: portfolio?.websiteUrl ?? "",
    }),
    [portfolio]
  );

  const isFieldUnsaved = (key: keyof typeof form) =>
    portfolio ? fieldDiffers(form[key], savedFields[key]) : false;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={EDIT_FORM_STACK_CLASS}>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <FormSection
            title="Basic Information"
            description="Your name, headline, and a short summary about yourself."
          >
            <FormField>
              <FieldLabel htmlFor="title" unsaved={isFieldUnsaved("title")}>
                Full Name / Title
              </FieldLabel>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </FormField>
            <FormField>
              <FieldLabel htmlFor="headline" unsaved={isFieldUnsaved("headline")}>
                Headline
              </FieldLabel>
              <Input
                id="headline"
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="Full-Stack Developer | Open Source Enthusiast"
              />
            </FormField>
            <FormField>
              <FieldLabel htmlFor="summary" unsaved={isFieldUnsaved("summary")}>
                Summary
              </FieldLabel>
              <Textarea
                id="summary"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="Write a brief summary about yourself, your experience, and what you're passionate about..."
                rows={5}
              />
            </FormField>
          </FormSection>

          <Separator />

          <FormSection
            title="Contact Information"
            description="How potential employers or collaborators can reach you."
          >
            <div className={EDIT_FORM_GRID_CLASS}>
              <FormField>
                <FieldLabel
                  htmlFor="contactEmail"
                  unsaved={isFieldUnsaved("contactEmail")}
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </FieldLabel>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </FormField>
              <FormField>
                <FieldLabel htmlFor="phone" unsaved={isFieldUnsaved("phone")}>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone
                </FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </FormField>
            </div>

            <Separator />

            <div className={EDIT_FORM_GRID_CLASS}>
              <FormField>
                <FieldLabel htmlFor="location" unsaved={isFieldUnsaved("location")}>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </FieldLabel>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                />
              </FormField>
              <FormField>
                <FieldLabel
                  htmlFor="websiteUrl"
                  unsaved={isFieldUnsaved("websiteUrl")}
                >
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  Website
                </FieldLabel>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={form.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://your-website.com"
                />
              </FormField>
            </div>
          </FormSection>
        </CardContent>
      </Card>

      <EditFormActions>
        <Button onClick={handleSave} disabled={updatePortfolio.isPending || !isDirty}>
          {updatePortfolio.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </EditFormActions>
    </div>
  );
}

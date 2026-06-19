"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParseResume } from "@/features/resume/api/use-resume";
import {
  useClearImportableContent,
  useCreatePortfolio,
  usePortfolio,
  useUpdatePortfolio,
} from "@/features/portfolio/api/use-portfolio";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Award,
  Trophy,
  Check,
  Trash2,
  Layers,
} from "lucide-react";
import type { ParsedResume, ParsedCustomSection } from "@/lib/gemini";
import { normalizeUrl } from "@/lib/url-utils";
import {
  LivePreviewSelectionDialog,
  type LivePreviewCandidate,
} from "@/features/resume/components/live-preview-selection-dialog";

async function assertApiOk(res: Response, context: string) {
  if (res.ok) return;
  let message = res.statusText;
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && body !== null && "error" in body) {
      const err = (body as { error?: unknown }).error;
      if (typeof err === "string") message = err;
    }
  } catch {
    /* ignore non-JSON error bodies */
  }
  throw new Error(`${context}: ${message} (${res.status})`);
}

export function ResumeUploader() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [importing, setImporting] = useState(false);
  const [clearBeforeImport, setClearBeforeImport] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );

  const parseResume = useParseResume();
  const { data: portfolio } = usePortfolio();
  const createPortfolio = useCreatePortfolio();
  const updatePortfolio = useUpdatePortfolio();
  const clearImportable = useClearImportableContent();

  useEffect(() => {
    let cancelled = false;
    const loadBilling = async () => {
      try {
        const res = await fetch("/api/billing/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as {
          subscription?: { status?: string | null } | null;
        };
        if (cancelled) return;
        const status = data.subscription?.status ?? null;
        setSubscriptionStatus(
          status?.toLowerCase() === "active" ? "active" : "none"
        );
      } catch {
        if (cancelled) return;
        setSubscriptionStatus("none");
      }
    };
    loadBilling();
    return () => {
      cancelled = true;
    };
  }, []);

  const livePreviewCandidates = useMemo<LivePreviewCandidate[]>(() => {
    return (
      portfolio?.projects
        ?.filter((project: { liveUrl?: string | null }) => project.liveUrl)
        .map((project: { id: string; title: string; liveUrl: string }) => ({
          id: project.id,
          title: project.title,
          liveUrl: project.liveUrl,
        })) ?? []
    );
  }, [portfolio?.projects]);

  const selectedLivePreviewProjectIds = useMemo(
    () =>
      Array.isArray(portfolio?.livePreviewProjectIds)
        ? portfolio.livePreviewProjectIds
        : [],
    [portfolio?.livePreviewProjectIds]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      parseResume.mutate(file, {
        onSuccess: (data) => {
          console.log("========== RESUME PARSE SUCCESS ==========");
          console.log("Full parsed data:", JSON.stringify(data, null, 2));
          console.log("Experiences found:", data.experiences.length);
          console.log("Education found:", data.education.length);
          console.log("Skills found:", data.skills.length);
          console.log("Projects found:", data.projects.length);
          console.log("Achievements found:", data.achievements.length);
          console.log("Certifications found:", data.certifications.length);
          console.log("Custom sections found:", data.customSections?.length ?? 0);
          console.log("==========================================");
          setParsedData(data);
          toast.success("Resume parsed successfully");
        },
        onError: (error) => {
          console.error("Resume parse error:", error);
          toast.error(error.message);
        },
      });
    },
    [parseResume]
  );

  const handleImport = async () => {
    if (!parsedData) return;
    setImporting(true);

    let activePortfolio = portfolio;

    if (!activePortfolio) {
      try {
        activePortfolio = await createPortfolio.mutateAsync();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create portfolio",
        );
        setImporting(false);
        return;
      }
    }

    try {
      await updatePortfolio.mutateAsync({
        title: parsedData.name,
        headline: parsedData.headline,
        summary: parsedData.summary,
        contactEmail: parsedData.contact?.email ?? null,
        phone: parsedData.contact?.phone ?? null,
        websiteUrl: normalizeUrl(parsedData.contact?.websiteUrl),
        location: parsedData.contact?.location ?? null,
      });

      if (clearBeforeImport) {
        await clearImportable.mutateAsync();
      }

      // Import experiences
      console.log("========== STARTING IMPORT ==========");
      console.log("About to import", parsedData.experiences.length, "experiences");
      for (let i = 0; i < parsedData.experiences.length; i++) {
        const exp = parsedData.experiences[i];
        console.log(`Importing experience ${i + 1}/${parsedData.experiences.length}:`, exp);
        const res = await fetch("/api/portfolio/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(exp),
        });
        await assertApiOk(res, "Experience");
        console.log(`✓ Experience ${i + 1} imported successfully`);
      }
      console.log("✅ All experiences imported");

      // Import education
      for (const edu of parsedData.education) {
        const res = await fetch("/api/portfolio/education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(edu),
        });
        await assertApiOk(res, "Education");
      }

      // Import skills (bulk)
      if (parsedData.skills.length > 0) {
        const res = await fetch("/api/portfolio/skill/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills: parsedData.skills }),
        });
        await assertApiOk(res, "Skills");
      }

      // Import projects
      for (const project of parsedData.projects) {
        const res = await fetch("/api/portfolio/project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: project.title,
            description: project.description || "",
            techStack: project.techStack ?? [],
            liveUrl: normalizeUrl(project.liveUrl),
            sourceUrl: normalizeUrl(project.sourceUrl),
          }),
        });
        await assertApiOk(res, "Project");
      }

      // Import certifications
      for (const cert of parsedData.certifications) {
        const res = await fetch("/api/portfolio/certification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cert,
            url: normalizeUrl(cert.url),
          }),
        });
        await assertApiOk(res, "Certification");
      }

      // Import social profiles
      if (parsedData.socialProfiles && parsedData.socialProfiles.length > 0) {
        for (const social of parsedData.socialProfiles) {
          if (!social.url && !social.username) continue;
          const res = await fetch("/api/portfolio/social", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platform: social.platform || "unknown",
              url: normalizeUrl(social.url ?? social.username ?? ""),
              username: social.username ?? null,
            }),
          });
          await assertApiOk(res, "Social profile");
        }
      }

      // Import achievements
      console.log("About to import", parsedData.achievements.length, "achievements");
      for (let i = 0; i < parsedData.achievements.length; i++) {
        const achievement = parsedData.achievements[i];
        console.log(`Importing achievement ${i + 1}:`, achievement);
        const res = await fetch("/api/portfolio/achievement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: achievement }),
        });
        await assertApiOk(res, "Achievement");
        console.log(`✓ Achievement ${i + 1} imported successfully`);
      }
      console.log("✅ All achievements imported");

      // Import custom sections
      if (parsedData.customSections && parsedData.customSections.length > 0) {
        console.log("About to import", parsedData.customSections.length, "custom sections");
        for (const section of parsedData.customSections) {
          const res = await fetch("/api/portfolio/custom-section", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionType: section.sectionType,
              label: section.label,
              items: section.items,
            }),
          });
          await assertApiOk(res, "Custom Section");
        }
        console.log("✅ All custom sections imported");
      }

      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      const refreshedPortfolio = await queryClient.fetchQuery({
        queryKey: ["portfolio"],
        queryFn: async () => {
          const res = await fetch("/api/portfolio", { cache: "no-store" });
          if (res.status === 404) return null;
          if (!res.ok) throw new Error("Failed to fetch portfolio");
          return res.json();
        },
      });

      toast.success("Resume data imported to your portfolio");

      const importedLiveProjects =
        refreshedPortfolio?.projects?.some(
          (project: { liveUrl?: string | null }) => project.liveUrl
        ) ?? false;

      if (importedLiveProjects) {
        setPreviewDialogOpen(true);
      }

      setParsedData(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to import data");
    } finally {
      setImporting(false);
    }
  };

  const handleClearNow = async () => {
    try {
      await clearImportable.mutateAsync();
      toast.success(
        "Removed experiences, education, skills, projects, certifications, and achievements."
      );
      setClearDialogOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to clear");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload your resume as a PDF and we will extract your information
            using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-10 cursor-pointer hover:border-muted-foreground/50 transition-colors"
          >
            {parseResume.isPending ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Parsing your resume...
                </p>
              </>
            ) : (
              <>
                <FileText className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Click to upload your resume
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF files only, up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            aria-label="Upload resume PDF"
            title="Upload resume PDF"
            className="hidden"
            onChange={handleFileChange}
            disabled={parseResume.isPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avoid duplicate imports</CardTitle>
          <CardDescription>
            Re-importing adds new rows on top of what you already have. Clear
            resume-style sections first, or enable replace-before-import when you
            import.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
            <div className="space-y-1 pr-2">
              <Label htmlFor="clear-before-import" className="text-foreground">
                Replace resume sections before import
              </Label>
              <p className="text-sm text-muted-foreground">
                When on, we delete your current experiences, education, skills,
                projects, and certifications immediately before this import runs.
                Your slug, template, social links, and profile fields stay as they
                are.
              </p>
            </div>
            <Switch
              id="clear-before-import"
              checked={clearBeforeImport}
              onCheckedChange={setClearBeforeImport}
              className="shrink-0"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setClearDialogOpen(true)}
            disabled={clearImportable.isPending}
          >
            {clearImportable.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Clear resume sections now
          </Button>
        </CardContent>
      </Card>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Clear resume sections?</DialogTitle>
            <DialogDescription>
              This permanently deletes all experiences, education, skills,
              projects, certifications, and achievements in your portfolio. It does not change
              your name, summary, headline, URL slug, template, or social profiles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearNow}
              disabled={clearImportable.isPending}
            >
              {clearImportable.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LivePreviewSelectionDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        candidates={livePreviewCandidates}
        selectedProjectIds={selectedLivePreviewProjectIds}
        subscriptionStatus={subscriptionStatus}
        onSaved={() => {
          toast.success("Live preview selection saved");
        }}
      />

      {/* Parsed results */}
      {parsedData && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Parsed Data</h3>
              {clearBeforeImport && (
                <p className="text-sm text-muted-foreground">
                  Import will replace existing resume sections first.
                </p>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{parsedData.name}</CardTitle>
              <CardDescription>{parsedData.headline}</CardDescription>
            </CardHeader>
            {parsedData.summary && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {parsedData.summary}
                </p>
              </CardContent>
            )}
          </Card>

          {/* Experiences */}
          {parsedData.experiences.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experiences ({parsedData.experiences.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedData.experiences.map((exp, i) => (
                  <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-sm">{exp.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.company}
                      {exp.location ? ` - ${exp.location}` : ""}
                    </p>
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.startDate || ""}{exp.startDate && exp.endDate ? " - " : ""}{exp.endDate || (exp.startDate ? "Present" : "")}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {parsedData.education.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education ({parsedData.education.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedData.education.map((edu, i) => (
                  <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-sm">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                    </p>
                    {edu.gpa && (
                      <p className="text-xs text-muted-foreground">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {parsedData.skills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills ({parsedData.skills.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {parsedData.projects.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Projects ({parsedData.projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedData.projects.map((project, i) => (
                  <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-sm">{project.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.techStack.map((tech, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {parsedData.achievements.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Achievements ({parsedData.achievements.length})
                </CardTitle>
                <CardDescription>
                  Parsed successfully — ready to import.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {parsedData.achievements.map((achievement, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-muted-foreground/50">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Custom Sections */}
          {parsedData.customSections && parsedData.customSections.length > 0 &&
            parsedData.customSections.map((section, si) => (
              <Card key={si}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    {section.label} ({section.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item, ii) => {
                    const title = item.title ?? item.name ?? item.label;
                    const desc = item.description ?? item.details ?? item.summary;
                    const knownKeys = new Set([
                      "title",
                      "name",
                      "label",
                      "description",
                      "details",
                      "summary",
                    ]);
                    const otherEntries = Object.entries(item).filter(
                      ([k, v]) => !knownKeys.has(k) && v != null && v !== ""
                    );
                    return (
                      <div key={ii} className="border-b last:border-0 pb-3 last:pb-0 space-y-1">
                        {title != null && (
                          <p className="font-medium text-sm">{String(title)}</p>
                        )}
                        {desc != null && (
                          <p className="text-sm text-muted-foreground">
                            {String(desc)}
                          </p>
                        )}
                        {otherEntries.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {otherEntries.map(([k, v]) => (
                              <span
                                key={k}
                                className="text-xs bg-muted px-2 py-0.5 rounded"
                              >
                                <span className="text-muted-foreground">{k}:</span>{" "}
                                {String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

          {/* Certifications */}
          {parsedData.certifications.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications ({parsedData.certifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parsedData.certifications.map((cert, i) => (
                  <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="font-medium text-sm">{cert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={handleImport} disabled={importing} size="lg">
              {importing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Import All to Portfolio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

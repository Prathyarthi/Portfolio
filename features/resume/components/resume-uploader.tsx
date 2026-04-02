"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParseResume } from "@/features/resume/api/use-resume";
import {
  useClearImportableContent,
  useCreatePortfolio,
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
} from "lucide-react";
import type { ParsedResume } from "@/lib/gemini";

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

  const parseResume = useParseResume();
  const createPortfolio = useCreatePortfolio();
  const updatePortfolio = useUpdatePortfolio();
  const clearImportable = useClearImportableContent();

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

    try {
      await createPortfolio.mutateAsync();

      await updatePortfolio.mutateAsync({
        title: parsedData.name,
        headline: parsedData.headline,
        summary: parsedData.summary,
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
            liveUrl: project.liveUrl ?? null,
            sourceUrl: project.sourceUrl ?? null,
          }),
        });
        await assertApiOk(res, "Project");
      }

      // Import certifications
      for (const cert of parsedData.certifications) {
        const res = await fetch("/api/portfolio/certification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cert),
        });
        await assertApiOk(res, "Certification");
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

      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      await queryClient.refetchQueries({ queryKey: ["portfolio"] });

      toast.success("Resume data imported to your portfolio");
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
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Import All to Portfolio
            </Button>
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.startDate || "Date not provided"} - {exp.endDate ?? "Present"}
                    </p>
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
        </div>
      )}
    </div>
  );
}

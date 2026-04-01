"use client";

import { useState } from "react";
import {
  usePortfolio,
  useAddProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/portfolio/api/use-portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  FolderKanban,
  ExternalLink,
  X,
  Check,
  Star,
} from "lucide-react";
import { GithubIcon as Github } from "@/components/icons";

interface ProjectEntry {
  id?: string;
  title: string;
  description: string;
  liveUrl: string;
  sourceUrl: string;
  techStack: string[];
  featured: boolean;
}

const emptyEntry: ProjectEntry = {
  title: "",
  description: "",
  liveUrl: "",
  sourceUrl: "",
  techStack: [],
  featured: false,
};

export function ProjectForm() {
  const { data: portfolio, isLoading } = usePortfolio();
  const addProject = useAddProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ProjectEntry>(emptyEntry);
  const [techInput, setTechInput] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function startEditing(project: any) {
    setEditingId(project.id);
    setIsAdding(false);
    setForm({
      id: project.id,
      title: project.title ?? "",
      description: project.description ?? "",
      liveUrl: project.liveUrl ?? "",
      sourceUrl: project.sourceUrl ?? "",
      techStack: project.techStack ?? [],
      featured: project.featured ?? false,
    });
    setTechInput("");
  }

  function cancelEditing() {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyEntry);
    setTechInput("");
  }

  function addTechTag() {
    const tag = techInput.trim();
    if (!tag) return;
    if (form.techStack.includes(tag)) {
      toast.error("Tech already added");
      return;
    }
    setForm((prev) => ({ ...prev, techStack: [...prev.techStack, tag] }));
    setTechInput("");
  }

  function removeTechTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tag),
    }));
  }

  function handleTechKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechTag();
    }
  }

  async function handleAdd() {
    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Project description is required");
      return;
    }
    try {
      await addProject.mutateAsync({
        title: form.title,
        description: form.description,
        liveUrl: form.liveUrl || null,
        sourceUrl: form.sourceUrl || null,
        techStack: form.techStack,
        featured: form.featured,
      });
      toast.success("Project added");
      cancelEditing();
    } catch {
      toast.error("Failed to add project");
    }
  }

  async function handleUpdate() {
    if (!editingId) return;
    if (!form.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    try {
      await updateProject.mutateAsync({
        id: editingId,
        title: form.title,
        description: form.description,
        liveUrl: form.liveUrl || null,
        sourceUrl: form.sourceUrl || null,
        techStack: form.techStack,
        featured: form.featured,
      });
      toast.success("Project updated");
      cancelEditing();
    } catch {
      toast.error("Failed to update project");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Project deleted");
      if (editingId === id) cancelEditing();
    } catch {
      toast.error("Failed to delete project");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const projects = portfolio?.projects ?? [];
  const isMutating =
    addProject.isPending ||
    updateProject.isPending ||
    deleteProject.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Projects
          </h3>
          <p className="text-sm text-muted-foreground">
            Showcase your best projects with descriptions, tech stack, and links.
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button
            onClick={() => {
              setIsAdding(true);
              setForm(emptyEntry);
              setTechInput("");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">
              {isAdding ? "New Project" : "Edit Project"}
            </CardTitle>
            <CardDescription>
              {isAdding
                ? "Add a project you want to showcase."
                : "Update this project's details."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="proj-title">Title *</Label>
                <Input
                  id="proj-title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="My Awesome Project"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, featured: checked }))
                  }
                />
                <Label
                  htmlFor="featured"
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Star className="h-4 w-4 text-amber-500" />
                  Featured project
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proj-description">Description *</Label>
              <Textarea
                id="proj-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what the project does, the problem it solves, and your role..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="liveUrl" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  Live URL
                </Label>
                <Input
                  id="liveUrl"
                  name="liveUrl"
                  type="url"
                  value={form.liveUrl}
                  onChange={handleChange}
                  placeholder="https://my-project.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceUrl" className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  Source URL
                </Label>
                <Input
                  id="sourceUrl"
                  name="sourceUrl"
                  type="url"
                  value={form.sourceUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/user/project"
                />
              </div>
            </div>

            {/* Tech Stack Tags */}
            <div className="space-y-2">
              <Label>Tech Stack</Label>
              <div className="flex gap-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  placeholder="Type a technology and press Enter..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTechTag}
                  size="default"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="gap-1 py-1 px-2.5"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechTag(tech)}
                        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEditing}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={isAdding ? handleAdd : handleUpdate}
                disabled={isMutating}
              >
                {isMutating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {isAdding ? "Add" : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      {projects.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderKanban className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              No projects added yet. Click &quot;Add Project&quot; to showcase your work.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project: any) => (
            <Card
              key={project.id}
              className={editingId === project.id ? "border-primary/30" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-base">
                        {project.title}
                      </h4>
                      {project.featured && (
                        <Badge
                          variant="default"
                          className="text-xs gap-1"
                        >
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    {(project.liveUrl || project.sourceUrl) && (
                      <div className="flex items-center gap-3 mt-1">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Live
                          </a>
                        )}
                        {project.sourceUrl && (
                          <a
                            href={project.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <Github className="h-3 w-3" />
                            Source
                          </a>
                        )}
                      </div>
                    )}

                    {project.description && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {project.description}
                        </p>
                      </>
                    )}

                    {project.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {project.techStack.map((tech: string) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEditing(project)}
                      disabled={isMutating}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(project.id)}
                      disabled={isMutating}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

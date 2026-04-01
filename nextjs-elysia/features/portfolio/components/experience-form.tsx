"use client";

import { useState } from "react";
import {
  usePortfolio,
  useAddExperience,
  useUpdateExperience,
  useDeleteExperience,
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
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  X,
  Check,
} from "lucide-react";

interface ExperienceEntry {
  id?: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}

const emptyEntry: ExperienceEntry = {
  company: "",
  role: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
};

export function ExperienceForm() {
  const { data: portfolio, isLoading } = usePortfolio();
  const addExperience = useAddExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<ExperienceEntry>(emptyEntry);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function startEditing(exp: any) {
    setEditingId(exp.id);
    setIsAdding(false);
    setForm({
      id: exp.id,
      company: exp.company ?? "",
      role: exp.role ?? "",
      description: exp.description ?? "",
      startDate: exp.startDate ? exp.startDate.substring(0, 10) : "",
      endDate: exp.endDate ? exp.endDate.substring(0, 10) : "",
      location: exp.location ?? "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyEntry);
  }

  async function handleAdd() {
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    if (!form.startDate) {
      toast.error("Start date is required");
      return;
    }
    try {
      await addExperience.mutateAsync({
        company: form.company,
        role: form.role,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate || null,
        location: form.location || null,
      });
      toast.success("Experience added");
      cancelEditing();
    } catch {
      toast.error("Failed to add experience");
    }
  }

  async function handleUpdate() {
    if (!editingId) return;
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    try {
      await updateExperience.mutateAsync({
        id: editingId,
        company: form.company,
        role: form.role,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate || null,
        location: form.location || null,
      });
      toast.success("Experience updated");
      cancelEditing();
    } catch {
      toast.error("Failed to update experience");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteExperience.mutateAsync(id);
      toast.success("Experience deleted");
      if (editingId === id) cancelEditing();
    } catch {
      toast.error("Failed to delete experience");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const experiences = portfolio?.experiences ?? [];
  const isMutating =
    addExperience.isPending ||
    updateExperience.isPending ||
    deleteExperience.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </h3>
          <p className="text-sm text-muted-foreground">
            Add your professional experience, most recent first.
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button
            onClick={() => {
              setIsAdding(true);
              setForm(emptyEntry);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">
              {isAdding ? "New Experience" : "Edit Experience"}
            </CardTitle>
            <CardDescription>
              {isAdding
                ? "Add a new work experience entry."
                : "Update this experience entry."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Company *
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Google"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Role *
                </Label>
                <Input
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="Senior Software Engineer"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  placeholder="Leave blank if current"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location
                </Label>
                <Input
                  id="exp-location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your responsibilities, achievements, and impact..."
                rows={4}
              />
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

      {/* Experience List */}
      {experiences.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              No experience added yet. Click &quot;Add Experience&quot; to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp: any) => (
            <Card
              key={exp.id}
              className={editingId === exp.id ? "border-primary/30" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {exp.company}
                      {exp.location && (
                        <>
                          <span className="mx-1">--</span>
                          <MapPin className="h-3.5 w-3.5" />
                          {exp.location}
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {exp.startDate?.substring(0, 10)}
                      {" -- "}
                      {exp.endDate ? exp.endDate.substring(0, 10) : "Present"}
                    </p>
                    {exp.description && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEditing(exp)}
                      disabled={isMutating}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(exp.id)}
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

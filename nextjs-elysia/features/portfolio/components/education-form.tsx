"use client";

import { useState } from "react";
import {
  usePortfolio,
  useAddEducation,
  useDeleteEducation,
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
  Trash2,
  GraduationCap,
  School,
  BookOpen,
  Calendar,
  X,
  Check,
} from "lucide-react";

interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  description: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

const emptyEntry: EducationEntry = {
  institution: "",
  degree: "",
  field: "",
  description: "",
  startDate: "",
  endDate: "",
  gpa: "",
};

export function EducationForm() {
  const { data: portfolio, isLoading } = usePortfolio();
  const addEducation = useAddEducation();
  const deleteEducation = useDeleteEducation();

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<EducationEntry>(emptyEntry);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function cancelAdding() {
    setIsAdding(false);
    setForm(emptyEntry);
  }

  async function handleAdd() {
    if (!form.institution.trim() || !form.degree.trim()) {
      toast.error("Institution and degree are required");
      return;
    }
    if (!form.startDate) {
      toast.error("Start date is required");
      return;
    }
    try {
      await addEducation.mutateAsync({
        institution: form.institution,
        degree: form.degree,
        field: form.field || null,
        description: form.description || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        gpa: form.gpa || null,
      });
      toast.success("Education added");
      cancelAdding();
    } catch {
      toast.error("Failed to add education");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEducation.mutateAsync(id);
      toast.success("Education deleted");
    } catch {
      toast.error("Failed to delete education");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const educations = portfolio?.educations ?? [];
  const isMutating = addEducation.isPending || deleteEducation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </h3>
          <p className="text-sm text-muted-foreground">
            Add your degrees, certifications, and academic achievements.
          </p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => {
              setIsAdding(true);
              setForm(emptyEntry);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        )}
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">New Education</CardTitle>
            <CardDescription>
              Add a new education entry to your portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="institution" className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  Institution *
                </Label>
                <Input
                  id="institution"
                  name="institution"
                  value={form.institution}
                  onChange={handleChange}
                  placeholder="MIT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Degree *
                </Label>
                <Input
                  id="degree"
                  name="degree"
                  value={form.degree}
                  onChange={handleChange}
                  placeholder="Bachelor of Science"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="field" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  Field of Study
                </Label>
                <Input
                  id="field"
                  name="field"
                  value={form.field}
                  onChange={handleChange}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  name="gpa"
                  value={form.gpa}
                  onChange={handleChange}
                  placeholder="3.9 / 4.0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edu-startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Start Date *
                </Label>
                <Input
                  id="edu-startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu-endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  End Date
                </Label>
                <Input
                  id="edu-endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edu-description">Description</Label>
              <Textarea
                id="edu-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Notable coursework, achievements, activities..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelAdding}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={isMutating}>
                {isMutating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education List */}
      {educations.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              No education added yet. Click &quot;Add Education&quot; to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {educations.map((edu: any) => (
            <Card key={edu.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base">
                      {edu.degree}
                      {edu.field && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          in {edu.field}
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <School className="h-3.5 w-3.5" />
                      {edu.institution}
                      {edu.gpa && (
                        <span className="ml-2 text-xs">GPA: {edu.gpa}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {edu.startDate?.substring(0, 10)}
                      {" -- "}
                      {edu.endDate ? edu.endDate.substring(0, 10) : "Present"}
                    </p>
                    {edu.description && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {edu.description}
                        </p>
                      </>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(edu.id)}
                    disabled={isMutating}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

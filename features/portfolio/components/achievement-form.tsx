"use client";

import { useState } from "react";
import {
  usePortfolio,
  useAddAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
} from "@/features/portfolio/api/use-portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Trophy,
  Calendar,
  X,
  Check,
} from "lucide-react";

interface AchievementEntry {
  id?: string;
  title: string;
  date: string;
}

const emptyEntry: AchievementEntry = {
  title: "",
  date: "",
};

export function AchievementForm() {
  const { data: portfolio, isLoading } = usePortfolio();
  const addAchievement = useAddAchievement();
  const updateAchievement = useUpdateAchievement();
  const deleteAchievement = useDeleteAchievement();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<AchievementEntry>(emptyEntry);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function startEditing(ach: any) {
    setEditingId(ach.id);
    setIsAdding(false);
    setForm({
      id: ach.id,
      title: ach.title ?? "",
      date: ach.date ? ach.date.substring(0, 10) : "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyEntry);
  }

  async function handleAdd() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await addAchievement.mutateAsync({
        title: form.title,
        date: form.date || null,
      });
      toast.success("Achievement added");
      cancelEditing();
    } catch {
      toast.error("Failed to add achievement");
    }
  }

  async function handleUpdate() {
    if (!editingId) return;
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      await updateAchievement.mutateAsync({
        id: editingId,
        title: form.title,
        date: form.date || null,
      });
      toast.success("Achievement updated");
      cancelEditing();
    } catch {
      toast.error("Failed to update achievement");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAchievement.mutateAsync(id);
      toast.success("Achievement deleted");
      if (editingId === id) cancelEditing();
    } catch {
      toast.error("Failed to delete achievement");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const achievements = portfolio?.achievements ?? [];
  const isMutating =
    addAchievement.isPending ||
    updateAchievement.isPending ||
    deleteAchievement.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </h3>
          <p className="text-sm text-muted-foreground">
            Showcase your notable achievements, awards, and recognitions.
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
            Add Achievement
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">
              {isAdding ? "New Achievement" : "Edit Achievement"}
            </CardTitle>
            <CardDescription>
              {isAdding
                ? "Add a new achievement entry."
                : "Update this achievement entry."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Won Best Innovation Award at TechConf 2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date (optional)
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
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

      {achievements.length === 0 && !isAdding ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              No achievements added yet. Click &quot;Add Achievement&quot; to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {achievements.map((ach: any) => (
            <Card
              key={ach.id}
              className={editingId === ach.id ? "border-primary/30" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base">{ach.title}</h4>
                    {ach.date && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {ach.date.substring(0, 10)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEditing(ach)}
                      disabled={isMutating}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(ach.id)}
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

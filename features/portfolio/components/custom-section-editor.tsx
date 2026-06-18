"use client";

import { useState } from "react";
import {
  usePortfolio,
  useUpsertCustomSection,
  useUpdateCustomSection,
  useDeleteCustomSection,
} from "@/features/portfolio/api/use-portfolio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Layers,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ItemField {
  key: string;
  value: string;
}

function toSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function CustomSectionEditor() {
  const { data: portfolio, isLoading } = usePortfolio();
  const upsertSection = useUpsertCustomSection();
  const updateSection = useUpdateCustomSection();
  const deleteSection = useDeleteCustomSection();

  const [addingSectionLabel, setAddingSectionLabel] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Item editing state
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemFields, setItemFields] = useState<ItemField[]>([
    { key: "title", value: "" },
    { key: "description", value: "" },
  ]);

  const isMutating =
    upsertSection.isPending || updateSection.isPending || deleteSection.isPending;

  function toggleExpanded(id: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAddSection() {
    const label = addingSectionLabel.trim();
    if (!label) {
      toast.error("Section name is required");
      return;
    }
    try {
      await upsertSection.mutateAsync({
        sectionType: toSlug(label),
        label,
        items: [],
      });
      toast.success(`"${label}" section created`);
      setAddingSectionLabel("");
      setShowAddSection(false);
    } catch {
      toast.error("Failed to create section");
    }
  }

  async function handleDeleteSection(id: string) {
    try {
      await deleteSection.mutateAsync(id);
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete section");
    }
  }

  function startAddItem(sectionId: string) {
    setEditingSectionId(sectionId);
    setEditingItemIndex(null);
    setIsAddingItem(true);
    setItemFields([
      { key: "title", value: "" },
      { key: "description", value: "" },
    ]);
  }

  function startEditItem(
    sectionId: string,
    index: number,
    item: Record<string, unknown>
  ) {
    setEditingSectionId(sectionId);
    setEditingItemIndex(index);
    setIsAddingItem(false);
    const fields: ItemField[] = Object.entries(item).map(([key, value]) => ({
      key,
      value: value != null ? String(value) : "",
    }));
    if (fields.length === 0) {
      fields.push({ key: "title", value: "" });
    }
    setItemFields(fields);
  }

  function cancelItemEdit() {
    setEditingSectionId(null);
    setEditingItemIndex(null);
    setIsAddingItem(false);
    setItemFields([
      { key: "title", value: "" },
      { key: "description", value: "" },
    ]);
  }

  function addField() {
    setItemFields((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeField(index: number) {
    setItemFields((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFieldKey(index: number, key: string) {
    setItemFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, key } : f))
    );
  }

  function updateFieldValue(index: number, value: string) {
    setItemFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, value } : f))
    );
  }

  async function handleSaveItem(section: any) {
    const validFields = itemFields.filter(
      (f) => f.key.trim() !== "" && f.value.trim() !== ""
    );
    if (validFields.length === 0) {
      toast.error("At least one field is required");
      return;
    }

    const newItem: Record<string, unknown> = {};
    for (const f of validFields) {
      newItem[f.key.trim()] = f.value.trim();
    }

    const currentItems: Record<string, unknown>[] = Array.isArray(section.items)
      ? [...section.items]
      : [];

    if (isAddingItem) {
      currentItems.push(newItem);
    } else if (editingItemIndex !== null) {
      currentItems[editingItemIndex] = newItem;
    }

    try {
      await updateSection.mutateAsync({
        id: section.id,
        items: currentItems,
      });
      toast.success(isAddingItem ? "Item added" : "Item updated");
      cancelItemEdit();
    } catch {
      toast.error("Failed to save item");
    }
  }

  async function handleDeleteItem(section: any, index: number) {
    const currentItems: Record<string, unknown>[] = Array.isArray(section.items)
      ? [...section.items]
      : [];
    currentItems.splice(index, 1);

    try {
      await updateSection.mutateAsync({
        id: section.id,
        items: currentItems,
      });
      toast.success("Item deleted");
      if (editingSectionId === section.id && editingItemIndex === index) {
        cancelItemEdit();
      }
    } catch {
      toast.error("Failed to delete item");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const customSections = portfolio?.customSections ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Custom Sections
          </h3>
          <p className="text-sm text-muted-foreground">
            Add any section to your portfolio — volunteer work, publications,
            languages, or anything else.
          </p>
        </div>
        {!showAddSection && (
          <Button onClick={() => setShowAddSection(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        )}
      </div>

      {showAddSection && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">New Section</CardTitle>
            <CardDescription>
              Give your section a name (e.g. &quot;Volunteer Work&quot;,
              &quot;Publications&quot;, &quot;Languages&quot;).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sectionLabel">Section Name *</Label>
              <Input
                id="sectionLabel"
                value={addingSectionLabel}
                onChange={(e) => setAddingSectionLabel(e.target.value)}
                placeholder="e.g. Volunteer Work"
                onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSection(false);
                  setAddingSectionLabel("");
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleAddSection} disabled={isMutating}>
                {isMutating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {customSections.length === 0 && !showAddSection ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              No custom sections yet. Click &quot;Add Section&quot; to create
              one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {customSections.map((section: any) => {
            const isExpanded = expandedSections.has(section.id);
            const items: Record<string, unknown>[] = Array.isArray(section.items)
              ? section.items
              : [];

            return (
              <Card key={section.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-left"
                      onClick={() => toggleExpanded(section.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <CardTitle className="text-base">
                        {section.label}{" "}
                        <span className="text-muted-foreground font-normal">
                          ({items.length} {items.length === 1 ? "item" : "items"})
                        </span>
                      </CardTitle>
                    </button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (!isExpanded) toggleExpanded(section.id);
                          startAddItem(section.id);
                        }}
                        disabled={isMutating}
                        title="Add item"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteSection(section.id)}
                        disabled={isMutating}
                        title="Delete section"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-3">
                    {/* Item form (add/edit) */}
                    {editingSectionId === section.id && (
                      <Card className="border-primary/20 bg-muted/30">
                        <CardContent className="pt-4 space-y-3">
                          <p className="text-sm font-medium">
                            {isAddingItem ? "New Item" : "Edit Item"}
                          </p>
                          {itemFields.map((field, fi) => (
                            <div key={fi} className="flex gap-2 items-start">
                              <div className="w-1/3">
                                <Input
                                  placeholder="Field name"
                                  value={field.key}
                                  onChange={(e) =>
                                    updateFieldKey(fi, e.target.value)
                                  }
                                  className="text-sm"
                                />
                              </div>
                              <div className="flex-1">
                                {field.value.length > 80 ||
                                field.key === "description" ? (
                                  <Textarea
                                    placeholder="Value"
                                    value={field.value}
                                    onChange={(e) =>
                                      updateFieldValue(fi, e.target.value)
                                    }
                                    rows={2}
                                    className="text-sm"
                                  />
                                ) : (
                                  <Input
                                    placeholder="Value"
                                    value={field.value}
                                    onChange={(e) =>
                                      updateFieldValue(fi, e.target.value)
                                    }
                                    className="text-sm"
                                  />
                                )}
                              </div>
                              {itemFields.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => removeField(fi)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addField}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add Field
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelItemEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveItem(section)}
                                disabled={isMutating}
                              >
                                {isMutating ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="mr-1 h-3 w-3" />
                                )}
                                Save
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing items */}
                    {items.length === 0 &&
                      editingSectionId !== section.id && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No items yet. Click + to add one.
                        </p>
                      )}

                    {items.map((item, idx) => {
                      const title = item.title ?? item.name ?? item.label;
                      const desc =
                        item.description ?? item.details ?? item.summary;
                      const otherEntries = Object.entries(item).filter(
                        ([k]) =>
                          ![
                            "title",
                            "name",
                            "label",
                            "description",
                            "details",
                            "summary",
                          ].includes(k)
                      );

                      return (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-3 rounded-lg border p-3"
                        >
                          <div className="flex-1 min-w-0 space-y-0.5">
                            {title != null && (
                              <p className="font-medium text-sm">
                                {String(title)}
                              </p>
                            )}
                            {desc != null && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {String(desc)}
                              </p>
                            )}
                            {otherEntries.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {otherEntries.map(([k, v]) =>
                                  v != null && v !== "" ? (
                                    <span
                                      key={k}
                                      className="text-xs bg-muted px-2 py-0.5 rounded"
                                    >
                                      {k}: {String(v)}
                                    </span>
                                  ) : null
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                startEditItem(section.id, idx, item)
                              }
                              disabled={isMutating}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteItem(section, idx)}
                              disabled={isMutating}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

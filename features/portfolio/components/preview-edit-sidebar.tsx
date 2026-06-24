"use client";

import { useState } from "react";
import { Check, Loader2, PanelRightClose, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { EDIT_STEPS, type EditStepValue } from "@/features/portfolio/constants/edit-steps";
import { EditStepContent } from "@/features/portfolio/components/edit-step-content";

export function TemplatePreview({ templateId }: { templateId: string }) {
  const theme: Record<string, string> = {
    minimal: "from-stone-100 to-stone-200",
    modern: "from-violet-500/50 to-cyan-400/40",
    developer: "from-green-500/40 to-emerald-400/30",
    creative: "from-pink-500/40 to-orange-400/30",
    corporate: "from-sky-500/40 to-slate-300/30",
    spotlight: "from-[#fc3]/50 to-[#fbfffe]",
    retro: "from-[#ff90e8]/80 to-[#ffc900]/80",
    bento: "from-zinc-100 to-zinc-200",
    vibrant: "from-fuchsia-600/60 to-cyan-500/60",
    space: "from-[#030014] to-[#0B0F19]",
    windows: "from-[#3a6ea5] to-[#3a6ea5]",
    paper: "from-[#f4f1ea] to-[#e8e4db]",
    cyberpunk: "from-[#050505] to-[#050505]",
    pastel: "from-[#fff5f8] to-[#ffdfba]",
    monochrome: "from-white to-gray-100",
    synthwave: "from-[#120458] to-[#000000]",
    artdeco: "from-[#0b132b] to-[#111c3d]",
    blueprint: "from-[#003366] to-[#002244]",
  };

  return (
    <div className={`aspect-4/3 rounded-xl bg-linear-to-br ${theme[templateId] ?? theme.minimal} p-2`}>
      <div className="h-full rounded-lg border border-white/20 bg-black/10 p-2">
        <div className="h-2 w-12 rounded-full bg-white/40" />
        <div className="mt-2 h-8 rounded-lg bg-white/15" />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="h-8 rounded-lg bg-white/15" />
          <div className="h-8 rounded-lg bg-white/15" />
        </div>
      </div>
    </div>
  );
}

type PreviewEditSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  savedTemplateId?: string;
  isPublished?: boolean;
  hasUnsavedTemplate?: boolean;
  isSavingTemplate?: boolean;
  onTemplateChange?: (templateId: string) => void;
  onTemplateSave?: () => void;
  templateOptions?: any[];
  isTemplateLocked?: (templateId: string) => boolean;
};

function EditorBody({
  activeStep,
  onStepChange,
  onClose,
  templateId,
  savedTemplateId,
  isPublished,
  hasUnsavedTemplate,
  isSavingTemplate,
  onTemplateChange,
  onTemplateSave,
  templateOptions,
  isTemplateLocked,
}: {
  activeStep: EditStepValue;
  onStepChange: (step: EditStepValue) => void;
  onClose?: () => void;
  templateId?: string;
  savedTemplateId?: string;
  isPublished?: boolean;
  hasUnsavedTemplate?: boolean;
  isSavingTemplate?: boolean;
  onTemplateChange?: (templateId: string) => void;
  onTemplateSave?: () => void;
  templateOptions?: any[];
  isTemplateLocked?: (templateId: string) => boolean;
}) {
  const activeStepInfo = EDIT_STEPS.find((step) => step.value === activeStep);

  return (
    <Tabs defaultValue="content" className="flex h-full min-h-0 flex-col bg-transparent text-text-primary">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-default px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5 text-text-muted" aria-hidden />
            <p className="text-body-sm font-semibold text-text-primary">Inspect &amp; edit</p>
          </div>
          <p className="mt-0.5 truncate text-body-sm text-text-muted">
            Live preview stays on canvas
          </p>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close editor"
          >
            <PanelRightClose className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </div>

      <div className="shrink-0 border-b border-border-default px-3 py-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
          <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="content" className="flex min-h-0 flex-1 flex-col m-0 data-[state=inactive]:hidden">
        <div className="shrink-0 border-b border-border-default px-3 py-3">
          <div className="grid grid-cols-4 gap-1.5">
            {EDIT_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.value}
                  type="button"
                  onClick={() => onStepChange(step.value)}
                  aria-pressed={activeStep === step.value}
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-1 rounded-[var(--radius-md)] border px-1.5 py-2 text-[11px] leading-none transition-colors",
                    activeStep === step.value
                      ? "border-transparent bg-brand-light text-brand-primary"
                      : "border-transparent text-text-muted hover:bg-surface-sunken hover:text-text-primary"
                  )}
                  title={step.label}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="max-w-full truncate">{step.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 border-b border-border-default px-4 py-3">
          <p className="text-label uppercase text-text-secondary">Section</p>
          <h2 className="mt-1 text-h4 text-text-primary">{activeStepInfo?.label}</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="preview-edit-form [&_button]:text-xs [&_input]:text-xs [&_textarea]:min-h-20 [&_textarea]:text-xs">
            <EditStepContent step={activeStep} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="design" className="flex min-h-0 flex-1 flex-col m-0 data-[state=inactive]:hidden">
        <div className="shrink-0 border-b border-white/8 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
            Theme Settings
          </p>
          <h2 className="mt-1 text-base font-semibold">Templates</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Preview templates here. Apply one to use it on your portfolio.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {templateOptions && onTemplateChange ? (
            <div className="grid grid-cols-2 gap-3">
              {templateOptions.map((t) => {
                const isPreviewing = templateId === t.id;
                const isSaved = savedTemplateId === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={isTemplateLocked?.(t.id) ?? false}
                    onClick={() => onTemplateChange(t.id)}
                    className={cn(
                      "group relative flex flex-col gap-2 rounded-xl border p-2 text-left transition-all",
                      isPreviewing
                        ? "border-primary bg-primary/5"
                        : "border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5",
                      (isTemplateLocked?.(t.id) ?? false) &&
                        "cursor-not-allowed opacity-50"
                    )}
                  >
                    <TemplatePreview templateId={t.id} />
                    <div className="flex w-full items-center justify-between">
                      <span className="truncate pr-2 text-xs font-medium">
                        {t.name}
                      </span>
                      {isPreviewing ? (
                        <Check className="h-3 w-3 shrink-0 text-primary" />
                      ) : isSaved && isPublished ? (
                        <span className="shrink-0 text-[10px] font-medium text-success">
                          Live
                        </span>
                      ) : isSaved ? (
                        <span className="shrink-0 text-[10px] text-zinc-500">
                          Active
                        </span>
                      ) : isTemplateLocked?.(t.id) ? (
                        <span className="shrink-0 text-[10px] text-zinc-500">
                          PRO
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">
              Templates not available
            </p>
          )}
        </div>
        {hasUnsavedTemplate && onTemplateSave ? (
          <div className="shrink-0 border-t border-white/8 p-3">
            <Button
              type="button"
              className="w-full rounded-full"
              onClick={onTemplateSave}
              disabled={isSavingTemplate}
            >
              {isSavingTemplate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isPublished ? (
                "Apply & go live"
              ) : (
                "Apply template"
              )}
            </Button>
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}

export function PreviewEditSidebar({ 
  open, 
  onOpenChange,
  templateId,
  savedTemplateId,
  isPublished,
  hasUnsavedTemplate,
  isSavingTemplate,
  onTemplateChange,
  onTemplateSave,
  templateOptions,
  isTemplateLocked
}: PreviewEditSidebarProps) {
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState<EditStepValue>("basic");

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full glass-modal p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Edit portfolio</SheetTitle>
          </SheetHeader>
          <EditorBody
            activeStep={activeStep}
            onStepChange={setActiveStep}
            onClose={() => onOpenChange(false)}
            templateId={templateId}
            savedTemplateId={savedTemplateId}
            isPublished={isPublished}
            hasUnsavedTemplate={hasUnsavedTemplate}
            isSavingTemplate={isSavingTemplate}
            onTemplateChange={onTemplateChange}
            onTemplateSave={onTemplateSave}
            templateOptions={templateOptions}
            isTemplateLocked={isTemplateLocked}
          />
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) return null;

  return (
    <aside className="glass-panel hidden h-full w-full shrink-0 flex-col overflow-hidden xl:ml-4 xl:flex xl:w-80">
      <EditorBody
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onClose={() => onOpenChange(false)}
        templateId={templateId}
        savedTemplateId={savedTemplateId}
        isPublished={isPublished}
        hasUnsavedTemplate={hasUnsavedTemplate}
        isSavingTemplate={isSavingTemplate}
        onTemplateChange={onTemplateChange}
        onTemplateSave={onTemplateSave}
        templateOptions={templateOptions}
        isTemplateLocked={isTemplateLocked}
      />
    </aside>
  );
}

export function PreviewEditToggle({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={open ? "default" : "outline"}
      onClick={() => onOpenChange(!open)}
    >
      {open ? (
        <PanelRightClose className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Pencil className="h-3.5 w-3.5" aria-hidden />
      )}
      {open ? "Close editor" : "Edit"}
    </Button>
  );
}

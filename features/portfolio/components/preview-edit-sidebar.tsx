"use client";

import { useState } from "react";
import { PanelRightClose, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { EDIT_STEPS, type EditStepValue } from "@/features/portfolio/constants/edit-steps";
import { EditStepContent } from "@/features/portfolio/components/edit-step-content";

type PreviewEditSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EditorBody({
  activeStep,
  onStepChange,
  onClose,
}: {
  activeStep: EditStepValue;
  onStepChange: (step: EditStepValue) => void;
  onClose?: () => void;
}) {
  const activeStepInfo = EDIT_STEPS.find((step) => step.value === activeStep);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#090b12] text-zinc-100">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Pencil className="h-3.5 w-3.5 text-zinc-500" />
            <p className="text-sm font-semibold">Inspect & Edit</p>
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            Live preview stays on canvas
          </p>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0 rounded-lg text-zinc-400 hover:bg-white/8 hover:text-zinc-100"
            aria-label="Close editor"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="shrink-0 border-b border-white/8 px-3 py-3">
        <div className="grid grid-cols-4 gap-1.5">
          {EDIT_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.value}
                type="button"
                onClick={() => onStepChange(step.value)}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1.5 py-2 text-[11px] leading-none transition-colors",
                  activeStep === step.value
                    ? "border-white/12 bg-white/12 text-zinc-50"
                    : "border-transparent text-zinc-500 hover:bg-white/6 hover:text-zinc-200"
                )}
                title={step.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="max-w-full truncate">{step.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 border-b border-white/8 px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-600">
          Section
        </p>
        <h2 className="mt-1 text-base font-semibold">{activeStepInfo?.label}</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="preview-edit-form **:data-[slot=card]:gap-4 **:data-[slot=card]:rounded-xl **:data-[slot=card]:border-white/8 **:data-[slot=card]:bg-white/3 **:data-[slot=card]:py-4 **:data-[slot=card-content]:px-4 **:data-[slot=card-description]:text-xs **:data-[slot=card-header]:gap-1 **:data-[slot=card-header]:px-4 **:data-[slot=card-title]:text-base [&_button]:h-9 [&_input]:h-9 [&_label]:text-xs [&_textarea]:min-h-24">
          <EditStepContent step={activeStep} />
        </div>
      </div>
    </div>
  );
}

export function PreviewEditSidebar({ open, onOpenChange }: PreviewEditSidebarProps) {
  const isMobile = useIsMobile();
  const [activeStep, setActiveStep] = useState<EditStepValue>("basic");

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full border-white/8 bg-[#090b12] p-0 sm:max-w-md"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Edit portfolio</SheetTitle>
          </SheetHeader>
          <EditorBody
            activeStep={activeStep}
            onStepChange={setActiveStep}
            onClose={() => onOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  if (!open) return null;

  return (
    <aside className="sticky top-20 ml-4 h-[calc(100vh-6rem)] w-100 shrink-0 self-start overflow-hidden rounded-[1.25rem] border border-white/8 bg-[#090b12]/95 shadow-2xl backdrop-blur-xl">
      <EditorBody
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onClose={() => onOpenChange(false)}
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
      className={
        open
          ? "rounded-full"
          : "rounded-full border-white/8 bg-white/4 text-zinc-200"
      }
    >
      {open ? (
        <PanelRightClose className="mr-2 h-4 w-4" />
      ) : (
        <Pencil className="mr-2 h-4 w-4" />
      )}
      {open ? "Close Editor" : "Edit"}
    </Button>
  );
}

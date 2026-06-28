"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { EditUnsavedBadge } from "@/features/portfolio/components/edit-unsaved-badge";

type FieldLabelProps = React.ComponentProps<typeof Label> & {
  unsaved?: boolean;
};

export function FieldLabel({
  unsaved = false,
  className,
  children,
  ...props
}: FieldLabelProps) {
  return (
    <div className="flex min-h-[22px] items-center gap-2">
      <Label className={cn("min-w-0", className)} {...props}>
        {children}
      </Label>
      {unsaved ? <EditUnsavedBadge className="shrink-0" /> : null}
    </div>
  );
}

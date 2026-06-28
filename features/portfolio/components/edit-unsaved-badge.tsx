import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EditUnsavedBadgeProps = {
  className?: string;
};

export function EditUnsavedBadge({ className }: EditUnsavedBadgeProps) {
  return (
    <Badge
      variant="warning"
      className={cn(
        "h-5 px-1.5 py-0 font-sans text-[10px] font-medium normal-case tracking-normal",
        className
      )}
    >
      Unsaved
    </Badge>
  );
}

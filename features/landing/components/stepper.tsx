"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "complete" | "active" | "inactive";

const STEPS = ["Upload", "Generate", "Publish"] as const;

/**
 * Horizontal 3-step progress stepper (Upload → Generate → Publish).
 * `current` is the zero-based index of the active step.
 */
export function Stepper({
  current,
  className,
}: {
  current: number;
  className?: string;
}) {
  return (
    <ol
      className={cn("flex w-full items-center", className)}
      aria-label="Progress"
    >
      {STEPS.map((label, i) => {
        const state: StepState =
          i < current ? "complete" : i === current ? "active" : "inactive";
        const isLast = i === STEPS.length - 1;

        return (
          <li
            key={label}
            className={cn("flex items-center", !isLast && "flex-1")}
            aria-current={state === "active" ? "step" : undefined}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors duration-200",
                  state === "complete" &&
                    "border-success bg-success text-white",
                  state === "active" &&
                    "border-brand-primary bg-brand-primary text-white",
                  state === "inactive" &&
                    "border-border-default bg-surface-base text-text-muted"
                )}
              >
                {state === "complete" ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "text-[14px] font-medium",
                  state === "inactive"
                    ? "text-text-muted"
                    : "text-text-primary"
                )}
              >
                {label}
              </span>
            </div>

            {!isLast && (
              <span
                className={cn(
                  "mx-3 h-px flex-1 transition-colors duration-300",
                  i < current ? "bg-brand-primary" : "bg-border-default"
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

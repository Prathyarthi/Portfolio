import { formatInr, formatUsd, type PlanAmount } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface PlanPriceProps {
  amount: PlanAmount;
  period?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function PlanPrice({
  amount,
  period,
  size = "lg",
  className,
}: PlanPriceProps) {
  const primarySize =
    size === "lg" ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl";
  const secondarySize =
    size === "lg" ? "text-2xl md:text-3xl" : "text-xl md:text-2xl";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      <span
        className={cn("gradient-text font-bold tabular-nums", primarySize)}
      >
        {formatUsd(amount.usd)}
      </span>
      <span
        className={cn(
          "font-semibold tabular-nums text-zinc-400",
          secondarySize,
        )}
      >
        {formatInr(amount.inr)}
      </span>
      {period ? (
        <span className="text-sm text-zinc-500">{period}</span>
      ) : null}
    </div>
  );
}
